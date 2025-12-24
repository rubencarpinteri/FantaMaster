
import { Match, TeamStats, SchedinaSubmission, SchedinaLeaderboardRow, LegacySchedineData, SchedineAdjustment, RivalryType } from '../types';

export const parseCSV = (csvText: string): Match[] => {
  const lines = csvText.trim().split('\n');
  const matches: Match[] = [];
  
  let currentMatchday = 0;

  // Helper to check if a string is a valid number
  const isNumeric = (str: string) => {
    if (typeof str !== 'string') return false;
    const normalized = str.replace(',', '.');
    return !isNaN(parseFloat(normalized)) && isFinite(Number(normalized));
  };
  
  const parseNum = (str: string): number => {
      return parseFloat(str.replace(',', '.'));
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Split by comma, semicolon, or tab
    const parts = line.split(/[;,\t]/).map(p => p.trim()).filter(p => p !== '');
    
    if (parts.length === 0) continue;
    
    // Ensure the line starts with a number (Matchday)
    if (!isNumeric(parts[0])) continue;

    // Check if this line is just an empty data row with zeros
    const allZerosOrEmpty = parts.every(p => p === '' || p === '0' || p === '0.0' || p === '0,0');
    if (allZerosOrEmpty) continue;

    // Identify indices of strings (potential teams) and numbers
    const numberIndices: number[] = [];
    const stringIndices: number[] = [];
    
    parts.forEach((p, idx) => {
      if (isNumeric(p)) {
        numberIndices.push(idx);
      } else {
        // Strict filter for team names
        if (!['matchday', 'home', 'away', 'score', 'result', 'null', 'undefined', '-'].includes(p.toLowerCase()) && !p.match(/^\d+-\d+$/)) {
            stringIndices.push(idx);
        }
      }
    });

    if (stringIndices.length < 2) {
        if (numberIndices.includes(0)) {
            currentMatchday = Math.floor(parseNum(parts[0]));
        }
        continue; 
    }

    // Identify Matchday
    if (numberIndices.includes(0)) {
        currentMatchday = Math.floor(parseNum(parts[0]));
    }
    
    if (currentMatchday === 0) continue;

    // Identify Teams
    const homeTeamIdx = stringIndices[0];
    const awayTeamIdx = stringIndices[stringIndices.length - 1];
    
    if (homeTeamIdx === awayTeamIdx) continue;

    const homeTeam = parts[homeTeamIdx];
    const awayTeam = parts[awayTeamIdx];

    // Identify Scores and Points
    // Expected order in CSV: Matchday, HomeTeam, HomeFP, HomeGoals, AwayGoals, AwayFP, AwayTeam...
    const innerNumbers = numberIndices.filter(idx => idx > homeTeamIdx && idx < awayTeamIdx);
    
    let homeScore: number | null = null;
    let awayScore: number | null = null;
    let homeFP: number | null = null;
    let awayFP: number | null = null;
    let isPlayed = false;

    if (innerNumbers.length >= 4) {
        // Full data: HomeFP, HomeGoals, AwayGoals, AwayFP
        // Typically indices: 0->HomeFP, 1->HomeGoals, 2->AwayGoals, 3->AwayFP
        homeFP = parseNum(parts[innerNumbers[0]]);
        homeScore = parseNum(parts[innerNumbers[1]]);
        awayScore = parseNum(parts[innerNumbers[2]]);
        awayFP = parseNum(parts[innerNumbers[3]]);
        
        if (homeScore !== null && awayScore !== null) {
            isPlayed = true;
        }
    } else if (innerNumbers.length === 2) {
        // Just Goals? Or Just FP? Assuming Goals for backwards compatibility if CSV is simple
        homeScore = parseNum(parts[innerNumbers[0]]);
        awayScore = parseNum(parts[innerNumbers[1]]);
        if (homeScore !== null && awayScore !== null) {
             isPlayed = true;
             // approximate FP as goals if missing (fallback)
             homeFP = homeScore;
             awayFP = awayScore;
        }
    }

    matches.push({
        id: `m-${matches.length + 1}`,
        matchday: currentMatchday,
        homeTeam,
        awayTeam,
        homeScore: isPlayed ? homeScore : null,
        awayScore: isPlayed ? awayScore : null,
        homeFantasyPoints: isPlayed ? homeFP : null,
        awayFantasyPoints: isPlayed ? awayFP : null,
        isPlayed
    });
  }

  return matches;
};

// Round Robin Schedule Generator
export const generateSchedule = (teamNames: string[]): Match[] => {
  const matches: Match[] = [];
  const teams = [...teamNames];
  
  if (teams.length % 2 !== 0) {
    teams.push("BYE");
  }

  const n = teams.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;

  let currentTeams = [...teams];
  
  const leg1: { md: number, home: string, away: string }[] = [];

  for (let round = 0; round < rounds; round++) {
    for (let i = 0; i < matchesPerRound; i++) {
      const home = currentTeams[i];
      const away = currentTeams[n - 1 - i];
      if (home !== "BYE" && away !== "BYE") {
        leg1.push({ md: round + 1, home, away });
      }
    }
    
    const fixed = currentTeams[0];
    const rotated = [fixed, ...currentTeams.slice(1)];
    const last = rotated.pop();
    if (last) rotated.splice(1, 0, last);
    currentTeams = rotated;
  }

  let matchIdCounter = 1;

  const createMatch = (md: number, h: string, a: string) => ({
    id: `auto-${matchIdCounter++}`,
    matchday: md,
    homeTeam: h,
    awayTeam: a,
    homeScore: null,
    awayScore: null,
    homeFantasyPoints: null,
    awayFantasyPoints: null,
    isPlayed: false
  });

  leg1.forEach(m => matches.push(createMatch(m.md, m.home, m.away)));
  leg1.forEach(m => matches.push(createMatch(m.md + rounds, m.away, m.home)));
  leg1.forEach(m => matches.push(createMatch(m.md + rounds * 2, m.home, m.away)));
  leg1.forEach(m => matches.push(createMatch(m.md + rounds * 3, m.away, m.home)));

  return matches.sort((a, b) => a.matchday - b.matchday);
};

const initializeStats = (teams: Set<string>): Map<string, TeamStats> => {
  const stats = new Map<string, TeamStats>();
  teams.forEach(team => {
    stats.set(team, {
      rank: 0,
      team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      points: 0,
      totalFP: 0,
      form: []
    });
  });
  return stats;
};

export const calculateCampionato = (matches: Match[]): TeamStats[] => {
  const teams = new Set<string>();
  matches.forEach(m => {
    teams.add(m.homeTeam);
    teams.add(m.awayTeam);
  });

  const stats = initializeStats(teams);

  // We need to process matches in order to build the form correctly
  const sortedMatches = [...matches].sort((a, b) => a.matchday - b.matchday);

  sortedMatches.forEach(match => {
    if (!match.isPlayed || match.homeScore === null || match.awayScore === null) return;

    const home = stats.get(match.homeTeam)!;
    const away = stats.get(match.awayTeam)!;

    home.played++;
    away.played++;
    home.gf += match.homeScore;
    home.ga += match.awayScore;
    away.gf += match.awayScore;
    away.ga += match.homeScore;
    
    home.totalFP += match.homeFantasyPoints || 0;
    away.totalFP += match.awayFantasyPoints || 0;

    const hScoreStr = `${match.homeScore}-${match.awayScore}`;
    const aScoreStr = `${match.awayScore}-${match.homeScore}`;

    if (match.homeScore > match.awayScore) {
      home.won++;
      home.points += 3;
      away.lost++;
      home.form.push({ result: 'W', opponent: match.awayTeam, score: hScoreStr });
      away.form.push({ result: 'L', opponent: match.homeTeam, score: aScoreStr });
    } else if (match.homeScore < match.awayScore) {
      away.won++;
      away.points += 3;
      home.lost++;
      away.form.push({ result: 'W', opponent: match.homeTeam, score: aScoreStr });
      home.form.push({ result: 'L', opponent: match.awayTeam, score: hScoreStr });
    } else {
      home.drawn++;
      away.drawn++;
      home.points += 1;
      away.points += 1;
      home.form.push({ result: 'D', opponent: match.awayTeam, score: hScoreStr });
      away.form.push({ result: 'D', opponent: match.homeTeam, score: aScoreStr });
    }
  });

  return Array.from(stats.values()).map(s => ({
    ...s,
    gd: s.gf - s.ga
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.totalFP !== a.totalFP) return b.totalFP - a.totalFP;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  }).map((s, i) => ({ ...s, rank: i + 1 }));
};

export const calculateBattleRoyale = (matches: Match[]): TeamStats[] => {
  const teams = new Set<string>();
  matches.forEach(m => {
    teams.add(m.homeTeam);
    teams.add(m.awayTeam);
  });

  const stats = initializeStats(teams);
  
  const matchdays = new Map<number, { team: string, score: number, fp: number }[]>();
  
  matches.forEach(match => {
    if (!match.isPlayed || match.homeScore === null || match.awayScore === null) return;
    
    if (!matchdays.has(match.matchday)) {
      matchdays.set(match.matchday, []);
    }
    matchdays.get(match.matchday)!.push({ team: match.homeTeam, score: match.homeScore, fp: match.homeFantasyPoints || 0 });
    matchdays.get(match.matchday)!.push({ team: match.awayTeam, score: match.awayScore, fp: match.awayFantasyPoints || 0 });
  });

  matchdays.forEach((performances) => {
    for (let i = 0; i < performances.length; i++) {
      const teamA = performances[i];
      const statsA = stats.get(teamA.team)!;
      
      statsA.played += 1; 
      statsA.totalFP += teamA.fp;

      for (let j = 0; j < performances.length; j++) {
        if (i === j) continue;
        
        const teamB = performances[j];
        
        if (teamA.score > teamB.score) {
          statsA.won++;
          statsA.points += 3;
        } else if (teamA.score < teamB.score) {
          statsA.lost++;
        } else {
          statsA.drawn++;
          statsA.points += 1;
        }
      }
    }
  });

  return Array.from(stats.values()).map(s => ({
    ...s,
    gd: 0 
  })).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.totalFP !== a.totalFP) return b.totalFP - a.totalFP;
    return b.won - a.won;
  }).map((s, i) => ({ ...s, rank: i + 1 }));
};

// RIVALRY HELPERS
export const getRivalryStatus = (matches: Match[], subject: string, opponent: string): RivalryType => {
  const history = matches.filter(m => 
      m.isPlayed && 
      ((m.homeTeam === subject && m.awayTeam === opponent) || 
       (m.homeTeam === opponent && m.awayTeam === subject))
  );

  if (history.length === 0) return null;

  let wins = 0;
  let draws = 0;
  
  history.forEach(m => {
      const isSubjectHome = m.homeTeam === subject;
      const subjectScore = isSubjectHome ? m.homeScore! : m.awayScore!;
      const opponentScore = isSubjectHome ? m.awayScore! : m.homeScore!;

      if (subjectScore > opponentScore) wins++;
      else if (subjectScore === opponentScore) draws++;
  });

  if (wins === 0) return 'nemesis';
  if (wins === history.length) return 'ez';
  if (draws === history.length) return 'rival';

  return null;
};

export const getH2HDescription = (matches: Match[], teamA: string, teamB: string): string => {
  const history = matches.filter(m =>
      m.isPlayed &&
      ((m.homeTeam === teamA && m.awayTeam === teamB) ||
       (m.homeTeam === teamB && m.awayTeam === teamA))
  );

  const total = history.length;
  if (total === 0) return "Nessun precedente tra le due squadre.";

  let winsA = 0;
  let winsB = 0;
  let draws = 0;

  history.forEach(m => {
      const isHomeA = m.homeTeam === teamA;
      const scoreA = isHomeA ? m.homeScore! : m.awayScore!;
      const scoreB = isHomeA ? m.awayScore! : m.homeScore!;

      if (scoreA > scoreB) winsA++;
      else if (scoreB > scoreA) winsB++;
      else draws++;
  });

  if (winsA === 0 && winsB > 0) return `${teamA} non ha mai vinto contro ${teamB} (${winsB} sconfitte su ${total}).`;
  if (winsB === 0 && winsA > 0) return `${teamB} non ha mai vinto contro ${teamA} (${winsA} sconfitte su ${total}).`;
  if (draws === total) return "Le 2 squadre hanno pareggiato in ogni occasione.";
  if (winsA === total) return `${teamA} ha vinto tutti i ${total} precedenti contro ${teamB}.`; // EZ Win variant
  if (winsB === total) return `${teamB} ha vinto tutti i ${total} precedenti contro ${teamA}.`;

  // General Case
  return `${total} precedenti: ${winsA} vittorie ${teamA}, ${draws} pareggi${draws === 1 ? 'o' : ''}, ${winsB} vittorie ${teamB}.`;
};

export const getHeadToHeadHistory = (matches: Match[], teamA: string, teamB: string) => {
  return matches.filter(m => 
      m.isPlayed && 
      ((m.homeTeam === teamA && m.awayTeam === teamB) || 
       (m.homeTeam === teamB && m.awayTeam === teamA))
  ).sort((a, b) => a.matchday - b.matchday);
};

// SCHEDINE HELPERS
export const calculateSchedineLeaderboard = (
  matches: Match[], 
  submissions: SchedinaSubmission[], 
  legacyData: LegacySchedineData,
  adjustments: SchedineAdjustment
): SchedinaLeaderboardRow[] => {
  const userStats = new Map<string, { total: number, perfect: number, lastWeek: number }>();

  // Initialize with legacy data
  Object.entries(legacyData).forEach(([team, stats]) => {
    userStats.set(team, { 
      total: stats.totalCorrect, 
      perfect: stats.perfectWeeks, 
      lastWeek: 0
    });
  });

  // Ensure all current teams are in map
  const allTeams = new Set(matches.flatMap(m => [m.homeTeam, m.awayTeam]));
  allTeams.forEach(team => {
    if (!userStats.has(team)) {
      userStats.set(team, { total: 0, perfect: 0, lastWeek: 0 });
    }
  });

  // Apply Manual Adjustments
  Object.entries(adjustments).forEach(([team, adj]) => {
      if (userStats.has(team)) {
          const stats = userStats.get(team)!;
          stats.total += adj.extraCorrect;
          stats.perfect += adj.extraPerfect;
      }
  });

  // Group submissions by matchday to calculate perfect weeks
  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const lastCompletedMD = playedMatchdays.length > 0 ? Math.max(...playedMatchdays) : 0;

  submissions.forEach(sub => {
    const stats = userStats.get(sub.teamName)!;
    let mdCorrect = 0;
    let mdTotal = 0;

    sub.predictions.forEach(pred => {
      const match = matches.find(m => m.id === pred.matchId);
      if (match && match.isPlayed && match.homeScore !== null && match.awayScore !== null) {
        mdTotal++;
        let result: '1' | 'X' | '2';
        if (match.homeScore > match.awayScore) result = '1';
        else if (match.homeScore < match.awayScore) result = '2';
        else result = 'X';

        if (result === pred.prediction) {
          stats.total++;
          mdCorrect++;
        }
      }
    });

    // Check perfect week (assuming 5 matches per week)
    if (mdTotal === 5 && mdCorrect === 5) {
      stats.perfect++;
    }

    // Update Last Week score if this is the relevant MD
    if (sub.matchday === lastCompletedMD) {
      stats.lastWeek = mdCorrect;
    }
  });

  return Array.from(userStats.entries()).map(([teamName, stats]) => ({
    rank: 0,
    teamName,
    totalCorrect: stats.total,
    perfectWeeks: stats.perfect,
    lastWeekCorrect: stats.lastWeek
  })).sort((a, b) => {
    if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
    return b.perfectWeeks - a.perfectWeeks;
  }).map((row, i) => ({ ...row, rank: i + 1 }));
};
