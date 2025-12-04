
import React, { useState, useEffect } from 'react';
import { Match, DEFAULT_TEAMS, Prediction, SchedinaSubmission, LegacySchedineData, SchedineAdjustment } from '../types';
import { getH2HDescription, getHeadToHeadHistory, calculateSchedineLeaderboard } from '../services/leagueService';
import { Trophy, Clock, CheckCircle, User, LogOut, Info, Sparkles } from 'lucide-react';

interface SchedineProps {
  matches: Match[];
  legacyData: LegacySchedineData;
  adjustments: SchedineAdjustment;
  submissions: SchedinaSubmission[];
  onSubmit: (submission: SchedinaSubmission) => void;
}

const TEAM_ALIASES: Record<string, string> = {
  // Pronostici
  'PRONOSTICI': 'PRONOSTICI', 'PRO': 'PRONOSTICI', 'PRONO': 'PRONOSTICI', 
  // Squadradabbattere
  'SQUADRADABBATTERE': 'SQUADRADABBATTERE', 'UDB': 'SQUADRADABBATTERE', 'UOMODABBATTERE': 'SQUADRADABBATTERE', 'SDB': 'SQUADRADABBATTERE',
  // Rosaprofonda
  'ROSAPROFONDA': 'ROSAPROFONDA', 'ROS': 'ROSAPROFONDA', 'PFP': 'ROSAPROFONDA',
  // Off
  'OFF': 'OFF',
  // Isamu
  'ISAMU': 'ISAMU', 'ISA': 'ISAMU',
  // Spiaze
  'SPIAZE': 'SPIAZE', 'SPIA': 'SPIAZE', 'SPI': 'SPIAZE',
  // Horto
  'HORTO': 'HORTO', 'HOR': 'HORTO', 'HM': 'HORTO',
  // Satania
  'SATANIA': 'SATANIA', 'SAT': 'SATANIA',
  // Ninuzzo
  'NINUZZO': 'NINUZZO', 'NINO': 'NINUZZO', 'NIN': 'NINUZZO', 'CRO': 'NINUZZO',
  // Sayonara
  'SAYONARA': 'SAYONARA', 'SAYO': 'SAYONARA', 'SAY': 'SAYONARA', 'NARA': 'SAYONARA'
};

const USER_STORAGE_KEY = 'fantasy_schedine_user_v1';

export const Schedine: React.FC<SchedineProps> = ({ matches, legacyData, adjustments, submissions, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'play' | 'leaderboard'>('play');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loginError, setLoginError] = useState('');
  const [currentPredictions, setCurrentPredictions] = useState<Record<string, '1' | 'X' | '2'>>({});

  // Load saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (savedUser && DEFAULT_TEAMS.includes(savedUser)) {
        setCurrentUser(savedUser);
    }
  }, []);

  const playedMatchdays = matches.filter(m => m.isPlayed).map(m => m.matchday);
  const maxPlayed = playedMatchdays.length > 0 ? Math.max(...playedMatchdays) : 0;
  const nextMatchday = maxPlayed < 38 ? maxPlayed + 1 : 38;

  const nextMatches = matches.filter(m => m.matchday === nextMatchday);
  
  const currentWeekSubmissions = submissions
    .filter(s => s.matchday === nextMatchday)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Use adjustments in calculation
  const leaderboard = calculateSchedineLeaderboard(matches, submissions, legacyData, adjustments);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const rawInput = (e.target as any).username.value.trim().toUpperCase();
      
      const canonicalName = TEAM_ALIASES[rawInput] || rawInput;

      if (DEFAULT_TEAMS.includes(canonicalName)) {
          setCurrentUser(canonicalName);
          localStorage.setItem(USER_STORAGE_KEY, canonicalName);
          setLoginError('');
      } else {
          setLoginError(`Team name '${rawInput}' not found.`);
      }
  };

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentPredictions({});
  };

  const handlePrediction = (matchId: string, value: '1' | 'X' | '2') => {
      setCurrentPredictions(prev => ({ ...prev, [matchId]: value }));
  };

  const handleSubmit = () => {
      if (!currentUser) return;
      if (Object.keys(currentPredictions).length < nextMatches.length) {
          alert("Please predict all matches!");
          return;
      }
      const predictionList: Prediction[] = Object.entries(currentPredictions).map(([id, val]) => ({
          matchId: id,
          prediction: val as '1' | 'X' | '2'
      }));
      onSubmit({
          teamName: currentUser,
          matchday: nextMatchday,
          predictions: predictionList,
          timestamp: new Date().toISOString()
      });
      alert("Submitted!");
  };

  // Curiosities Logic (Italian)
  const getCuriosities = () => {
      if (currentWeekSubmissions.length < 2) return [];

      const curiosities: { type: 'unanimous' | 'missing', text: string }[] = [];

      nextMatches.forEach(match => {
          const preds = currentWeekSubmissions
              .map(s => s.predictions.find(p => p.matchId === match.id)?.prediction)
              .filter(p => p);
          
          if (preds.length === 0) return;

          // Check Unanimous
          const allSame = preds.every(p => p === preds[0]);
          if (allSame) {
              const outcome = preds[0] === '1' ? match.homeTeam : preds[0] === '2' ? match.awayTeam : 'Pareggio';
              curiosities.push({
                  type: 'unanimous',
                  text: `Tutti hanno scelto ${outcome} (${preds[0]}) per ${match.homeTeam.substring(0,3)} vs ${match.awayTeam.substring(0,3)}`
              });
          }

          // Check Missing (e.g., Nobody picked X)
          if (!preds.includes('X')) {
               curiosities.push({ type: 'missing', text: `Nessuno crede nel pareggio tra ${match.homeTeam.substring(0,3)} e ${match.awayTeam.substring(0,3)}` });
          } else if (!preds.includes('1')) {
               curiosities.push({ type: 'missing', text: `Nessuno crede nella vittoria di ${match.homeTeam}.` });
          } else if (!preds.includes('2')) {
               curiosities.push({ type: 'missing', text: `Nessuno crede nella vittoria di ${match.awayTeam}.` });
          }
      });

      return curiosities;
  };

  const curiosities = getCuriosities();

  if (!currentUser && activeTab === 'play') {
      return (
          <div className="flex flex-col items-center justify-center py-20 px-4">
             <div className="bg-white dark:bg-[#1c1c1e] p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-sm text-center">
                 <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <User className="w-8 h-8 text-blue-500" />
                 </div>
                 <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Schedine Login</h2>
                 <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Enter your Team Name to predict</p>
                 <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <input 
                        name="username"
                        type="text" 
                        placeholder="Team Name (or alias)"
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    {loginError && <p className="text-red-500 text-xs">{loginError}</p>}
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                        Start Playing
                    </button>
                 </form>
                 <button onClick={() => setActiveTab('leaderboard')} className="mt-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm font-medium">
                     View Leaderboard
                 </button>
             </div>
          </div>
      );
  }

  return (
    <div className="w-full max-w-[1920px] mx-auto space-y-8">
        {/* Navigation Tabs */}
        <div className="flex justify-center">
            <div className="bg-white dark:bg-[#1c1c1e] p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm inline-flex">
                <button 
                    onClick={() => setActiveTab('play')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'play' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                >
                    Predictions
                </button>
                <button 
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                >
                    Leaderboard
                </button>
            </div>
        </div>

        {activeTab === 'play' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
                
                {/* COLUMN 1: Prediction Interface */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Matchday {nextMatchday}</h2>
                                <p className="text-gray-500 text-sm">Make your 1X2 selections</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                                     <div className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Player</div>
                                     <div className="font-bold text-blue-600 dark:text-blue-300">{currentUser}</div>
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {nextMatches.map(match => {
                                 const h2hDesc = getH2HDescription(matches, match.homeTeam, match.awayTeam);
                                 const h2h = getHeadToHeadHistory(matches, match.homeTeam, match.awayTeam);

                                 return (
                                     <div key={match.id} className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 transition-colors hover:border-blue-200 dark:hover:border-blue-900">
                                         
                                         {/* CLEAN STACKED LAYOUT */}
                                         <div className="flex flex-col gap-4 mb-2">
                                             
                                             {/* Teams Row */}
                                             <div className="flex items-center justify-between">
                                                 {/* Home Team */}
                                                 <div className="flex items-center gap-3 flex-1 min-w-0">
                                                     <div className="relative flex-shrink-0">
                                                        <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-white">
                                                            {match.homeTeam[0]}
                                                        </div>
                                                     </div>
                                                     <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{match.homeTeam}</span>
                                                 </div>

                                                 {/* VS label */}
                                                 <div className="px-3">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-100 dark:border-gray-700">VS</span>
                                                 </div>

                                                 {/* Away Team */}
                                                 <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
                                                     <span className="font-bold text-sm text-gray-900 dark:text-white text-right truncate">{match.awayTeam}</span>
                                                     <div className="relative flex-shrink-0">
                                                        <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-xs border border-gray-200 dark:border-gray-700 shadow-sm text-gray-900 dark:text-white">
                                                            {match.awayTeam[0]}
                                                        </div>
                                                     </div>
                                                 </div>
                                             </div>

                                             {/* Buttons Row (Full Width) */}
                                             <div className="grid grid-cols-3 gap-2">
                                                 {['1', 'X', '2'].map(opt => (
                                                     <button
                                                         key={opt}
                                                         onClick={() => handlePrediction(match.id, opt as any)}
                                                         className={`h-11 rounded-xl font-bold text-sm transition-all ${
                                                             currentPredictions[match.id] === opt 
                                                             ? 'bg-blue-500 text-white shadow-lg scale-[1.02] ring-2 ring-blue-200 dark:ring-blue-900' 
                                                             : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                                                         }`}
                                                     >
                                                         {opt}
                                                     </button>
                                                 ))}
                                             </div>
                                         </div>
                                         
                                         <div className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-3 px-1 font-medium italic">
                                             {h2hDesc}
                                         </div>

                                         {/* Full Match History */}
                                         {h2h.length > 0 && (
                                            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
                                                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">Previous Meetings</div>
                                                <div className="space-y-1.5">
                                                    {h2h.slice().reverse().map(m => (
                                                        <div key={m.id} className="flex items-center justify-between text-[10px] bg-white dark:bg-gray-900/80 p-2 rounded-lg border border-gray-100 dark:border-gray-800/50">
                                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                <span className="font-mono text-gray-400 w-8 flex-shrink-0">MD{m.matchday}</span>
                                                                <span className={`truncate ${m.homeTeam === match.homeTeam ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                    {m.homeTeam}
                                                                </span>
                                                            </div>
                                                            <div className="font-mono font-bold text-gray-900 dark:text-white px-2">
                                                                {m.homeScore}-{m.awayScore}
                                                            </div>
                                                            <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
                                                                <span className={`truncate text-right ${m.awayTeam === match.awayTeam ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                                                                    {m.awayTeam}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                         )}
                                     </div>
                                 );
                            })}
                        </div>

                        <div className="mt-8">
                            <button 
                                onClick={handleSubmit}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <CheckCircle size={20} />
                                Submit Prediction
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: Status & Feed */}
                <div className="space-y-6">
                    {/* Status List */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                            <Info size={16} className="text-gray-400" /> Submission Status
                        </h3>
                        <div className="grid grid-cols-2 gap-2">
                            {DEFAULT_TEAMS.map(team => {
                                const submitted = currentWeekSubmissions.some(s => s.teamName === team);
                                return (
                                    <div key={team} className="flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                        <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 truncate max-w-[80px]">{team}</span>
                                        <span className={`w-2.5 h-2.5 rounded-full ${submitted ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-red-500 shadow-sm shadow-red-500/50'}`}></span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm sticky top-6">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Clock size={18} className="text-orange-500" /> Live Feed
                        </h3>
                        <div className="space-y-4">
                            {currentWeekSubmissions.map((sub, idx) => (
                                <div key={idx} className="flex flex-col gap-3 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl border-l-4 border-blue-500">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white text-sm">{sub.teamName}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">Predictions confirmed</div>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium font-mono text-right">
                                            <div>{new Date(sub.timestamp).toLocaleDateString('it-IT')}</div>
                                            <div>{new Date(sub.timestamp).toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                    
                                    {/* Predictions Row */}
                                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100 dark:border-gray-800/50">
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
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-none">{m.homeTeam.substring(0,3)}</span>
                                                        <span className="text-[7px] text-gray-300 dark:text-gray-600 font-bold leading-none my-0.5">vs</span>
                                                        <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase leading-none">{m.awayTeam.substring(0,3)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            {currentWeekSubmissions.length === 0 && (
                                <div className="text-center text-gray-400 py-8 text-sm bg-gray-50 dark:bg-gray-900/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                    No predictions yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* COLUMN 3: Curiosities & Leaderboard Widget */}
                <div className="space-y-6">
                    {/* Curiosities Section */}
                    {curiosities.length > 0 && (
                        <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
                                <Sparkles size={16} className="text-purple-500" /> Curiosità Predictions
                            </h3>
                            <div className="space-y-2">
                                {curiosities.map((c, i) => (
                                    <div key={i} className={`p-3 rounded-xl text-xs border ${
                                        c.type === 'unanimous' 
                                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-200 border-purple-100 dark:border-purple-800' 
                                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 border-amber-100 dark:border-amber-800'
                                    }`}>
                                        {c.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Mini Leaderboard Widget */}
                    <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm sticky top-6">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Top 5 Leaderboard</h3>
                            <button onClick={() => setActiveTab('leaderboard')} className="text-[10px] text-blue-500 font-bold uppercase hover:underline">View All</button>
                        </div>
                        <table className="w-full text-left text-xs">
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {leaderboard.slice(0, 5).map((row, idx) => (
                                    <tr key={row.teamName} className={`${currentUser === row.teamName ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                        <td className="px-4 py-3 font-mono text-gray-400 w-8">#{row.rank}</td>
                                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white truncate max-w-[100px]">{row.teamName}</td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600 dark:text-blue-400">{row.totalCorrect}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'leaderboard' && (
            <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-[#1c1c1e]">
                    <div className="bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-xl">
                        <Trophy className="text-yellow-500 w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedine Leaderboard</h2>
                        <p className="text-sm text-gray-500">Season Rankings</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 sm:px-8 py-5">Rank</th>
                                <th className="px-6 sm:px-8 py-5">Fantamanager</th>
                                <th className="px-6 sm:px-8 py-5 text-center">Total Correct</th>
                                <th className="px-6 sm:px-8 py-5 text-center">Perfect Weeks</th>
                                <th className="px-6 sm:px-8 py-5 text-center">Last Week</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {leaderboard.map((row, idx) => (
                                <tr key={row.teamName} className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors ${idx < 3 ? 'bg-yellow-50/30 dark:bg-yellow-900/5' : ''}`}>
                                    <td className="px-6 sm:px-8 py-5 font-mono text-gray-400 text-sm">#{row.rank}</td>
                                    <td className="px-6 sm:px-8 py-5 font-bold text-gray-900 dark:text-white">{row.teamName}</td>
                                    <td className="px-6 sm:px-8 py-5 text-center font-bold text-blue-600 dark:text-blue-400 text-lg">
                                        {row.totalCorrect}
                                    </td>
                                    <td className="px-6 sm:px-8 py-5 text-center">
                                        {row.perfectWeeks > 0 && (
                                            <span className="inline-flex items-center gap-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 dark:border-yellow-800">
                                                <Trophy size={12} /> {row.perfectWeeks}
                                            </span>
                                        )}
                                        {row.perfectWeeks === 0 && <span className="text-gray-300 dark:text-gray-700">-</span>}
                                    </td>
                                    <td className="px-6 sm:px-8 py-5 text-center text-gray-500 dark:text-gray-400 font-medium">
                                        {row.lastWeekCorrect > 0 ? `+${row.lastWeekCorrect}` : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
  );
};
