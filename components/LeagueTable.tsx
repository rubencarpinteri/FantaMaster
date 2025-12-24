import React, { useState, useMemo } from 'react';
import { TeamStats, Competition } from '../types';
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronRight, BarChart3 } from 'lucide-react';

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
        return <ArrowUpDown size={10} className="opacity-20 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp size={10} className="text-brand-accent" /> : <ArrowDown size={10} className="text-brand-accent" />;
  };

  const mobileStatsCols = [
    { key: 'played', label: 'G', w: '20px' },
    { key: 'won', label: 'V', w: '20px' },
    { key: 'drawn', label: 'N', w: '20px' },
    { key: 'lost', label: 'P', w: '20px' },
    { key: 'gf', label: 'F', w: '22px' },
    { key: 'ga', label: 'S', w: '22px' },
    { key: 'points', label: 'Pt', w: '26px' },
  ] as const;

  // Mobile Grid Template: Team Name (min 60px) + 7 stat columns (fixed widths) + Form area (50px)
  const mobileGridTemplate = `minmax(60px, 1fr) repeat(7, minmax(20px, auto)) 50px`;

  return (
    <div className="bg-white dark:bg-brand-card rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all duration-300 max-w-7xl mx-auto mb-10 animate-fadeIn">
      <header className="px-6 md:px-14 py-8 md:py-12 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-brand-base/20">
        <div className="flex items-center gap-4 md:gap-10">
            <div className={`p-4 md:p-7 rounded-[1.2rem] md:rounded-[1.8rem] shadow-glow-blue border border-brand-accent/20 grain ${isBattleRoyale ? 'bg-brand-secondary/10' : 'bg-brand-accent/10'}`}>
                <BarChart3 className={isBattleRoyale ? 'text-brand-secondary' : 'text-brand-accent'} size={24} md:size={36} />
            </div>
            <div>
                <h2 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1 md:mb-3">{title}</h2>
                <p className="text-[8px] md:text-sm text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                    {isBattleRoyale ? 'Classifica Globale Royale' : 'Stagione Ufficiale 2025/26'}
                </p>
            </div>
        </div>
      </header>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto custom-scrollbar">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-brand-base/50 text-slate-400 dark:text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 dark:border-white/5">
              <th className="px-8 py-6 text-center">#</th>
              <th className="px-6 py-6 text-left cursor-pointer" onClick={() => toggleSort('team')}>Squadra {getSortIcon('team')}</th>
              {['played', 'won', 'drawn', 'lost', 'gf', 'ga', 'points', 'totalFP'].map((col) => {
                  if ((col === 'gf' || col === 'ga') && !isCampionato) return null;
                  const labels: Record<string, string> = { played: 'G', won: 'V', drawn: 'N', lost: 'P', gf: 'GF', ga: 'GS', points: 'Pt', totalFP: 'FP' };
                  return <th key={col} className="px-3 py-6 text-center cursor-pointer" onClick={() => toggleSort(col as any)}>{labels[col]} {getSortIcon(col as any)}</th>;
              })}
              <th className={`px-8 py-6 text-center uppercase ${isBattleRoyale ? 'hidden' : ''}`}>Form</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {sortedStats.map((team) => (
              <tr key={team.team} className="group hover:bg-brand-accent/[0.03] transition-all duration-150">
                <td className="px-8 py-6 text-center">
                    {team.rank < 4 ? <span className="text-2xl">{team.rank === 1 ? "🥇" : team.rank === 2 ? "🥈" : "🥉"}</span> : <span className="font-black text-base text-slate-300 dark:text-slate-700 tabular-nums">#{team.rank}</span>}
                </td>
                <td className={`px-6 py-6 font-black uppercase text-base text-slate-900 dark:text-slate-100 tracking-tight cursor-pointer`} onClick={() => onTeamClick && onTeamClick(team.team)}>
                    <span className="group-hover:text-brand-accent transition-colors">{team.team}</span>
                </td>
                <td className="px-3 py-6 text-center text-slate-500 font-bold">{team.played}</td>
                <td className="px-3 py-6 text-center text-slate-900 dark:text-slate-200 font-black">{team.won}</td>
                <td className="px-3 py-6 text-center text-slate-500 font-bold">{team.drawn}</td>
                <td className="px-3 py-6 text-center text-slate-500 font-bold">{team.lost}</td>
                {isCampionato && <><td className="px-3 py-6 text-center text-slate-400 font-bold">{team.gf}</td><td className="px-3 py-6 text-center text-slate-400 font-bold">{team.ga}</td></>}
                <td className="px-3 py-6 text-center">
                    <span className="inline-block min-w-[42px] py-1.5 px-3.5 rounded-xl bg-slate-100 dark:bg-brand-base text-brand-accent font-black shadow-sm border border-brand-accent/20 text-lg grain">{team.points}</span>
                </td>
                <td className="px-3 py-6 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px] font-black">{team.totalFP.toFixed(1)}</td>
                <td className={`px-8 py-6 text-center ${isBattleRoyale ? 'hidden' : ''}`}>
                    <div className="flex justify-center gap-1">
                      {team.form.slice(-5).map((r, i) => (
                        <span key={i} className={`block w-2 h-7 rounded-full transition-all ${r.result === 'W' ? 'bg-brand-success shadow-glow-green' : r.result === 'D' ? 'bg-slate-300 dark:bg-slate-700' : 'bg-brand-danger shadow-glow-red'}`}></span>
                      ))}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View - HIGH DENSITY GRID WITH GF/GS AND FORM */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-white/5">
            <div className="bg-slate-50 dark:bg-brand-base/50 items-center px-4 py-3 border-b border-gray-100 dark:border-white/5 grid gap-0.5" style={{ gridTemplateColumns: mobileGridTemplate }}>
                <span className="text-[8px] font-black text-slate-400 uppercase truncate">Squadra</span>
                {mobileStatsCols.map(col => (
                    <span key={col.key} onClick={() => toggleSort(col.key as any)} className={`text-[8px] font-black uppercase text-center ${sortConfig.key === col.key ? 'text-brand-accent' : 'text-slate-400'}`}>
                        {col.label}
                    </span>
                ))}
                <span className={`text-[8px] font-black text-slate-400 uppercase text-center ${isBattleRoyale ? 'opacity-0' : ''}`}>Form</span>
            </div>
            {sortedStats.map((team) => (
                <div key={team.team} className="px-4 py-3 cursor-pointer overflow-hidden transition-colors active:bg-slate-100 dark:active:bg-white/5" onClick={() => onTeamClick && onTeamClick(team.team)}>
                    <div className="grid items-center gap-0.5" style={{ gridTemplateColumns: mobileGridTemplate }}>
                        <div className="flex items-center gap-1 min-w-0 pr-1">
                            <span className={`text-[9px] font-black w-3 text-center flex-shrink-0 ${team.rank < 4 ? 'text-amber-500' : 'text-slate-400'}`}>{team.rank}</span>
                            <span className="text-[10px] font-black uppercase truncate text-slate-900 dark:text-white leading-none flex-1">
                                {team.team}
                            </span>
                        </div>
                        {mobileStatsCols.map(col => {
                            let textClass = "text-slate-500 font-bold";
                            if (col.key === 'points') textClass = "text-brand-accent font-black text-[11px]";
                            else if (col.key === 'won') textClass = "text-slate-900 dark:text-white font-black";
                            else if (col.key === 'gf' || col.key === 'ga') textClass = "text-slate-400 font-medium";
                            
                            return <span key={col.key} className={`${textClass} text-[9px] text-center tabular-nums`}>{(team as any)[col.key]}</span>;
                        })}
                        <div className={`flex justify-center gap-0.5 ${isBattleRoyale ? 'opacity-0' : ''}`}>
                             {team.form.slice(-5).map((r, i) => (
                                <span key={i} className={`block w-1 h-3 rounded-full ${r.result === 'W' ? 'bg-brand-success' : r.result === 'D' ? 'bg-slate-300' : 'bg-brand-danger'}`}></span>
                             ))}
                        </div>
                    </div>
                </div>
            ))}
      </div>
    </div>
  );
};