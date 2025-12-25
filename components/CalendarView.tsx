import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { getH2HDescription, getHeadToHeadHistory } from '../services/leagueService';
import { Calendar, ChevronLeft, ChevronRight, Snowflake } from 'lucide-react';

interface CalendarViewProps {
  matches: Match[];
  frozenMatchdays: number[];
  onTeamClick?: (teamName: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ matches, frozenMatchdays = [], onTeamClick }) => {
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1);
  
  useEffect(() => {
    const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
    const maxMilestone = Math.max(0, ...playedMatchdays, ...frozenMatchdays);
    const next = maxMilestone < 38 ? maxMilestone + 1 : 38;
    setSelectedMatchday(next);
  }, [matches, frozenMatchdays]);

  const currentMatches = matches.filter(m => m.matchday === selectedMatchday);
  const isFrozen = frozenMatchdays.includes(selectedMatchday);

  const handlePrev = () => {
    if (selectedMatchday > 1) setSelectedMatchday(selectedMatchday - 1);
  };

  const handleNext = () => {
    if (selectedMatchday < 38) setSelectedMatchday(selectedMatchday + 1);
  };

  const handleTeamClick = (teamName: string, e: React.MouseEvent) => {
    if (onTeamClick) {
        e.stopPropagation();
        onTeamClick(teamName);
    }
  }

  return (
    <div className="space-y-3 w-full max-w-full mx-auto animate-fadeIn px-1 md:px-0">
      <div className="bg-white dark:bg-brand-card rounded-2xl p-2.5 md:p-5 shadow-soft border border-gray-200 dark:border-white/5 flex flex-wrap md:flex-nowrap justify-between items-center gap-3 transition-colors">
        <div className="flex items-center gap-3 md:gap-5">
          <div className="p-2 md:p-3.5 bg-brand-accent/10 rounded-xl relative flex-shrink-0">
            <Calendar className="w-4 h-4 md:w-6 md:h-6 text-brand-accent" />
            {isFrozen && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span><Snowflake size={10} className="relative inline-flex text-brand-accent" /></span>}
          </div>
          <div>
            <h2 className="text-sm md:text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                Giornata {selectedMatchday}
                {isFrozen && <span className="text-[7px] bg-brand-accent/20 text-brand-accent px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-brand-accent/30 hidden sm:inline-block">Frozen</span>}
            </h2>
            <p className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Stagione 25/26</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-brand-base rounded-xl p-0.5 md:p-1 border border-slate-200 dark:border-white/5">
          <button onClick={handlePrev} disabled={selectedMatchday === 1} className="p-1 md:p-1.5 hover:bg-white dark:hover:bg-brand-card rounded-lg disabled:opacity-20 text-slate-800 dark:text-slate-400 transition-all">
            <ChevronLeft size={14} md:size={20} />
          </button>
          <div className="px-2 md:px-4 text-[10px] md:text-xs font-black tabular-nums text-slate-900 dark:text-slate-300">
            {selectedMatchday}<span className="text-slate-400 font-medium px-0.5">/</span>38
          </div>
          <button onClick={handleNext} disabled={selectedMatchday === 38} className="p-1 md:p-1.5 hover:bg-white dark:hover:bg-brand-card rounded-lg disabled:opacity-20 text-slate-800 dark:text-slate-400 transition-all">
            <ChevronRight size={14} md:size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 md:gap-4">
        {currentMatches.map((match) => {
            const h2hDesc = getH2HDescription(matches, match.homeTeam, match.awayTeam);
            const headToHead = getHeadToHeadHistory(matches, match.homeTeam, match.awayTeam);
            const homeWinner = match.isPlayed && (match.homeScore || 0) > (match.awayScore || 0);
            const awayWinner = match.isPlayed && (match.awayScore || 0) > (match.homeScore || 0);

            return (
              <div key={match.id} className="bg-white dark:bg-brand-card rounded-[1rem] md:rounded-[1.8rem] border border-gray-200 dark:border-white/5 shadow-soft flex flex-col overflow-hidden hover:border-brand-accent/30 transition-all duration-300 min-h-[160px] md:min-h-[220px]">
                <div className="p-2.5 md:p-5 flex flex-col min-w-0 flex-1 justify-center">
                    <div className="flex-1 flex flex-col justify-center gap-2 md:gap-4">
                        <div className={`flex items-center justify-between group ${onTeamClick ? 'cursor-pointer' : ''}`} onClick={(e) => handleTeamClick(match.homeTeam, e)}>
                            <span className={`text-[10px] md:text-sm font-black truncate tracking-tight uppercase ${homeWinner ? 'text-brand-accent' : 'text-slate-900 dark:text-slate-100'} group-hover:text-brand-accent transition-colors pr-1`}>{match.homeTeam}</span>
                            <span className="font-mono font-black text-sm md:text-xl tabular-nums text-slate-900 dark:text-slate-100">{match.isPlayed ? match.homeScore : '-'}</span>
                        </div>
                        <div className={`flex items-center justify-between group ${onTeamClick ? 'cursor-pointer' : ''}`} onClick={(e) => handleTeamClick(match.awayTeam, e)}>
                            <span className={`text-[10px] md:text-sm font-black truncate tracking-tight uppercase ${awayWinner ? 'text-brand-accent' : 'text-slate-900 dark:text-slate-100'} group-hover:text-brand-accent transition-colors pr-1`}>{match.awayTeam}</span>
                            <span className="font-mono font-black text-sm md:text-xl tabular-nums text-slate-900 dark:text-slate-100">{match.isPlayed ? match.awayScore : '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="px-2 py-2 md:py-3 bg-slate-50 dark:bg-brand-base/30 flex items-center justify-center border-t border-slate-100 dark:border-white/5">
                    <div className="text-[8px] md:text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight leading-tight text-center px-0.5">
                        {h2hDesc}
                    </div>
                </div>

                {headToHead.length > 0 && (
                  <div className="p-2 md:p-3 bg-slate-100/30 dark:bg-brand-base/10 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5">
                      {headToHead.slice(-2).reverse().map((h) => (
                          <div key={h.id} className="text-center text-[7.5px] md:text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight leading-none md:leading-normal">
                              {h.matchday}a: {h.homeTeam.substring(0,6)} <span className="text-brand-accent">{h.homeScore}-{h.awayScore}</span> {h.awayTeam.substring(0,6)}
                          </div>
                      ))}
                  </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};