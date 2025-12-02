import React, { useState, useMemo } from 'react';
import { TeamStats, Competition } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight } from 'lucide-react';

interface LeagueTableProps {
  stats: TeamStats[];
  title: string;
  type: Competition;
  onTeamClick?: (teamName: string) => void;
}

type SortKey = keyof TeamStats;
type SortDirection = 'asc' | 'desc';

export const LeagueTable: React.FC<LeagueTableProps> = ({ stats, title, type, onTeamClick }) => {
  const isBattleRoyale = type === Competition.BATTLE_ROYALE;
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

  const sortedStats = useMemo(() => {
    if (!sortConfig) return stats;

    return [...stats].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc' 
                ? aValue.localeCompare(bValue) 
                : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [stats, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'desc';
    if (key === 'rank' || key === 'team' || key === 'ga') {
        direction = 'asc';
    }
    if (sortConfig && sortConfig.key === key) {
        direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    setSortConfig({ key, direction });
  };

  const SortHeader = ({ label, column, className = "", hidden = false }: { label: string, column: SortKey, className?: string, hidden?: boolean }) => {
      if (hidden) return null;
      const isActive = sortConfig?.key === column;
      return (
        <th 
            className={`px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors select-none group ${className}`}
            onClick={() => requestSort(column)}
        >
            <div className={`flex items-center justify-center gap-1 ${isActive ? 'text-blue-500' : ''}`}>
                {label}
                <span className="inline-flex w-3">
                    {isActive ? (sortConfig?.direction === 'asc' ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} className="opacity-0 group-hover:opacity-30" />}
                </span>
            </div>
        </th>
      );
  };

  return (
    <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300">
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20 backdrop-blur-sm">
        <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h2>
            {isBattleRoyale && <p className="text-xs text-gray-500 mt-1 font-medium">All vs All format • Goals Comparison</p>}
        </div>
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <SortHeader label="#" column="rank" className="w-16 pl-6" />
              <th 
                  className="px-4 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors select-none text-left"
                  onClick={() => requestSort('team')}
              >
                  <div className={`flex items-center gap-1 ${sortConfig?.key === 'team' ? 'text-blue-500' : ''}`}>
                    Team
                  </div>
              </th>
              <SortHeader label="P" column="played" />
              <SortHeader label="W" column="won" />
              <SortHeader label="D" column="drawn" />
              <SortHeader label="L" column="lost" />
              
              <SortHeader label="GF" column="gf" hidden={isBattleRoyale} className="hidden md:table-cell" />
              <SortHeader label="GA" column="ga" hidden={isBattleRoyale} className="hidden md:table-cell" />
              <SortHeader label="GD" column="gd" hidden={isBattleRoyale} className="hidden md:table-cell" />
              
              <SortHeader label="Pts" column="points" className="pr-6 font-bold" />
              
              {type === Competition.CAMPIONATO && (
                <th className="px-4 py-4 text-center hidden lg:table-cell text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Form</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {sortedStats.map((team, idx) => (
              <tr 
                key={team.team} 
                className={`group hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-default`}
              >
                <td className="px-4 py-3 text-center pl-6 text-gray-400 font-mono text-xs">{team.rank}</td>
                <td 
                    className={`px-4 py-3 font-semibold text-gray-900 dark:text-white flex items-center justify-between ${onTeamClick ? 'cursor-pointer' : ''}`}
                    onClick={() => onTeamClick && onTeamClick(team.team)}
                >
                    <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{team.team}</span>
                    {onTeamClick && <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-gray-300 dark:text-gray-600 transition-all -translate-x-2 group-hover:translate-x-0" />}
                </td>
                <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{team.played}</td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-white font-medium">{team.won}</td>
                <td className="px-4 py-3 text-center text-gray-500">{team.drawn}</td>
                <td className="px-4 py-3 text-center text-gray-500">{team.lost}</td>
                {!isBattleRoyale && (
                  <>
                    <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600 dark:text-gray-400">{team.gf}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell text-gray-600 dark:text-gray-400">{team.ga}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          team.gd > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          team.gd < 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          'text-gray-400'
                      }`}>
                        {team.gd > 0 ? '+' : ''}{team.gd}
                      </span>
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-center pr-6">
                    <span className="inline-block w-8 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold shadow-sm border border-gray-200 dark:border-gray-700">
                        {team.points}
                    </span>
                </td>
                {type === Competition.CAMPIONATO && (
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <div className="flex justify-center gap-1">
                      {team.form.slice(-5).map((r, i) => (
                        <div key={i} className="group/tooltip relative">
                          <span 
                            className={`block w-1.5 h-6 rounded-full transition-all hover:scale-110 cursor-help ${
                              r.result === 'W' ? 'bg-green-500' : r.result === 'D' ? 'bg-gray-300 dark:bg-gray-600' : 'bg-red-400'
                            }`}
                          >
                          </span>
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max px-2 py-1 bg-gray-900 text-[10px] text-white rounded opacity-0 group-hover/tooltip:opacity-100 pointer-events-none transition-opacity z-10">
                            vs {r.opponent.substring(0,3).toUpperCase()} ({r.score})
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};