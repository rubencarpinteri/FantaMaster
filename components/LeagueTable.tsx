import React, { useState, useMemo } from 'react';
import { TeamStats, Competition } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, BarChart3 } from 'lucide-react';

interface LeagueTableProps {
  stats: TeamStats[];
  title: string;
  type: Competition;
  onTeamClick?: (teamName: string) => void;
}

type SortKey = keyof TeamStats;
type SortDirection = 'asc' | 'desc' | 'none';

export const LeagueTable: React.FC<LeagueTableProps> = ({ stats, title, type, onTeamClick }) => {
  const isCampionato = type === Competition.CAMPIONATO;
  const isBattleRoyale = type === Competition.BATTLE_ROYALE;
  
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ 
    key: 'rank', 
    direction: 'none' 
  });

  const sortedStats = useMemo(() => {
    if (sortConfig.direction === 'none') {
        return [...stats].sort((a, b) => a.rank - b.rank);
    }

    return [...stats].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const cmp = aValue.localeCompare(bValue);
            return sortConfig.direction === 'asc' ? cmp : -cmp;
        }
        
        const numA = aValue as number;
        const numB = bValue as number;
        
        if (numA < numB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (numA > numB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
  }, [stats, sortConfig]);

  const toggleSort = (key: SortKey) => {
    setSortConfig(current => {
      if (current.key !== key) {
        return { key, direction: 'desc' };
      }
      if (current.direction === 'desc') return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key: 'rank', direction: 'none' };
      return { key, direction: 'desc' };
    });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key || sortConfig.direction === 'none') {
        return <ArrowUpDown size={10} className="opacity-10 group-hover:opacity-100 transition-opacity ml-1 inline-block" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={10} className="text-brand-accent ml-1 inline-block" /> : <ArrowDown size={10} className="text-brand-accent ml-1 inline-block" />;
  };

  const mobileStatsCols = [
    { key: 'played', label: 'G' },
    { key: 'won', label: 'V' },
    { key: 'drawn', label: 'N' },
    { key: 'lost', label: 'P' },
    ...(isCampionato ? [{ key: 'gf', label: 'F' }, { key: 'ga', label: 'S' }] : []),
    { key: 'points', label: 'Pt' },
    { key: 'totalFP', label: 'FP' },
  ] as const;

  // Dynamic grid template for mobile based on column count
  const mobileColCount = mobileStatsCols.length;
  const mobileGridTemplate = `minmax(80px, 2.5fr) repeat(${mobileColCount}, minmax(24px, 1fr))`;

  // Determine active columns for Desktop
  const statColumns = ['played', 'won', 'drawn', 'lost', 'gf', 'ga', 'points', 'totalFP'].filter(col => {
    if ((col === 'gf' || col === 'ga') && !isCampionato) return false;
    return true;
  });

  return (
    <div className="bg-white dark:bg-brand-card rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 max-w-4xl mx-auto mb-10 animate-fadeIn">
      <header className="px-6 md:px-10 py-5 md:py-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/20">
        <div className="flex items-center gap-4 md:gap-6">
            <div className={`p-3 md:p-5 rounded-xl md:rounded-[1.5rem] shadow-glow-blue border border-brand-accent/20 grain ${isBattleRoyale ? 'bg-brand-secondary/10' : 'bg-brand-accent/10'}`}>
                <BarChart3 className={isBattleRoyale ? 'text-brand-secondary' : 'text-brand-accent'} size={20} md:size={28} />
            </div>
            <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">{title}</h2>
                <p className="text-[8px] md:text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.2em] mt-0.5">
                    {isBattleRoyale ? 'Classifica Globale Royale' : 'Stagione Ufficiale 2025/26'}
                </p>
            </div>
        </div>
      </header>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse table-fixed">
          <thead>
            <tr className="bg-slate-50 dark:bg-brand-base/50 text-slate-400 dark:text-slate-500 uppercase text-[9px] font-black tracking-widest border-b border-gray-100 dark:border-white/5">
              <th className="px-4 py-5 text-center w-14">#</th>
              <th className="px-4 py-5 text-left cursor-pointer w-[28%]" onClick={() => toggleSort('team')}>
                <div className="flex items-center group">Squadra {getSortIcon('team')}</div>
              </th>
              
              {statColumns.map((col) => {
                  const labels: Record<string, string> = { played: 'G', won: 'V', drawn: 'N', lost: 'P', gf: 'GF', ga: 'GS', points: 'PT', totalFP: 'FP' };
                  const widthClass = col === 'totalFP' ? 'w-[14%]' : 'w-[10%]';
                  
                  return (
                    <th key={col} className={`px-1 py-5 text-center cursor-pointer whitespace-nowrap ${widthClass}`} onClick={() => toggleSort(col as any)}>
                      <div className="flex flex-col items-center justify-center group leading-none">
                        <span className="mb-1">{labels[col]}</span>
                        {getSortIcon(col as any)}
                      </div>
                    </th>
                  );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {sortedStats.map((team) => (
              <tr key={team.team} className="group hover:bg-brand-accent/[0.04] transition-all duration-150">
                <td className="px-4 py-6 text-center">
                    {team.rank < 4 ? <span className="text-2xl">{team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : "🥉"}</span> : <span className="font-black text-xs text-slate-300 dark:text-slate-700 tabular-nums">#{team.rank}</span>}
                </td>
                <td className="px-4 py-6 font-black uppercase text-sm text-slate-900 dark:text-slate-100 tracking-tight cursor-pointer" onClick={() => onTeamClick && onTeamClick(team.team)}>
                    <span className="group-hover:text-brand-accent transition-colors block truncate max-w-[180px]" title={team.team}>{team.team}</span>
                </td>
                
                <td className="px-1 py-6 text-center text-slate-500 font-bold tabular-nums text-sm">{team.played}</td>
                <td className="px-1 py-6 text-center text-slate-900 dark:text-white font-black tabular-nums text-sm">{team.won}</td>
                <td className="px-1 py-6 text-center text-slate-500 font-bold tabular-nums text-sm">{team.drawn}</td>
                <td className="px-1 py-6 text-center text-slate-500 font-bold tabular-nums text-sm">{team.lost}</td>
                
                {isCampionato && (
                  <>
                    <td className="px-1 py-6 text-center text-slate-400 font-bold tabular-nums text-sm">{team.gf}</td>
                    <td className="px-1 py-6 text-center text-slate-400 font-bold tabular-nums text-sm">{team.ga}</td>
                  </>
                )}
                
                <td className="px-1 py-6 text-center">
                    <span className="text-slate-900 dark:text-white font-black text-xl tabular-nums leading-none">{team.points}</span>
                </td>
                <td className="px-1 py-6 text-center">
                    <span className="text-slate-400 dark:text-slate-500 font-black text-[11px] tabular-nums leading-none font-mono">{(team.totalFP || 0).toFixed(1)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - High Density Grid */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
            <div className="bg-slate-50 dark:bg-brand-base/50 items-center px-4 py-4 border-b border-gray-100 dark:border-white/5 grid gap-0.5" style={{ gridTemplateColumns: mobileGridTemplate }}>
                <span className="text-[9px] font-black text-slate-400 uppercase truncate">Squadra</span>
                {mobileStatsCols.map(col => (
                  <span key={col.key} onClick={() => toggleSort(col.key as any)} className={`text-[9px] font-black uppercase text-center ${sortConfig.key === col.key ? 'text-brand-accent' : 'text-slate-400'}`}>
                      {col.label}
                  </span>
                ))}
            </div>
            {sortedStats.map((team) => (
                <div key={team.team} className="px-4 py-4 cursor-pointer overflow-hidden transition-colors active:bg-slate-100 dark:active:bg-white/5" onClick={() => onTeamClick && onTeamClick(team.team)}>
                    <div className="grid items-center gap-0.5" style={{ gridTemplateColumns: mobileGridTemplate }}>
                        <div className="flex items-center gap-2 min-w-0 pr-1">
                            <span className={`text-[10px] font-black w-4 text-center flex-shrink-0 ${team.rank < 4 ? 'text-amber-500' : 'text-slate-400'}`}>{team.rank}</span>
                            <span className="text-[11px] font-black uppercase truncate text-slate-900 dark:text-white leading-none">
                                {team.team}
                            </span>
                        </div>
                        {mobileStatsCols.map(col => {
                            let textClass = "text-slate-500 font-bold";
                            if (col.key === 'points') textClass = "text-slate-900 dark:text-white font-black text-[14px]";
                            else if (col.key === 'totalFP') textClass = "text-slate-400 dark:text-slate-500 font-black text-[10px] font-mono";
                            else if (col.key === 'won') textClass = "text-slate-900 dark:text-white font-black";
                            
                            const val = (team as any)[col.key];
                            return <span key={col.key} className={`${textClass} text-[10px] text-center tabular-nums`}>{typeof val === 'number' && val % 1 !== 0 ? val.toFixed(1) : val}</span>;
                        })}
                    </div>
                </div>
            ))}
      </div>
    </div>
  );
};