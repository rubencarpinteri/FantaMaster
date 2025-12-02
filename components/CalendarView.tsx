import React, { useState, useEffect } from 'react';
import { Match } from '../types';
import { getH2HDescription, getHeadToHeadHistory } from '../services/leagueService';
import { Calendar, ChevronLeft, ChevronRight, History, Hash } from 'lucide-react';

interface CalendarViewProps {
  matches: Match[];
  onTeamClick?: (teamName: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ matches, onTeamClick }) => {
  const [selectedMatchday, setSelectedMatchday] = useState<number>(1);
  
  useEffect(() => {
    const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
    const maxPlayed = playedMatchdays.length > 0 ? Math.max(...playedMatchdays) : 0;
    const next = maxPlayed < 38 ? maxPlayed + 1 : 38;
    setSelectedMatchday(next);
  }, [matches]);

  const currentMatches = matches.filter(m => m.matchday === selectedMatchday);

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
    <div className="space-y-6 w-full max-w-full mx-auto animate-fadeIn">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Matchday {selectedMatchday}</h2>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Season 24/25</p>
          </div>
        </div>

        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1">
          <button 
            onClick={handlePrev}
            disabled={selectedMatchday === 1}
            className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 text-gray-500 dark:text-gray-300 transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={selectedMatchday === 38}
            className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 text-gray-500 dark:text-gray-300 transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Matches Grid - Horizontal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {currentMatches.map((match) => {
            const h2hDesc = getH2HDescription(matches, match.homeTeam, match.awayTeam);
            const headToHead = getHeadToHeadHistory(matches, match.homeTeam, match.awayTeam);

            // Determine winner for highlighting
            const homeWinner = match.isPlayed && (match.homeScore || 0) > (match.awayScore || 0);
            const awayWinner = match.isPlayed && (match.awayScore || 0) > (match.homeScore || 0);

            return (
              <div 
                key={match.id} 
                className="bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-stretch overflow-hidden hover:shadow-md transition-shadow h-32"
              >
                {/* Left Side: Teams & Score */}
                <div className="flex-1 p-3 flex flex-col min-w-0">
                    <div className="flex-1 flex flex-col justify-center gap-3">
                        {/* Home Team Row */}
                        <div 
                            className={`flex items-center justify-between group ${onTeamClick ? 'cursor-pointer' : ''}`}
                            onClick={(e) => handleTeamClick(match.homeTeam, e)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border relative ${
                                    homeWinner 
                                    ? 'bg-white dark:bg-gray-800 text-green-500 border-green-500 shadow-sm' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700'
                                }`}>
                                    {match.homeTeam.charAt(0)}
                                </div>
                                <span className={`text-xs font-bold truncate ${homeWinner ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {match.homeTeam}
                                </span>
                            </div>
                            <span className={`font-mono font-bold text-xs ${homeWinner ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                {match.isPlayed ? match.homeScore : '-'}
                            </span>
                        </div>

                        {/* Away Team Row */}
                        <div 
                            className={`flex items-center justify-between group ${onTeamClick ? 'cursor-pointer' : ''}`}
                            onClick={(e) => handleTeamClick(match.awayTeam, e)}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border relative ${
                                    awayWinner 
                                    ? 'bg-white dark:bg-gray-800 text-green-500 border-green-500 shadow-sm' 
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-700'
                                }`}>
                                    {match.awayTeam.charAt(0)}
                                </div>
                                <span className={`text-xs font-bold truncate ${awayWinner ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                    {match.awayTeam}
                                </span>
                            </div>
                            <span className={`font-mono font-bold text-xs ${awayWinner ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                                {match.isPlayed ? match.awayScore : '-'}
                            </span>
                        </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50 text-[9px] text-gray-400 leading-tight">
                        {h2hDesc}
                    </div>
                </div>

                {/* Vertical Divider */}
                <div className="w-px bg-gray-100 dark:bg-gray-800 my-2"></div>

                {/* Right Side: History / Details - Scrollable */}
                <div className="w-24 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col p-2 text-center overflow-y-auto custom-scrollbar">
                    {headToHead.length > 0 ? (
                        <div className="flex flex-col gap-1 w-full">
                            <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-blue-500 uppercase tracking-widest mb-1 sticky top-0 bg-gray-50 dark:bg-[#1c1c1e] py-0.5 rounded backdrop-blur-sm z-10">
                                <History size={8} /> History
                            </div>
                            {headToHead.slice().reverse().map((h) => (
                                <div key={h.id} className="flex justify-between items-center px-1.5 py-0.5 rounded hover:bg-white dark:hover:bg-gray-800 transition-colors shrink-0">
                                    <span className="text-[8px] text-gray-400">MD{h.matchday}</span>
                                    <span className="text-[9px] font-mono font-medium text-gray-700 dark:text-gray-300">
                                        {h.homeScore}-{h.awayScore}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-1 opacity-50">
                            <Hash size={14} className="text-gray-300" />
                            <span className="text-[9px] text-gray-400 italic">No history</span>
                        </div>
                    )}
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};