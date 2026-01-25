import React, { useState, useEffect, useMemo } from 'react';
import { Match, DEFAULT_TEAMS, Prediction, SchedinaSubmission, LegacySchedineData, SchedineAdjustment, SchedinaLeaderboardRow } from '../types';
import { getH2HDescription, calculateSchedineLeaderboard } from '../services/leagueService';
import { Trophy, LogOut, Sparkles, Snowflake, Send, ListChecks, Medal, Clock, Lightbulb, TrendingUp, History, ChevronLeft, ChevronRight, Ticket, Globe, User } from 'lucide-react';
import { SoccerBallIcon } from '../App';

interface SchedineProps {
  matches: Match[];
  legacyData: LegacySchedineData;
  adjustments: SchedineAdjustment;
  submissions: SchedinaSubmission[];
  frozenMatchdays: number[];
  onSubmit: (submission: SchedinaSubmission) => void;
}

const TEAM_ALIASES: Record<string, string> = {
  'PRONOSTICI': 'PRONOSTICI', 'PRO': 'PRONOSTICI', 'PRONO': 'PRONOSTICI', 
  'SQUADRADABBATTERE': 'SQUADRADABBATTERE', 'UDB': 'SQUADRADABBATTERE', 'UOMODABBATTERE': 'SQUADRADABBATTERE', 'SDB': 'SQUADRADABBATTERE',
  'PFP': 'PFP', 'ROSAPROFONDA': 'PFP', 'ROS': 'PFP', 
  'OFF': 'OFF',
  'ISAMU': 'ISAMU', 'ISA': 'ISAMU',
  'SPIAZE': 'SPIAZE', 'SPIA': 'SPIAZE', 'SPI': 'SPIAZE',
  'HORTO': 'HORTO', 'HOR': 'HORTO', 'HM': 'HORTO',
  'SATANIA': 'SATANIA', 'SAT': 'SATANIA',
  'NINUZZO': 'NINUZZO', 'NINO': 'NINUZZO', 'NIN': 'NINUZZO', 'CRO': 'NINUZZO',
  'SAYONARA': 'SAYONARA', 'SAYO': 'SAYONARA', 'SAY': 'SAYONARA', 'NARA': 'SAYONARA'
};

const USER_STORAGE_KEY = 'fantasy_schedine_user_v1';

export const Schedine: React.FC<SchedineProps> = ({ matches, legacyData, adjustments, submissions, frozenMatchdays, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard' | 'history'>('play');
  const [historyMatchday, setHistoryMatchday] = useState<number>(1);
  
  // Initialize currentUser synchronously from localStorage to prevent the "login flash" bug.
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
      if (typeof window === 'undefined') return null;
      const savedUser = localStorage.getItem(USER_STORAGE_KEY);
      return (savedUser && DEFAULT_TEAMS.includes(savedUser)) ? savedUser : null;
  });
  
  const [loginError, setLoginError] = useState('');
  const [currentPredictions, setCurrentPredictions] = useState<Record<string, '1' | 'X' | '2'>>({});

  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const maxMilestone = Math.max(0, ...playedMatchdays, ...frozenMatchdays);
  const nextMatchday = maxMilestone < 38 ? maxMilestone + 1 : 38;
  const nextMatches = matches.filter(m => m.matchday === nextMatchday);
  
  // Live Feed Submissions
  const currentWeekSubmissions = submissions
    .filter(s => s.matchday === nextMatchday)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Init history matchday to last played or 1
  useEffect(() => {
     if (activeTab === 'history') {
         setHistoryMatchday(maxMilestone > 0 ? maxMilestone : 1);
     }
  }, [activeTab, maxMilestone]);

  const curiosities = useMemo(() => {
    if (currentWeekSubmissions.length < 2) return [];
    const results: string[] = [];
    nextMatches.forEach(match => {
      const matchSubs = currentWeekSubmissions.flatMap(s => s.predictions.filter(p => p.matchId === match.id));
      const counts = { '1': 0, 'X': 0, '2': 0 };
      matchSubs.forEach(p => counts[p.prediction]++);
      const total = matchSubs.length;
      if (total === 0) return;
      
      if (counts['X'] === total && total >= 2) results.push(`Tutti credono nel pareggio tra ${match.homeTeam} e ${match.awayTeam}`);
      if (counts['X'] === 0 && total >= 2) results.push(`Nessuno crede nel pareggio tra ${match.homeTeam} e ${match.awayTeam}`);
      
      if (counts['1'] === 0 && total >= 2) results.push(`Nessuno crede nella vittoria di ${match.homeTeam}`);
      if (counts['2'] === 0 && total >= 2) results.push(`Nessuno crede nella vittoria di ${match.awayTeam}`);
    });
    return results;
  }, [currentWeekSubmissions, nextMatches]);

  const leaderboard: SchedinaLeaderboardRow[] = useMemo(() => calculateSchedineLeaderboard(matches, submissions, legacyData, adjustments), [matches, submissions, legacyData, adjustments]);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const rawInput = (e.target as any).username.value.trim().toUpperCase();
      const canonicalName = TEAM_ALIASES[rawInput] || rawInput;
      if (DEFAULT_TEAMS.includes(canonicalName)) {
          setCurrentUser(canonicalName);
          localStorage.setItem(USER_STORAGE_KEY, canonicalName);
          setLoginError('');
      } else {
          setLoginError(`'${rawInput}' non trovato.`);
      }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentPredictions({});
  };

  const handlePrediction = (matchId: string, value: '1' | 'X' | '2') => {
      setCurrentPredictions(prev => ({ ...prev, [matchId]: value }));
  };

  const handleSubmit = () => {
      if (!currentUser) return;
      if (Object.keys(currentPredictions).length < nextMatches.length) {
          alert("Inserisci tutti i pronostici!");
          return;
      }
      const predictionList: Prediction[] = Object.entries(currentPredictions).map(([id, val]) => ({
          matchId: id,
          prediction: val as '1' | 'X' | '2'
      }));
      onSubmit({ teamName: currentUser, matchday: nextMatchday, predictions: predictionList, timestamp: new Date().toISOString() });
      alert("Pronostici inviati!");
  };

  // History Tab Helpers
  const historyMatches = matches.filter(m => m.matchday === historyMatchday);
  const historySubmissions = submissions.filter(s => s.matchday === historyMatchday);
  
  const getMatchResult = (match: Match): '1' | 'X' | '2' | null => {
      if (!match.isPlayed || match.homeScore === null || match.awayScore === null) return null;
      if (match.homeScore > match.awayScore) return '1';
      if (match.homeScore < match.awayScore) return '2';
      return 'X';
  };

  const { matchdayCuriosities, seasonalCuriosities, globalSeasonalCuriosities } = useMemo<{
    matchdayCuriosities: string[];
    seasonalCuriosities: Record<string, string[]>;
    globalSeasonalCuriosities: string[];
  }>(() => {
      // --- 1. MATCHDAY SPECIFIC CURIOSITIES ---
      const mdResults: string[] = [];
      if (historySubmissions.length > 1) {
          historyMatches.forEach(match => {
              const result = getMatchResult(match);
              if (!result) return;
              
              const matchPreds = historySubmissions.map(s => ({
                  user: s.teamName,
                  prediction: s.predictions.find(p => p.matchId === match.id)?.prediction
              }));
              
              const correctPreds = matchPreds.filter(p => p.prediction === result);
              const correctCount = correctPreds.length;
              const total = historySubmissions.length;

              if (correctCount === total) {
                  mdResults.push(`Tutti hanno indovinato l'esito di ${match.homeTeam}-${match.awayTeam}`);
              } else if (correctCount === 0) {
                  mdResults.push(`Nessuno ha indovinato il match tra ${match.homeTeam} e ${match.awayTeam}`);
              } else if (correctCount === 1) {
                  // Only one winner
                  const winner = correctPreds[0].user;
                  mdResults.push(`Solo ${winner} ha indovinato il match tra ${match.homeTeam} e ${match.awayTeam}`);
              }
          });
      }

      // --- 2. GLOBAL SEASONAL STATS ---
      // Which team is easiest/hardest to predict?
      const teamPredictability: Record<string, { total: number, correct: number }> = {};
      
      const updatePredictability = (team: string, isCorrect: boolean) => {
          if (!teamPredictability[team]) teamPredictability[team] = { total: 0, correct: 0 };
          teamPredictability[team].total++;
          if (isCorrect) teamPredictability[team].correct++;
      };

      // --- 3. PER-USER SEASONAL RIVALRIES ---
      const userTeamStats: Record<string, Record<string, { total: number, correct: number }>> = {};
      
      // Init user stats
      DEFAULT_TEAMS.forEach(user => {
          userTeamStats[user] = {};
          DEFAULT_TEAMS.forEach(target => {
              if (user !== target) userTeamStats[user][target] = { total: 0, correct: 0 };
          });
      });

      // Iterate ALL submissions for seasonal data
      submissions.forEach(sub => {
          sub.predictions.forEach(pred => {
              const match = matches.find(m => m.id === pred.matchId);
              if (match && match.isPlayed && match.homeScore !== null) {
                  const result = getMatchResult(match);
                  if (result) {
                    const isCorrect = pred.prediction === result;
                    
                    // Update Global Team Predictability
                    updatePredictability(match.homeTeam, isCorrect);
                    updatePredictability(match.awayTeam, isCorrect);

                    // Update User Stats (Home)
                    if (match.homeTeam !== sub.teamName && userTeamStats[sub.teamName]?.[match.homeTeam]) {
                        userTeamStats[sub.teamName][match.homeTeam].total++;
                        if (isCorrect) userTeamStats[sub.teamName][match.homeTeam].correct++;
                    }
                    // Update User Stats (Away)
                    if (match.awayTeam !== sub.teamName && userTeamStats[sub.teamName]?.[match.awayTeam]) {
                        userTeamStats[sub.teamName][match.awayTeam].total++;
                        if (isCorrect) userTeamStats[sub.teamName][match.awayTeam].correct++;
                    }
                  }
              }
          });
      });

      // Generate Global Strings
      const globalResults: string[] = [];
      let easiestTeam = { name: '', acc: -1 };
      let hardestTeam = { name: '', acc: 2 }; // > 1 start

      Object.entries(teamPredictability).forEach(([team, stats]) => {
          if (stats.total < 5) return; // Min sample size
          const acc = stats.correct / stats.total;
          if (acc > easiestTeam.acc) easiestTeam = { name: team, acc };
          if (acc < hardestTeam.acc) hardestTeam = { name: team, acc };
      });

      if (easiestTeam.name) {
          globalResults.push(`La squadra pronosticata più facilmente è ${easiestTeam.name} (${(easiestTeam.acc * 100).toFixed(0)}%)`);
      }
      if (hardestTeam.name) {
           globalResults.push(`Da inizio anno, gli esiti della squadra meno indovinata sono di ${hardestTeam.name} (${(hardestTeam.acc * 100).toFixed(0)}%)`);
      }

      // Generate User Strings
      const userResults: Record<string, string[]> = {};
      Object.entries(userTeamStats).forEach(([user, targets]) => {
          const userFacts: string[] = [];
          Object.entries(targets).forEach(([target, stat]) => {
              if (stat.total >= 4) { // Threshold to be significant
                  if (stat.correct === stat.total) userFacts.push(`Cecchino su ${target} (${stat.total}/${stat.total})`);
                  if (stat.correct === 0) userFacts.push(`Non ha mai indovinato un match di ${target} (0/${stat.total})`);
              }
          });
          if (userFacts.length > 0) {
              userResults[user] = userFacts;
          }
      });
      
      return { 
          matchdayCuriosities: mdResults, 
          seasonalCuriosities: userResults,
          globalSeasonalCuriosities: globalResults
      };

  }, [historyMatches, historySubmissions, matches, submissions]);

  if (!currentUser) {
      return (
          <div className="fixed inset-0 flex justify-center items-start pt-48 px-4 bg-[#F8F9FB] dark:bg-brand-base overflow-hidden touch-none z-[70] select-none">
             <div className="bg-white dark:bg-brand-card p-10 md:p-14 rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-gray-100 dark:border-white/10 w-full max-w-sm text-center animate-fadeIn relative overflow-visible">
                 <div className="absolute inset-0 rounded-[3rem] grain pointer-events-none opacity-20"></div>
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-brand-accent rounded-[2rem] flex items-center justify-center shadow-glow-blue border-4 border-white dark:border-brand-card grain z-20">
                    <div className="text-white">
                        <SoccerBallIcon size={48} />
                    </div>
                 </div>
                 <div className="mt-12 mb-10 relative z-10">
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Accesso</h2>
                    <p className="text-brand-accent text-[11px] font-black uppercase tracking-[0.3em] mt-3 opacity-80">FantaWizz CTA</p>
                 </div>
                 <form onSubmit={handleLogin} className="flex flex-col gap-6 relative z-10">
                    <div className="relative">
                        <input 
                            name="username" 
                            type="text" 
                            autoFocus 
                            placeholder="NOME SQUADRA" 
                            className="w-full bg-slate-50 dark:bg-brand-base border-2 border-slate-100 dark:border-white/5 rounded-2xl px-6 py-5 text-center font-black text-slate-900 dark:text-white outline-none focus:border-brand-accent focus:ring-4 focus:ring-brand-accent/10 uppercase placeholder:text-slate-300/30 dark:placeholder:text-slate-600/30 transition-all text-lg" 
                        />
                        {loginError && (
                            <div className="absolute -bottom-6 left-0 right-0">
                                <p className="text-brand-danger text-[10px] font-black uppercase tracking-widest animate-bounce">{loginError}</p>
                            </div>
                        )}
                    </div>
                    <button 
                        type="submit" 
                        className="bg-brand-accent hover:bg-brand-accent/90 active:scale-[0.98] text-white font-black py-5 rounded-2xl uppercase tracking-widest text-sm shadow-glow-blue grain transition-all border-b-4 border-black/20"
                    >
                        Entra in lega
                    </button>
                 </form>
                 <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 relative z-10">
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">SCRIVI LA TUA SQUADRA PER INIZIARE</p>
                 </div>
             </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 md:space-y-10 animate-fadeIn">
        <div className="flex justify-center">
            <div className="bg-white dark:bg-brand-card p-1.5 rounded-2xl shadow-soft border border-gray-100 dark:border-white/5 inline-flex gap-2">
                <button onClick={() => setActiveTab('play')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'play' ? 'active-nav-pill text-white shadow-glow-blue grain' : 'text-slate-500 hover:text-brand-accent'}`}>Gioca</button>
                <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'history' ? 'active-nav-pill text-white shadow-glow-blue grain' : 'text-slate-500 hover:text-brand-accent'}`}>Storico</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'active-nav-pill text-white shadow-glow-blue grain' : 'text-slate-500 hover:text-brand-accent'}`}>Classifica</button>
            </div>
        </div>

        {activeTab === 'play' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
                <div className="lg:col-span-8 space-y-5 md:space-y-8">
                    {/* Prediction Card */}
                    <div className="bg-white dark:bg-brand-card rounded-[2rem] p-6 md:p-12 shadow-soft border border-gray-100 dark:border-white/5">
                        <header className="flex justify-between items-center mb-6 md:mb-10 flex-wrap gap-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Giornata {nextMatchday}</h2>
                                <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-widest">Schedina del Turno</p>
                            </div>
                            <div className="flex items-center gap-3 md:gap-5 bg-slate-50 dark:bg-brand-base px-4 py-2.5 md:px-6 md:py-3 rounded-2xl border border-slate-100 dark:border-white/5">
                                <span className="font-black text-brand-accent text-xs md:text-sm uppercase tracking-wide">{currentUser}</span>
                                <button onClick={handleLogout} className="p-1.5 text-slate-400 hover:text-brand-danger transition-all"><LogOut size={16} /></button>
                            </div>
                        </header>

                        <div className="space-y-3.5 md:space-y-4">
                            {nextMatches.map(match => {
                                 const h2hDesc = getH2HDescription(matches, match.homeTeam, match.awayTeam);
                                 return (
                                     <div key={match.id} className="bg-slate-50/50 dark:bg-brand-base/40 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden">
                                         <div className="flex items-center justify-between p-4 md:p-7 gap-2 md:gap-4 w-full">
                                             <div className="flex-1 flex items-center justify-end min-w-0 pr-1 md:pr-4">
                                                 <span className="font-black text-[12px] md:text-base uppercase text-slate-900 dark:text-slate-100 tracking-tight text-right truncate">{match.homeTeam}</span>
                                             </div>

                                             <div className="flex gap-1.5 justify-center flex-shrink-0 px-2 md:px-8">
                                                 {['1', 'X', '2'].map(opt => (
                                                     <button key={opt} onClick={() => handlePrediction(match.id, opt as any)}
                                                         className={`h-11 w-12 md:h-14 md:w-16 rounded-xl font-black text-xs md:text-sm transition-all border-2 ${currentPredictions[match.id] === opt ? 'bg-brand-accent text-white border-brand-accent shadow-glow-blue grain' : 'bg-white dark:bg-brand-card text-slate-400 border-slate-200 dark:border-white/10'}`}
                                                     > {opt} </button>
                                                 ))}
                                             </div>

                                             <div className="flex-1 flex items-center justify-start min-w-0 pl-1 md:pl-4">
                                                 <span className="font-black text-[12px] md:text-base uppercase text-slate-900 dark:text-slate-100 tracking-tight text-left truncate">{match.awayTeam}</span>
                                             </div>
                                         </div>
                                         <div className="bg-slate-100/50 dark:bg-brand-base/20 px-3 py-2 md:px-6 md:py-3 border-t border-slate-200/50 dark:border-white/5 text-center">
                                             <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight">{h2hDesc}</p>
                                         </div>
                                     </div>
                                 );
                            })}
                        </div>

                        <div className="mt-8 md:mt-10 flex justify-center">
                            <button onClick={handleSubmit} className="w-full md:w-auto px-12 py-5 bg-brand-accent hover:bg-brand-accent/90 text-white font-black rounded-3xl shadow-glow-blue flex items-center justify-center gap-4 transition-all uppercase tracking-[0.2em] text-xs md:text-sm border-2 border-white/10 grain">
                                <Send size={20} /> Invia Schedina
                            </button>
                        </div>
                    </div>

                    {/* Live Feed Section */}
                    <div className="bg-white dark:bg-brand-card rounded-[2rem] shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-fit">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/30 text-slate-700 dark:text-slate-100">
                            <div className="flex items-center gap-3">
                                <Ticket className="text-orange-500" size={20} />
                                <h3 className="font-bold uppercase tracking-wider text-xs">Live Feed</h3>
                            </div>
                            {currentWeekSubmissions.length > 0 && <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
                        </div>
                        <div className="p-8">
                             <div className="space-y-6">
                                {currentWeekSubmissions.map((sub, idx) => (
                                    <div key={idx} className="flex flex-col gap-4 bg-slate-50 dark:bg-brand-base/50 p-6 rounded-[1.5rem] border-l-4 border-brand-accent shadow-sm transition-all hover:bg-white dark:hover:bg-brand-card">
                                        <div className="flex justify-between items-start">
                                            <div className="font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wide">{sub.teamName}</div>
                                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold text-right uppercase tracking-widest leading-tight">
                                                <div>{new Date(sub.timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}</div>
                                                <div>{new Date(sub.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                        {/* Matches Grid - Compact 5-col Grid for Mobile Glanceability */}
                                        <div className="grid grid-cols-5 gap-1 md:gap-4">
                                            {nextMatches.map((match, i) => {
                                                const pred = sub.predictions.find(p => p.matchId === match.id);
                                                const predictionValue = pred ? pred.prediction : '-';
                                                
                                                return (
                                                    <div key={match.id} className="flex flex-col items-center gap-1.5 md:gap-2">
                                                        {/* Prediction Badge */}
                                                        <span className={`w-full aspect-square max-w-[40px] md:max-w-none md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-2xl text-xs md:text-lg font-black border md:border-2 shadow-sm grain transition-all ${predictionValue === '1' ? 'bg-brand-accent text-white border-brand-accent' : predictionValue === 'X' ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-400/20' : predictionValue === '2' ? 'bg-brand-danger text-white border-brand-danger' : 'bg-gray-200 text-gray-400 border-gray-300'}`}>
                                                            {predictionValue}
                                                        </span>
                                                        
                                                        {/* Match Info - Compact Text Only */}
                                                        <div className="flex flex-col items-center w-full">
                                                             <span className="text-[7px] md:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase leading-none truncate w-full text-center" title={match.homeTeam}>{match.homeTeam}</span>
                                                             <span className="text-[7px] md:text-[8px] text-slate-300 dark:text-slate-600 font-black leading-none my-0.5">vs</span>
                                                             <span className="text-[7px] md:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase leading-none truncate w-full text-center" title={match.awayTeam}>{match.awayTeam}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {currentWeekSubmissions.length === 0 && (
                                    <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest opacity-50">Nessuna schedina inviata</div>
                                )}
                             </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 md:space-y-8">
                    <div className="bg-white dark:bg-brand-card rounded-[1.8rem] p-6 shadow-soft border border-gray-100 dark:border-white/5">
                        <header className="flex items-center gap-3 mb-5">
                            <ListChecks size={20} className="text-brand-accent" />
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 leading-none">STATUS SCHEDINE INVIATE</h3>
                        </header>
                        <div className="grid grid-cols-2 gap-3">
                            {DEFAULT_TEAMS.map(team => (
                                <div key={team} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-brand-base border border-slate-100 dark:border-white/5">
                                    <span className="text-[10px] md:text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase truncate pr-2">{team}</span>
                                    <div className={`w-2 h-2 rounded-full ${currentWeekSubmissions.some(s => s.teamName === team) ? 'bg-brand-success shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-brand-danger shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {curiosities.length > 0 && (
                        <div className="bg-white dark:bg-brand-card rounded-[1.8rem] p-6 shadow-soft border-l-8 border-amber-500">
                             <header className="flex items-center gap-3 mb-4 text-slate-700 dark:text-slate-100">
                                <Lightbulb size={22} className="text-amber-500" />
                                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Curiosità</h3>
                            </header>
                            <div className="space-y-3">
                                {curiosities.map((tip, idx) => (
                                    <p key={idx} className="text-[10px] font-black text-slate-500 dark:text-slate-300 uppercase leading-relaxed tracking-tight flex gap-3">
                                        <span className="text-amber-500 flex-shrink-0">•</span> {tip}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'history' && (
             <div className="max-w-[1400px] mx-auto animate-fadeIn space-y-8">
                {/* Header Control */}
                <div className="bg-white dark:bg-brand-card p-6 rounded-[2rem] shadow-soft border border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Storico Schedine</h2>
                        <p className="text-slate-500 text-[10px] md:text-xs font-semibold uppercase tracking-widest">Archivio e Statistiche</p>
                    </div>
                    <div className="flex items-center bg-slate-100 dark:bg-brand-base rounded-xl p-1 md:p-2 border border-slate-200 dark:border-white/5">
                        <button onClick={() => setHistoryMatchday(p => Math.max(1, p - 1))} disabled={historyMatchday === 1} className="p-2 md:p-3 hover:bg-white dark:hover:bg-brand-card rounded-lg disabled:opacity-20 text-slate-800 dark:text-slate-400 transition-all">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="px-6 text-sm md:text-xl font-black tabular-nums text-slate-900 dark:text-slate-300 min-w-[120px] text-center">
                            Giornata {historyMatchday}
                        </div>
                        <button onClick={() => setHistoryMatchday(p => Math.min(38, p + 1))} disabled={historyMatchday === 38} className="p-2 md:p-3 hover:bg-white dark:hover:bg-brand-card rounded-lg disabled:opacity-20 text-slate-800 dark:text-slate-400 transition-all">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        {historySubmissions.length === 0 ? (
                            <div className="bg-white dark:bg-brand-card rounded-[2rem] p-12 text-center text-slate-400 border border-gray-100 dark:border-white/5">
                                <History size={48} className="mx-auto mb-4 opacity-20"/>
                                <p className="font-bold uppercase tracking-widest text-sm">Nessuna schedina trovata per questa giornata</p>
                            </div>
                        ) : (
                            historySubmissions.map((sub, idx) => (
                                <div key={idx} className="bg-white dark:bg-brand-card rounded-[2rem] p-6 shadow-soft border border-gray-100 dark:border-white/5">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="font-black text-lg text-slate-900 dark:text-white uppercase tracking-wide">{sub.teamName}</div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-right">
                                            <div>{new Date(sub.timestamp).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
                                            <div>{new Date(sub.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Matches Grid - Compact 5-col Grid for Mobile */}
                                    <div className="grid grid-cols-5 gap-1 md:gap-4">
                                        {historyMatches.map(match => {
                                            const pred = sub.predictions.find(p => p.matchId === match.id);
                                            const predictionValue = pred ? pred.prediction : '-';
                                            const actualResult = getMatchResult(match);
                                            const isCorrect = actualResult && predictionValue === actualResult;
                                            const isWrong = actualResult && predictionValue !== actualResult;

                                            return (
                                                <div key={match.id} className="flex flex-col items-center gap-1.5 md:gap-2">
                                                    {/* Prediction Badge */}
                                                    <span className={`w-full aspect-square max-w-[40px] md:max-w-none md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-2xl text-xs md:text-lg font-black border md:border-2 shadow-sm grain transition-all ${
                                                        isCorrect ? 'bg-brand-success text-white border-brand-success shadow-[0_0_15px_rgba(16,185,129,0.3)]' :
                                                        isWrong ? 'bg-brand-danger text-white border-brand-danger opacity-60' :
                                                        'bg-slate-100 dark:bg-brand-base text-slate-400 border-slate-200 dark:border-white/10'
                                                    }`}>
                                                        {predictionValue}
                                                    </span>
                                                    
                                                    {/* Match Info - Compact */}
                                                    <div className="flex flex-col items-center w-full">
                                                         <span className="text-[7px] md:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase leading-none truncate w-full text-center">{match.homeTeam}</span>
                                                         <span className="text-[7px] md:text-[8px] text-slate-300 dark:text-slate-600 font-black leading-none my-0.5">vs</span>
                                                         <span className="text-[7px] md:text-[9px] font-black text-slate-900 dark:text-slate-300 uppercase leading-none truncate w-full text-center">{match.awayTeam}</span>
                                                         
                                                         {/* Optional Score for History */}
                                                         {match.isPlayed && (
                                                             <span className="text-[7px] md:text-[9px] font-mono font-black text-slate-500 dark:text-slate-400 leading-none mt-0.5 md:mt-1">
                                                                {match.homeScore !== null ? `${match.homeScore}-${match.awayScore}` : ''}
                                                             </span>
                                                         )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-brand-card rounded-[2rem] p-8 shadow-soft border border-gray-100 dark:border-white/5 border-l-8 border-amber-500 sticky top-24">
                             <header className="flex items-center gap-3 mb-6 text-slate-700 dark:text-slate-100">
                                <Lightbulb size={24} className="text-amber-500" />
                                <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 dark:text-slate-100">Curiosità Storico</h3>
                            </header>
                            
                            <div className="space-y-6">
                                {/* Matchday Specific Section */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100 dark:border-white/5">
                                        Giornata {historyMatchday}
                                    </h4>
                                    <div className="space-y-3">
                                        {matchdayCuriosities.length > 0 ? matchdayCuriosities.map((tip, idx) => (
                                            <p key={idx} className="text-[11px] font-black text-slate-500 dark:text-slate-300 uppercase leading-relaxed tracking-wide flex gap-3">
                                                <span className="text-amber-500 flex-shrink-0">•</span> {tip}
                                            </p>
                                        )) : (
                                            <p className="text-[11px] text-slate-400 uppercase italic">Nessuna curiosità rilevante per questa giornata.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Seasonal Section */}
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-gray-100 dark:border-white/5 flex items-center gap-2">
                                        Stagione 25/26 <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded ml-auto">LIVE</span>
                                    </h4>
                                    <div className="space-y-4">
                                        
                                        {/* Global Seasonal Stats */}
                                        {globalSeasonalCuriosities.length > 0 && (
                                            <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-xl p-3 border border-amber-100 dark:border-amber-500/10">
                                                <div className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase mb-2 flex items-center gap-1.5"><Globe size={10} /> Statistiche Lega</div>
                                                <div className="space-y-1.5 pl-1">
                                                    {globalSeasonalCuriosities.map((fact, i) => (
                                                        <p key={i} className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase leading-tight flex items-start gap-2">
                                                            <span className="text-amber-500 text-[8px] mt-0.5">▶</span> {fact}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* User Specific Stats */}
                                        {Object.keys(seasonalCuriosities).length > 0 ? Object.entries(seasonalCuriosities).map(([user, facts]: [string, string[]]) => (
                                            <div key={user} className="bg-slate-50 dark:bg-brand-base/30 rounded-xl p-3">
                                                <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-2 flex items-center gap-1.5"><User size={10} /> {user}</div>
                                                <div className="space-y-1.5 pl-1">
                                                    {facts.map((fact, i) => (
                                                        <p key={i} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase leading-tight flex items-start gap-2">
                                                            <span className="text-amber-500 text-[8px] mt-0.5">▶</span> {fact}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        )) : (
                                            globalSeasonalCuriosities.length === 0 && <p className="text-[11px] text-slate-400 uppercase italic">Dati insufficienti per statistiche stagionali.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto w-full px-2 animate-fadeIn">
                <div className="bg-white dark:bg-brand-card rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5">
                    <header className="p-10 md:p-14 border-b border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-brand-base/20 flex items-center gap-8">
                        <div className="bg-amber-500/10 p-5 rounded-3xl shadow-glow-blue grain"><Trophy className="text-amber-500 w-12 h-12" /></div>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-3">Classifica Schedine</h2>
                            <p className="text-[10px] md:text-sm text-slate-500 font-black uppercase tracking-[0.2em]">Analisi Precisione Manageriale 2025/26</p>
                        </div>
                    </header>
                    <div className="w-full">
                        <table className="w-full text-left table-fixed">
                            <thead className="bg-slate-50 dark:bg-brand-base/50 text-slate-400 uppercase text-[10px] md:text-xs font-black tracking-widest border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-6 md:px-10 py-8 w-[15%]">#</th>
                                    <th className="px-4 md:px-10 py-8 w-[45%]">Manager</th>
                                    <th className="px-4 md:px-10 py-8 w-[20%] text-center">Punti</th>
                                    <th className="px-4 md:px-10 py-8 w-[20%] text-center">Last</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {leaderboard.map((row, idx) => (
                                    <tr key={row.teamName} className={`group hover:bg-brand-accent/[0.02] transition-colors ${row.teamName === currentUser ? 'bg-brand-accent/[0.05]' : ''}`}>
                                        <td className="px-6 md:px-10 py-8 font-black text-slate-400 text-sm md:text-xl">
                                            {idx < 3 ? (idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉") : `#${row.rank}`}
                                        </td>
                                        <td className="px-4 md:px-10 py-8 font-black text-sm md:text-lg uppercase text-slate-900 dark:text-white truncate tracking-tight">
                                            {row.teamName}
                                        </td>
                                        <td className="px-4 md:px-10 py-8 text-center font-black text-brand-accent text-2xl md:text-3xl tabular-nums">
                                            {row.totalCorrect}
                                        </td>
                                        <td className="px-4 md:px-10 py-8 text-center text-sm md:text-base font-black text-brand-success tabular-nums">
                                            +{row.lastWeekCorrect}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};