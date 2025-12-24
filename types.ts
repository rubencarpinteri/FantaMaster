
export interface Match {
  id: string;
  matchday: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null; // Goals
  awayScore: number | null; // Goals
  homeFantasyPoints: number | null; // Precise points (e.g., 67.5)
  awayFantasyPoints: number | null; // Precise points (e.g., 71.0)
  isPlayed: boolean;
}

export interface FormResult {
  result: 'W' | 'D' | 'L';
  opponent: string;
  score: string;
}

export type RivalryType = 'nemesis' | 'ez' | 'rival' | null;

export interface TeamStats {
  rank: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
  totalFP: number; // Total Fantasy Points
  form: FormResult[]; 
}

export enum Competition {
  CAMPIONATO = 'Campionato',
  BATTLE_ROYALE = 'Battle Royale',
  SUPER_LEGA = 'Super Lega'
}

export interface TableData {
  competition: Competition;
  standings: TeamStats[];
}

export interface Prediction {
  matchId: string;
  prediction: '1' | 'X' | '2';
}

export interface SchedinaSubmission {
  teamName: string;
  matchday: number;
  predictions: Prediction[];
  timestamp: string; // ISO String
}

export interface SchedinaLeaderboardRow {
  rank: number;
  teamName: string;
  totalCorrect: number;
  perfectWeeks: number;
  lastWeekCorrect: number;
}

export interface LegacySchedineData {
  [teamName: string]: {
    totalCorrect: number;
    perfectWeeks: number;
  }
}

export interface SchedineAdjustment {
    [teamName: string]: {
        extraCorrect: number;
        extraPerfect: number;
    }
}

export const CSV_HEADER = "Matchday,HomeTeam,HomeFP,HomeGoals,AwayGoals,AwayFP,AwayTeam,Result";

export const DEFAULT_TEAMS = [
  "SPIAZE", "HORTO", "ROSAPROFONDA", "SATANIA", "SAYONARA", 
  "SQUADRADABBATTERE", "NINUZZO", "OFF", "ISAMU", "PRONOSTICI"
];
