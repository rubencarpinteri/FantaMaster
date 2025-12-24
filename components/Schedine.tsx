import React, { useState, useEffect, useMemo } from 'react';
import { Match, DEFAULT_TEAMS, Prediction, SchedinaSubmission, LegacySchedineData, SchedineAdjustment } from '../types';
import { getH2HDescription, calculateSchedineLeaderboard } from '../services/leagueService';
import { Trophy, User, LogOut, Sparkles, Snowflake, Send, ListChecks, Medal, Clock, Lightbulb, TrendingUp } from 'lucide-react';

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
  'ROSAPROFONDA': 'ROSAPROFONDA', 'ROS': 'ROSAPROFONDA', 'PFP': 'ROSAPROFONDA',
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
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [currentPredictions, setCurrentPredictions] = useState<Record<string, '1' | 'X' | '2'>>({});

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser && DEFAULT_TEAMS.includes(savedUser)) {
        setCurrentUser(savedUser);
    }
  }, []);

  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const maxMilestone = Math.max(0, ...playedMatchdays, ...frozenMatchdays);
  const nextMatchday = maxMilestone < 38 ? maxMilestone + 1 : 38;
  const nextMatches = matches.filter(m => m.matchday === nextMatchday);
  const currentWeekSubmissions = submissions
    .filter(s => s.matchday === nextMatchday)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

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
      if (counts['1'] === 0 && total >= 2) results.push(`Nessuno crede nella vittoria di ${match.homeTeam}`);
      if (counts['2'] === 0 && total >= 2) results.push(`Nessuno crede nella vittoria di ${match.awayTeam}`);
    });
    return results;
  }, [currentWeekSubmissions, nextMatches]);

  const leaderboard = calculateSchedineLeaderboard(matches, submissions, legacyData, adjustments);

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

  if (!currentUser) {
      return (
          <div className="fixed inset-0 top-16 flex items-center justify-center p-4 bg-[#F8F9FB] dark:bg-brand-base overflow-hidden z-[40]">
             <div className="bg-white dark:bg-brand-card p-6 md:p-10 rounded-[2.5rem] shadow-soft border border-gray-100 dark:border-white/5 w-full max-w-sm text-center animate-fadeIn">
                 <div className="w-14 h-14 bg-brand-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-blue grain"><User className="w-7 h-7 text-brand-accent" /></div>
                 <h2 className="text-xl font-black mb-1 text-slate-900 dark:text-white tracking-tight uppercase">Accesso Schedine</h2>
                 <p className="text-slate-400/20 text-[9px] font-black uppercase tracking-[0.2em] mb-8">Identifica la tua squadra</p>
                 <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input name="username" type="text" autoFocus placeholder="NOME SQUADRA" className="bg-slate-50 dark:bg-brand-base border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-center font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-accent uppercase placeholder:text-slate-300/10 placeholder:font-black" />
                    {loginError && <p className="text-brand-danger text-[10px] font-bold uppercase tracking-wide">{loginError}</p>}
                    <button type="submit" className="bg-brand-accent hover:bg-brand-accent/90 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] shadow-glow-blue grain transition-all active:scale-95">Entra</button>
                 </form>
             </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6 md:space-y-8 animate-fadeIn">
        <div className="flex justify-center">
            <div className="bg-white dark:bg-brand-card p-1 rounded-xl shadow-soft border border-gray-100 dark:border-white/5 inline-flex gap-1">
                <button onClick={() => setActiveTab('play')} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'play' ? 'active-nav-pill text-white shadow-glow-blue grain' : 'text-slate-500 hover:text-brand-accent'}`}>Gioca</button>
                <button onClick={() => setActiveTab('leaderboard')} className={`px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'leaderboard' ? 'active-nav-pill text-white shadow-glow-blue grain' : 'text-slate-500 hover:text-brand-accent'}`}>Classifica</button>
            </div>
        </div>

        {activeTab === 'play' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                <div className="lg:col-span-8 space-y-4 md:space-y-6">
                    <div className="bg-white dark:bg-brand-card rounded-[1.8rem] md:rounded-[2rem] p-4 md:p-10 shadow-soft border border-gray-100 dark:border-white/5">
                        <header className="flex justify-between items-center mb-4 md:mb-6 flex-wrap gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Giornata {nextMatchday}</h2>
                                <p className="text-slate-500 text-[9px] md:text-[10px] font-semibold uppercase tracking-widest">Schedina del Turno</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-brand-base px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-slate-100 dark:border-white/5">
                                <span className="font-bold text-brand-accent text-[9px] md:text-[10px] uppercase">{currentUser}</span>
                                <button onClick={handleLogout} className="p-1 text-slate-400 hover:text-brand-danger transition-all"><LogOut size={14} /></button>
                            </div>
                        </header>

                        <div className="space-y-2.5 md:space-y-3">
                            {nextMatches.map(match => {
                                 const h2hDesc = getH2HDescription(matches, match.homeTeam, match.awayTeam);
                                 return (
                                     <div key={match.id} className="bg-slate-50/50 dark:bg-brand-base/40 rounded-[1.2rem] md:rounded-[1.5rem] border border-slate-200 dark:border-white/5 overflow-hidden">
                                         <div className="flex items-center justify-between p-3 md:p-5 gap-1 md:gap-3 w-full">
                                             <div className="flex-1 flex items-center justify-end min-w-0 pr-1 md:pr-4">
                                                 <span className="font-black text-[10px] md:text-sm uppercase text-slate-900 dark:text-slate-100 tracking-tight text-right truncate">{match.homeTeam}</span>
                                             </div>

                                             <div className="flex gap-1 justify-center flex-shrink-0 px-2 md:px-6">
                                                 {['1', 'X', '2'].map(opt => (
                                                     <button key={opt} onClick={() => handlePrediction(match.id, opt as any)}
                                                         className={`h-9 w-10 md:h-12 md:w-14 rounded-lg font-black text-[10px] md:text-xs transition-all border-2 ${currentPredictions[match.id] === opt ? 'bg-brand-accent text-white border-brand-accent shadow-glow-blue grain' : 'bg-white dark:bg-brand-card text-slate-400 border-slate-200 dark:border-white/10'}`}
                                                     > {opt} </button>
                                                 ))}
                                             </div>

                                             <div className="flex-1 flex items-center justify-start min-w-0 pl-1 md:pl-4">
                                                 <span className="font-black text-[10px] md:text-sm uppercase text-slate-900 dark:text-slate-100 tracking-tight text-left truncate">{match.awayTeam}</span>
                                             </div>
                                         </div>
                                         <div className="bg-slate-100/50 dark:bg-brand-base/20 px-3 py-1.5 md:px-4 md:py-2 border-t border-slate-200/50 dark:border-white/5 text-center">
                                             <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight">{h2hDesc}</p>
                                         </div>
                                     </div>
                                 );
                            })}
                        </div>

                        <div className="mt-6 md:mt-8 flex justify-center">
                            <button onClick={handleSubmit} className="w-full md:w-auto px-10 py-3.5 bg-brand-accent hover:bg-brand-accent/90 text-white font-bold rounded-full shadow-glow-blue flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-[10px] md:text-[11px] border-2 border-white/10 grain">
                                <Send size={16} /> Invia Schedina
                            </button>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-4 md:space-y-6">
                    <div className="bg-white dark:bg-brand-card rounded-[1.5rem] p-5 shadow-soft border border-gray-100 dark:border-white/5">
                        <header className="flex items-center gap-2 mb-4">
                            <ListChecks size={16} className="text-brand-accent" />
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-100 leading-none">STATUS SCHEDINE INVIATE</h3>
                        </header>
                        <div className="grid grid-cols-2 gap-2">
                            {DEFAULT_TEAMS.map(team => (
                                <div key={team} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-brand-base border border-slate-100 dark:border-white/5">
                                    <span className="text-[8px] md:text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate pr-1">{team}</span>
                                    <div className={`w-1.5 h-1.5 rounded-full ${currentWeekSubmissions.some(s => s.teamName === team) ? 'bg-brand-success' : 'bg-brand-danger'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {curiosities.length > 0 && (
                        <div className="bg-white dark:bg-brand-card rounded-[1.5rem] p-5 shadow-soft border-l-4 border-amber-500">
                             <header className="flex items-center gap-2 mb-3">
                                <Lightbulb size={16} className="text-amber-500" />
                                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-900 dark:text-slate-100">Curiosità</h3>
                            </header>
                            <div className="space-y-2">
                                {curiosities.map((tip, idx) => (
                                    <p key={idx} className="text-[9px] font-bold text-slate-500 dark:text-slate-300 uppercase leading-relaxed tracking-tight flex gap-2">
                                        <span className="text-amber-500">•</span> {tip}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto w-full px-2 animate-fadeIn">
                <div className="bg-white dark:bg-brand-card rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-white/5">
                    <header className="p-8 md:p-12 border-b border-gray-100 dark:border-white/5 bg-slate-50/50 dark:bg-brand-base/20 flex items-center gap-6">
                        <div className="bg-amber-500/10 p-4 rounded-2xl shadow-glow-blue grain"><Trophy className="text-amber-500 w-10 h-10" /></div>
                        <div>
                            <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">Classifica Schedine</h2>
                            <p className="text-[9px] md:text-xs text-slate-500 font-black uppercase tracking-[0.2em]">Analisi Precisione Manageriale 2025/26</p>
                        </div>
                    </header>
                    <div className="w-full">
                        <table className="w-full text-left table-fixed">
                            <thead className="bg-slate-50 dark:bg-brand-base/50 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-gray-100 dark:border-white/5">
                                <tr>
                                    <th className="px-4 md:px-6 py-6 w-[12%]">#</th>
                                    <th className="px-2 md:px-6 py-6 w-[48%]">Manager</th>
                                    <th className="px-2 md:px-6 py-6 w-[20%] text-center">Punti</th>
                                    <th className="px-2 md:px-6 py-6 w-[20%] text-center">Last</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {leaderboard.map((row, idx) => (
                                    <tr key={row.teamName} className={`${row.teamName === currentUser ? 'bg-brand-accent/[0.05]' : ''}`}>
                                        <td className="px-4 md:px-6 py-6 font-black text-slate-400 text-xs md:text-base">
                                            {idx < 3 ? (idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉") : `#${row.rank}`}
                                        </td>
                                        <td className="px-2 md:px-6 py-6 font-black text-[11px] md:text-sm uppercase text-slate-900 dark:text-white truncate">
                                            {row.teamName}
                                        </td>
                                        <td className="px-2 md:px-6 py-6 text-center font-black text-brand-accent text-lg md:text-xl tabular-nums">
                                            {row.totalCorrect}
                                        </td>
                                        <td className="px-2 md:px-6 py-6 text-center text-xs md:text-[10px] font-black text-brand-success tabular-nums">
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
