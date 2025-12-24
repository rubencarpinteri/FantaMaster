import React, { useMemo } from 'react';
import { TeamStats, Match, SchedinaSubmission } from '../types';
import { Trophy, Swords, CalendarDays, Ticket, ArrowRight, Snowflake, Lightbulb } from 'lucide-react';

interface DashboardProps {
  campionatoStats: TeamStats[];
  battleRoyaleStats: TeamStats[];
  matches: Match[];
  schedineSubmissions: SchedinaSubmission[];
  frozenMatchdays: number[];
  onNavigate: (tab: any) => void;
  onTeamClick: (team: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ campionatoStats, battleRoyaleStats, matches, schedineSubmissions, frozenMatchdays = [], onNavigate, onTeamClick }) => {
  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const maxMilestone = Math.max(0, ...playedMatchdays, ...frozenMatchdays);
  const nextMatchday = maxMilestone < 38 ? maxMilestone + 1 : 38;
  const nextMatches = matches.filter(m => m.matchday === nextMatchday);

  const recentSubmissions = schedineSubmissions
    .filter(s => s.matchday === nextMatchday)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const curiosities = useMemo(() => {
    if (recentSubmissions.length < 2) return [];
    const results: string[] = [];
    nextMatches.forEach(match => {
      const matchSubs = recentSubmissions.flatMap(s => s.predictions.filter(p => p.matchId === match.id));
      const counts = { '1': 0, 'X': 0, '2': 0 };
      matchSubs.forEach(p => counts[p.prediction]++);
      const total = matchSubs.length;
      if (total === 0) return;

      if (counts['X'] === total && total >= 2) {
        results.push(`Tutti credono nel pareggio tra ${match.homeTeam} e ${match.awayTeam}`);
      }
      if (counts['1'] === 0 && total >= 2) {
        results.push(`Nessuno crede nella vittoria di ${match.homeTeam}`);
      }
      if (counts['2'] === 0 && total >= 2) {
        results.push(`Nessuno crede nella vittoria di ${match.awayTeam}`);
      }
    });
    return results;
  }, [recentSubmissions, nextMatches]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Column */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 content-start h-fit">
            {/* Campionato Preview */}
            <div className="bg-white dark:bg-brand-card rounded-[2rem] shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col transition-all duration-300 h-fit">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/30">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100">
                        <Trophy className="text-amber-500" size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Campionato</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">Turno {maxMilestone}</span>
                </div>
                <div className="p-0 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm min-w-[300px]">
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {campionatoStats.slice(0, 10).map((team) => (
                                <tr key={team.team} className="group/row hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onTeamClick(team.team)}>
                                    <td className="px-6 py-4 w-10 text-center font-bold text-slate-400 dark:text-slate-500 text-[11px]">#{team.rank}</td>
                                    <td className="px-4 py-4 font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100 group-hover/row:text-brand-accent transition-colors truncate">{team.team}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">{team.points}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase ml-1">pt</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Battle Royale Preview */}
            <div className="bg-white dark:bg-brand-card rounded-[2rem] shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col transition-all duration-300 h-fit">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/30">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100">
                        <Swords className="text-brand-accent" size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-sm">Battle Royale</h3>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase">Turno {maxMilestone}</span>
                </div>
                <div className="p-0 overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm min-w-[300px]">
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {battleRoyaleStats.slice(0, 10).map((team) => (
                                <tr key={team.team} className="group/row hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onTeamClick(team.team)}>
                                    <td className="px-6 py-4 w-10 text-center font-bold text-slate-400 dark:text-slate-500 text-[11px]">#{team.rank}</td>
                                    <td className="px-4 py-4 font-bold uppercase tracking-wide text-slate-900 dark:text-slate-100 group-hover/row:text-brand-accent transition-colors truncate">{team.team}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">{team.points}</span>
                                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase ml-1">pt</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-brand-card rounded-[2rem] shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden h-fit">
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/30">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-100">
                        <CalendarDays className="text-brand-accent" size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Calendario</h3>
                    </div>
                    <span className="text-[10px] text-brand-accent font-bold uppercase tracking-widest bg-brand-accent/10 px-3 py-1.5 rounded-xl border border-brand-accent/20 flex items-center gap-2 grain">
                        Turno {nextMatchday}
                        {frozenMatchdays.includes(nextMatchday) && <Snowflake size={12} className="animate-pulse" />}
                    </span>
                </div>
                <div className="p-8">
                    <div className="space-y-4">
                        {nextMatches.map(match => (
                            <div key={match.id} className="flex justify-between items-center px-4 py-4 rounded-2xl bg-slate-50 dark:bg-brand-base border border-slate-100 dark:border-white/5 transition-transform hover:scale-[1.02]">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-20 truncate text-right uppercase tracking-wide">{match.homeTeam}</span>
                                <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 px-3 tracking-widest">VS</span>
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 w-20 truncate text-left uppercase tracking-wide">{match.awayTeam}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-brand-card rounded-[2rem] shadow-soft border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col h-fit">
                 <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/30 text-slate-700 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                        <Ticket className="text-orange-500" size={20} />
                        <h3 className="font-bold uppercase tracking-wider text-xs">Live Feed</h3>
                    </div>
                    {recentSubmissions.length > 0 && <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
                </div>
                <div className="p-8">
                     <div className="space-y-6">
                        {recentSubmissions.map((sub, idx) => (
                            <div key={idx} className="flex flex-col gap-4 bg-slate-50 dark:bg-brand-base/50 p-4 rounded-[1.5rem] border-l-4 border-brand-accent shadow-sm transition-all hover:bg-white dark:hover:bg-brand-card">
                                <div className="flex justify-between items-start">
                                    <div className="font-black text-[11px] text-slate-900 dark:text-slate-100 uppercase tracking-wide">{sub.teamName}</div>
                                    <div className="text-[9px] text-slate-400 dark:text-slate-500 font-bold text-right uppercase tracking-widest leading-tight">
                                        <div>{new Date(sub.timestamp).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {sub.predictions.map((p, i) => {
                                        const match = matches.find(m => m.id === p.matchId);
                                        // Increased character allowance for team names
                                        const homeInit = match?.homeTeam.substring(0, 6).toUpperCase() || '???';
                                        const awayInit = match?.awayTeam.substring(0, 6).toUpperCase() || '???';
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-1.5">
                                                <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black border-2 shadow-sm grain ${p.prediction === '1' ? 'bg-brand-accent text-white border-brand-accent' : p.prediction === 'X' ? 'bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-400/20' : 'bg-brand-danger text-white border-brand-danger'}`}>
                                                    {p.prediction}
                                                </span>
                                                <div className="bg-white/50 dark:bg-white/5 px-1 py-0.5 rounded border border-slate-200 dark:border-white/5 w-full">
                                                    <div className="text-[6px] font-black text-slate-900 dark:text-slate-300 uppercase leading-none text-center mb-0.5 truncate">{homeInit}</div>
                                                    <div className="h-px bg-slate-200 dark:bg-white/10 w-full mb-0.5"></div>
                                                    <div className="text-[6px] font-black text-slate-900 dark:text-slate-300 uppercase leading-none text-center truncate">{awayInit}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {recentSubmissions.length === 0 && (
                            <div className="text-center py-12 text-slate-400 dark:text-slate-600 text-xs font-bold uppercase tracking-widest opacity-50">Nessuna schedina inviata</div>
                        )}
                     </div>
                </div>
                <div className="p-6 bg-slate-50/50 dark:bg-brand-base/20 border-t border-gray-100 dark:border-white/5">
                    <button onClick={() => onNavigate('Schedine')} className="w-full py-4 bg-brand-accent hover:bg-brand-accent/90 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-glow-blue flex items-center justify-center gap-3 transition-all active:scale-95 grain">Gioca ora <ArrowRight size={16} /></button>
                </div>
            </div>

            {/* Curiosità Schedine Box */}
            {curiosities.length > 0 && (
                <div className="bg-white dark:bg-brand-card rounded-[1.8rem] p-8 shadow-soft border border-gray-100 dark:border-white/5 border-l-4 border-amber-500 animate-fadeIn">
                    <header className="flex items-center gap-3 mb-6 text-slate-700 dark:text-slate-100">
                        <Lightbulb size={20} className="text-amber-500" />
                        <h3 className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-slate-100">Curiosità Schedine</h3>
                    </header>
                    <div className="space-y-4">
                        {curiosities.map((tip, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                                <p className="text-[11px] font-black text-slate-500 dark:text-slate-300 uppercase leading-relaxed tracking-wide">
                                    {tip}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};