
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
    <div className="space-y-4 w-full max-w-full mx-auto animate-fadeIn px-1 md:px-0">
      <div className="bg-white dark:bg-brand-card rounded-2xl p-3 md:p-6 shadow-soft border border-gray-200 dark:border-white/5 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 transition-colors">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="p-3 md:p-4 bg-brand-accent/10 rounded-xl relative flex-shrink-0">
            <Calendar className="w-5 h-5 md:w-8 md:h-8 text-brand-accent" />
            {isFrozen && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-75"></span><Snowflake size={12} className="relative inline-flex text-brand-accent" /></span>}
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
                Giornata {selectedMatchday}
                {isFrozen && <span className="text-[8px] bg-brand-accent/20 text-brand-accent px-2 py-1 rounded-full font-black uppercase tracking-widest border border-brand-accent/30 hidden sm:inline-block">Frozen</span>}
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Stagione 25/26</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-brand-base rounded-xl p-1 md:p-2 border border-slate-200 dark:border-white/5">
          <button onClick={handlePrev} disabled={selectedMatchday === 1} className="p-1.5 md:p-2.5 hover:bg-white dark:hover:bg-brand-card rounded-lg disabled:opacity-20 text-slate-800 dark:text-slate-400 transition-all">
            <ChevronLeft size={18} md:size={24} />
          </button>
          <div className="px-3 md:px-6 text-xs md:text-xl font-black tabular-nums text-slate-900 dark:text-slate-300">
            {selectedMatchday}<span className="text-slate-400 font-medium px-1">/</span>38
          </div>
          <button onClick={handleNext} disabled={selectedMatchday === 38} className="p-1.5 md:p-2.5 hover:bg-white dark:hover:bg-brand-card rounded-lg disabled:opacity-20 text-slate-800 dark:text-slate-400 transition-all">
            <ChevronRight size={18} md:size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-6">
        {currentMatches.map((match) => {
            const h2hDesc = getH2HDescription(matches, match.homeTeam, match.awayTeam);
            const headToHead = getHeadToHeadHistory(matches, match.homeTeam, match.awayTeam);
            const homeWinner = match.isPlayed && (match.homeScore || 0) > (match.awayScore || 0);
            const awayWinner = match.isPlayed && (match.awayScore || 0) > (match.homeScore || 0);

            return (
              <div key={match.id} className="bg-white dark:bg-brand-card rounded-[1.2rem] md:rounded-[2rem] border border-gray-200 dark:border-white/5 shadow-soft flex flex-col overflow-hidden hover:border-brand-accent/30 transition-all duration-300 min-h-[210px] md:min-h-[280px]">
                <div className="p-3.5 md:p-7 flex flex-col min-w-0 flex-1 justify-center">
                    <div className="flex-1 flex flex-col justify-center gap-3.5 md:gap-6">
                        <div className={`flex items-center justify-between group ${onTeamClick ? 'cursor-pointer' : ''}`} onClick={(e) => handleTeamClick(match.homeTeam, e)}>
                            <span className={`text-[12px] md:text-lg font-black truncate tracking-tight uppercase ${homeWinner ? 'text-brand-accent' : 'text-slate-900 dark:text-slate-100'} group-hover:text-brand-accent transition-colors pr-1`}>{match.homeTeam}</span>
                            <span className="font-mono font-black text-lg md:text-3xl tabular-nums text-slate-900 dark:text-slate-100">{match.isPlayed ? match.homeScore : '-'}</span>
                        </div>
                        <div className={`flex items-center justify-between group ${onTeamClick ? 'cursor-pointer' : ''}`} onClick={(e) => handleTeamClick(match.awayTeam, e)}>
                            <span className={`text-[12px] md:text-lg font-black truncate tracking-tight uppercase ${awayWinner ? 'text-brand-accent' : 'text-slate-900 dark:text-slate-100'} group-hover:text-brand-accent transition-colors pr-1`}>{match.awayTeam}</span>
                            <span className="font-mono font-black text-lg md:text-3xl tabular-nums text-slate-900 dark:text-slate-100">{match.isPlayed ? match.awayScore : '-'}</span>
                        </div>
                    </div>
                </div>
                
                <div className="px-3 py-2.5 md:py-4 bg-slate-50 dark:bg-brand-base/30 flex items-center justify-center border-t border-slate-100 dark:border-white/5">
                    <div className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight leading-tight text-center px-1">
                        {h2hDesc}
                    </div>
                </div>

                {headToHead.length > 0 && (
                  <div className="p-3 md:p-4 bg-slate-100/30 dark:bg-brand-base/10 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                      {headToHead.slice(-2).reverse().map((h) => (
                          <div key={h.id} className="text-center text-[9px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-tight leading-none md:leading-normal">
                              {h.matchday}a: {h.homeTeam} <span className="text-brand-accent">{h.homeScore}-{h.awayScore}</span> {h.awayTeam}
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
