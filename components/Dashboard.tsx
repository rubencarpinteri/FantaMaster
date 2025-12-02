import React from 'react';
import { TeamStats, Match } from '../types';
import { Trophy, Swords, CalendarDays } from 'lucide-react';

interface DashboardProps {
  campionatoStats: TeamStats[];
  battleRoyaleStats: TeamStats[];
  matches: Match[];
  onNavigate: (tab: any) => void;
  onTeamClick: (team: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ campionatoStats, battleRoyaleStats, matches, onNavigate, onTeamClick }) => {
  // Calculate next matchday
  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const maxPlayed = playedMatchdays.length > 0 ? Math.max(...playedMatchdays) : 0;
  const nextMatchday = maxPlayed < 38 ? maxPlayed + 1 : 38;
  const nextMatches = matches.filter(m => m.matchday === nextMatchday);
  const seasonProgress = Math.min(100, Math.round((maxPlayed / 38) * 100));

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

      </div>
    </div>
  );
};