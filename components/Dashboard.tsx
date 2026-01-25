
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

  // Helper to get the form dots including frozen matchdays, most recent first (on the left)
  const getTeamFormDots = (teamName: string) => {
    const dots: React.ReactNode[] = [];
    const startMd = Math.max(1, maxMilestone - 4);
    
    // Loop backwards from latest to earliest to put most recent on the left
    for (let md = maxMilestone; md >= startMd; md--) {
      const match = matches.find(m => m.matchday === md && (m.homeTeam === teamName || m.awayTeam === teamName));
      if (!match) continue;

      if (match.isPlayed) {
        const isHome = match.homeTeam === teamName;
        const gf = isHome ? match.homeScore! : match.awayScore!;
        const ga = isHome ? match.awayScore! : match.homeScore!;
        
        if (gf > ga) {
          dots.push(<div key={md} className="w-1.5 h-1.5 rounded-full bg-brand-success" title={`Giornata ${md}: Vittoria`} />);
        } else if (gf < ga) {
          dots.push(<div key={md} className="w-1.5 h-1.5 rounded-full bg-brand-danger" title={`Giornata ${md}: Sconfitta`} />);
        } else {
          dots.push(<div key={md} className="w-1.5 h-1.5 rounded-full bg-slate-400" title={`Giornata ${md}: Pareggio`} />);
        }
      } else if (frozenMatchdays.includes(md)) {
        dots.push(<div key={md} className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_2px_rgba(76,125,255,0.6)]" title={`Giornata ${md}: Congelata`} />);
      }
    }
    return dots;
  };

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
                <div className="p-0 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-transparent border-b border-gray-50 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-4 py-3 w-12 text-center">#</th>
                                <th className="px-2 py-3 text-left">Squadra</th>
                                <th className="px-2 py-3 text-center">Form</th>
                                <th className="px-4 py-3 text-right">PT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {campionatoStats.slice(0, 10).map((team) => (
                                <tr key={team.team} className="group/row hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onTeamClick(team.team)}>
                                    <td className="px-4 py-5 text-center font-bold text-slate-400 dark:text-slate-500 text-sm md:text-base">#{team.rank}</td>
                                    <td className="px-2 py-5 font-black uppercase tracking-tight text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover/row:text-brand-accent transition-colors truncate">{team.team}</td>
                                    <td className="px-2 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            {getTeamFormDots(team.team)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-5 text-right">
                                        <span className="font-black text-slate-900 dark:text-white text-sm md:text-base tabular-nums">{team.points}</span>
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
                <div className="p-0 overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50/30 dark:bg-transparent border-b border-gray-50 dark:border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="px-4 py-3 w-12 text-center">#</th>
                                <th className="px-2 py-3 text-left">Squadra</th>
                                <th className="px-4 py-3 text-right">PT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {battleRoyaleStats.slice(0, 10).map((team) => (
                                <tr key={team.team} className="group/row hover:bg-white/5 transition-colors cursor-pointer" onClick={() => onTeamClick(team.team)}>
                                    <td className="px-4 py-5 w-12 text-center font-bold text-slate-400 dark:text-slate-500 text-sm md:text-base">#{team.rank}</td>
                                    <td className="px-2 py-5 font-black uppercase tracking-wide text-sm md:text-base text-slate-900 dark:text-slate-100 group-hover/row:text-brand-accent transition-colors truncate">{team.team}</td>
                                    <td className="px-4 py-5 text-right">
                                        <span className="font-black text-slate-900 dark:text-white text-sm md:text-base tabular-nums">{team.points}</span>
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
                                <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 w-28 truncate text-right uppercase tracking-wide">{match.homeTeam}</span>
                                <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 px-3 tracking-widest">VS</span>
                                <span className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 w-28 truncate text-left uppercase tracking-wide">{match.awayTeam}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
