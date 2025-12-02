import React from 'react';
import { TeamStats, Match, SchedinaSubmission } from '../types';
import { Trophy, Swords, CalendarDays, Ticket, ArrowRight } from 'lucide-react';

interface DashboardProps {
  campionatoStats: TeamStats[];
  battleRoyaleStats: TeamStats[];
  matches: Match[];
  schedineSubmissions: SchedinaSubmission[];
  onNavigate: (tab: any) => void;
  onTeamClick: (team: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ campionatoStats, battleRoyaleStats, matches, schedineSubmissions, onNavigate, onTeamClick }) => {
  // Calculate next matchday
  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const maxPlayed = playedMatchdays.length > 0 ? Math.max(...playedMatchdays) : 0;
  const nextMatchday = maxPlayed < 38 ? maxPlayed + 1 : 38;
  const nextMatches = matches.filter(m => m.matchday === nextMatchday);
  const seasonProgress = Math.min(100, Math.round((maxPlayed / 38) * 100));

  // Filter submissions for next matchday
  const recentSubmissions = schedineSubmissions
    .filter(s => s.matchday === nextMatchday)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Compact Banner */}
      <div className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl px-5 py-3 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Title & Context */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                    <Trophy size={20} className="text-yellow-300" />
                </div>
                <div>
                    <h2 className="text-base font-bold leading-tight">Manager Dashboard</h2>
                    <p className="text-blue-100 text-xs font-medium opacity-90">Season 25/26 • Matchday {maxPlayed}</p>
                </div>
            </div>
            
            {/* Right: Progress & Action */}
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="flex-1 md:w-48 space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-blue-200">
                        <span>Progress</span>
                        <span>{seasonProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${seasonProgress}%` }}></div>
                    </div>
                </div>
            </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campionato Widget */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-500" size={16} />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Campionato</h3>
                </div>
            </div>
            <div className="p-0 flex-1">
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {campionatoStats.map((team) => (
                            <tr key={team.team} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => onTeamClick(team.team)}>
                                <td className="px-5 py-3 w-10 text-center font-bold text-gray-400 text-xs">#{team.rank}</td>
                                <td className="px-5 py-3 font-bold text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors text-xs">{team.team}</td>
                                <td className="px-5 py-3 text-right font-mono font-bold text-gray-900 dark:text-white text-xs">{team.points} <span className="text-[10px] text-gray-400 font-sans font-normal ml-1">pts</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Battle Royale Widget */}
        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                <div className="flex items-center gap-2">
                    <Swords className="text-purple-500" size={16} />
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Battle Royale</h3>
                </div>
            </div>
            <div className="p-0 flex-1">
                <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {battleRoyaleStats.map((team) => (
                            <tr key={team.team} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => onTeamClick(team.team)}>
                                <td className="px-5 py-3 w-10 text-center font-bold text-gray-400 text-xs">#{team.rank}</td>
                                <td className="px-5 py-3 font-bold text-gray-900 dark:text-white group-hover:text-purple-500 transition-colors text-xs">{team.team}</td>
                                <td className="px-5 py-3 text-right font-mono font-bold text-gray-900 dark:text-white text-xs">{team.points} <span className="text-[10px] text-gray-400 font-sans font-normal ml-1">pts</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Right Column: Next Matchday & Live Feed */}
        <div className="space-y-6 flex flex-col">
            {/* Next Matchday Widget */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col h-fit">
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-2">
                        <CalendarDays className="text-blue-500" size={16} />
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Next Matchday</h3>
                        </div>
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">MD {nextMatchday}</span>
                </div>
                <div className="p-4 flex-1">
                    <div className="space-y-3">
                        {nextMatches.map(match => (
                            <div key={match.id} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-colors">
                                <span className="text-xs font-bold text-gray-900 dark:text-white w-24 truncate text-right">{match.homeTeam}</span>
                                <span className="text-[9px] font-bold text-gray-400 px-2 uppercase">VS</span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white w-24 truncate text-left">{match.awayTeam}</span>
                            </div>
                        ))}
                        {nextMatches.length === 0 && (
                            <div className="text-center text-gray-400 py-8 text-sm">Season Finished</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Live Predictions Widget */}
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col flex-1">
                 <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-2">
                        <Ticket className="text-orange-500" size={16} />
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm">Live Feed</h3>
                    </div>
                    {recentSubmissions.length > 0 && (
                         <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                    )}
                </div>
                <div className="p-4 flex-1 max-h-[400px] overflow-y-auto">
                     <div className="space-y-3">
                        {recentSubmissions.map((sub, idx) => (
                            <div key={idx} className="flex flex-col gap-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl border-l-4 border-blue-500">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-gray-900 dark:text-white text-xs">{sub.teamName}</div>
                                    <div className="text-[9px] text-gray-400 font-mono text-right leading-tight">
                                        <div>{new Date(sub.timestamp).toLocaleDateString('it-IT')}</div>
                                        <div>{new Date(sub.timestamp).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between gap-1 pt-1 border-t border-gray-200 dark:border-gray-800/50 mt-1">
                                    {nextMatches.map((m, i) => {
                                        const pred = sub.predictions.find(p => p.matchId === m.id)?.prediction;
                                        if (!pred) return null;
                                        return (
                                            <div key={i} className="flex flex-col items-center gap-0.5">
                                                <span 
                                                    className={`w-6 h-6 flex items-center justify-center rounded-md text-[10px] font-bold border shadow-sm ${
                                                        pred === '1' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                                                        pred === 'X' ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700' :
                                                        'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                                    }`}
                                                >
                                                    {pred}
                                                </span>
                                                <div className="flex flex-col items-center leading-none">
                                                     <span className="text-[7px] font-bold text-gray-400 uppercase">{m.homeTeam.substring(0,3)}</span>
                                                     <span className="text-[7px] font-bold text-gray-400 uppercase">{m.awayTeam.substring(0,3)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {recentSubmissions.length === 0 && (
                            <div className="text-center text-gray-400 py-6 text-xs italic">
                                No predictions yet for MD {nextMatchday}.
                            </div>
                        )}
                     </div>
                </div>
                {/* Footer with CTA Button */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/10">
                    <button 
                        onClick={() => onNavigate('Schedine')}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        Gioca Ora! <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};