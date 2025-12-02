import React, { useState } from 'react';
import { Match, SchedineAdjustment, SchedinaLeaderboardRow } from '../types';
import { Save, Lock, Unlock, Trash2, CalendarCheck, AlertCircle, Ticket, Edit3 } from 'lucide-react';

interface AdminPanelProps {
  matches: Match[];
  schedineStats: SchedinaLeaderboardRow[];
  adjustments: SchedineAdjustment;
  onUpdateMatch: (matchId: string, hScore: number | null, aScore: number | null, hFP: number | null, aFP: number | null) => void;
  onUpdateSchedineAdjustment: (team: string, extraCorrect: number, extraPerfect: number) => void;
  onReset: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ matches, schedineStats, adjustments, onUpdateMatch, onUpdateSchedineAdjustment, onReset }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'schedine'>('matches');
  const [filterMatchday, setFilterMatchday] = useState<number | 'all'>('all');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Wrong password');
    }
  };

  const uniqueMatchdays = Array.from(new Set(matches.map(m => m.matchday))).sort((a: number, b: number) => a - b);
  const filteredMatches = filterMatchday === 'all' 
    ? matches 
    : matches.filter(m => m.matchday === filterMatchday);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 transition-colors">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-6">
          <Lock className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Admin Login</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Access restricted to league administrators</p>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-xs px-6">
          <div className="relative">
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white transition-all"
                placeholder="Password"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95">
              Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#1c1c1e] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 gap-4 transition-colors">
        <div className="flex items-center gap-4">
             <button
                onClick={() => setActiveTab('matches')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'matches' ? 'bg-blue-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             >
                <Unlock className="w-4 h-4" />
                Matches
             </button>
             <button
                onClick={() => setActiveTab('schedine')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === 'schedine' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
             >
                <Ticket className="w-4 h-4" />
                Schedine
             </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
            {activeTab === 'matches' && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Matchday:</span>
                    <select 
                        value={filterMatchday}
                        onChange={(e) => setFilterMatchday(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                        className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm outline-none text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All</option>
                        {uniqueMatchdays.map(md => (
                            <option key={md} value={md}>{md}</option>
                        ))}
                    </select>
                </div>
            )}
            
            <button 
                onClick={onReset}
                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 transition-colors"
            >
                <Trash2 size={14} />
                Reset
            </button>
            
            <button 
                onClick={() => setIsAuthenticated(false)}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                Logout
            </button>
        </div>
      </div>
      
      {activeTab === 'matches' && (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 text-sm flex items-start gap-3">
                <AlertCircle size={18} className="text-blue-500 flex-shrink-0 mt-0.5"/>
                <div className="text-blue-900 dark:text-blue-100">
                    <span className="font-bold">Instructions:</span> Update 
                    <span className="mx-1 font-bold">Goals</span> for Campionato & Battle Royale results.
                    Update <span className="mx-1 font-bold">Fantasy Points (FP)</span> for records.
                    Changes are saved automatically when you click Save.
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map(match => (
                <MatchEditor key={match.id} match={match} onSave={onUpdateMatch} />
                ))}
            </div>
            
            {filteredMatches.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                    No matches found for this filter.
                </div>
            )}
        </div>
      )}

      {activeTab === 'schedine' && (
        <div className="space-y-6 animate-fadeIn">
             <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl p-4 text-sm flex items-start gap-3">
                <Edit3 size={18} className="text-purple-500 flex-shrink-0 mt-0.5"/>
                <div className="text-purple-900 dark:text-purple-100">
                    <span className="font-bold">Schedine Overrides:</span> Here you can manually adjust the leaderboard scores. 
                    The "Adjustment" value is added to the calculated score. Use negative numbers to subtract.
                </div>
            </div>

            <div className="bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase font-bold text-xs">
                        <tr>
                            <th className="px-6 py-4">Team</th>
                            <th className="px-6 py-4 text-center">Calculated Total</th>
                            <th className="px-6 py-4 text-center">Manual Adj (+/-)</th>
                            <th className="px-6 py-4 text-center">Final Total</th>
                            <th className="px-6 py-4 text-center">Perfect Weeks Adj</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {schedineStats.map((stat) => {
                            const adj = adjustments[stat.teamName] || { extraCorrect: 0, extraPerfect: 0 };
                            // We need to know the raw calculated score to show context. 
                            // Since schedineStats already includes adjustments, Raw = Total - Adj
                            const rawTotal = stat.totalCorrect - adj.extraCorrect;
                            
                            return (
                                <SchedineRowEditor 
                                    key={stat.teamName} 
                                    team={stat.teamName} 
                                    rawTotal={rawTotal}
                                    currentAdj={adj}
                                    onSave={onUpdateSchedineAdjustment}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

const SchedineRowEditor: React.FC<{ 
    team: string, 
    rawTotal: number, 
    currentAdj: { extraCorrect: number, extraPerfect: number },
    onSave: (team: string, ec: number, ep: number) => void 
}> = ({ team, rawTotal, currentAdj, onSave }) => {
    const [extraCorrect, setExtraCorrect] = useState(currentAdj.extraCorrect.toString());
    const [extraPerfect, setExtraPerfect] = useState(currentAdj.extraPerfect.toString());
    const [isDirty, setIsDirty] = useState(false);

    const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
        setter(val);
        setIsDirty(true);
    };

    const handleSave = () => {
        const ec = parseInt(extraCorrect) || 0;
        const ep = parseInt(extraPerfect) || 0;
        onSave(team, ec, ep);
        setIsDirty(false);
    };

    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{team}</td>
            <td className="px-6 py-4 text-center text-gray-500">{rawTotal}</td>
            <td className="px-6 py-4 text-center">
                 <input 
                    type="number" 
                    value={extraCorrect}
                    onChange={(e) => handleChange(setExtraCorrect, e.target.value)}
                    className="w-16 px-2 py-1 text-center bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </td>
            <td className="px-6 py-4 text-center font-bold text-purple-600 dark:text-purple-400">
                {rawTotal + (parseInt(extraCorrect) || 0)}
            </td>
            <td className="px-6 py-4 text-center">
                 <input 
                    type="number" 
                    value={extraPerfect}
                    onChange={(e) => handleChange(setExtraPerfect, e.target.value)}
                    className="w-16 px-2 py-1 text-center bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </td>
            <td className="px-6 py-4 text-center">
                <button 
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={`p-2 rounded-lg transition-all ${isDirty ? 'bg-purple-500 text-white shadow-md hover:bg-purple-600' : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'}`}
                >
                    <Save size={16} />
                </button>
            </td>
        </tr>
    );
};

const MatchEditor: React.FC<{ match: Match; onSave: (id: string, h: number | null, a: number | null, hfp: number | null, afp: number | null) => void }> = ({ match, onSave }) => {
  const [hScore, setHScore] = useState<string>(match.homeScore !== null ? match.homeScore.toString() : '');
  const [aScore, setAScore] = useState<string>(match.awayScore !== null ? match.awayScore.toString() : '');
  const [hFP, setHFP] = useState<string>(match.homeFantasyPoints !== null ? match.homeFantasyPoints.toString() : '');
  const [aFP, setAFP] = useState<string>(match.awayFantasyPoints !== null ? match.awayFantasyPoints.toString() : '');
  
  const [isDirty, setIsDirty] = useState(false);

  const parseLocalizedFloat = (val: string): number => {
    if (!val) return NaN;
    return parseFloat(val.replace(',', '.'));
  };

  const handleSave = () => {
    if (hScore === '' && aScore === '') {
        onSave(match.id, null, null, null, null);
        setIsDirty(false);
        return;
    }

    const h = parseLocalizedFloat(hScore);
    const a = parseLocalizedFloat(aScore);
    const hf = parseLocalizedFloat(hFP);
    const af = parseLocalizedFloat(aFP);
    
    if (!isNaN(h) && !isNaN(a)) {
      const cleanHF = isNaN(hf) ? 0 : hf;
      const cleanAF = isNaN(af) ? 0 : af;
      onSave(match.id, h, a, cleanHF, cleanAF);
      setIsDirty(false);
    } else {
        alert("Please enter valid numbers.");
    }
  };

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    setter(val);
    setIsDirty(true);
  };

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
        match.isPlayed 
        ? 'bg-white dark:bg-[#1c1c1e] border-gray-100 dark:border-gray-800 shadow-sm' 
        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-100 dark:border-gray-800'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
            MD {match.matchday}
        </span>
        {match.isPlayed && <span className="text-xs text-green-500 flex items-center gap-1 font-medium"><CalendarCheck size={12}/> Played</span>}
        {isDirty && <span className="text-xs text-amber-500 font-bold animate-pulse">Unsaved</span>}
      </div>
      
      <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm w-1/3 truncate text-gray-900 dark:text-white" title={match.homeTeam}>{match.homeTeam}</span>
            <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">FP</span>
                    <input 
                        type="text" 
                        inputMode="decimal"
                        value={hFP}
                        onChange={(e) => handleChange(setHFP, e.target.value)}
                        placeholder="FP"
                        className="w-14 h-8 text-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-blue-500 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-[9px] text-gray-400 uppercase tracking-wider mb-0.5">Goals</span>
                    <input 
                        type="text" 
                        inputMode="decimal"
                        value={hScore}
                        onChange={(e) => handleChange(setHScore, e.target.value)}
                        placeholder="-"
                        className={`w-12 h-10 text-center rounded-lg text-lg font-bold border outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                            ${match.isPlayed 
                                ? 'bg-white dark:bg-[#2c2c2e] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400'}`}
                    />
                </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm w-1/3 truncate text-gray-900 dark:text-white" title={match.awayTeam}>{match.awayTeam}</span>
             <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                    <input 
                        type="text" 
                        inputMode="decimal"
                        value={aFP}
                        onChange={(e) => handleChange(setAFP, e.target.value)}
                        placeholder="FP"
                        className="w-14 h-8 text-center rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-blue-500 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="flex flex-col items-center">
                    <input 
                        type="text" 
                        inputMode="decimal"
                        value={aScore}
                        onChange={(e) => handleChange(setAScore, e.target.value)}
                        placeholder="-"
                        className={`w-12 h-10 text-center rounded-lg text-lg font-bold border outline-none focus:ring-2 focus:ring-blue-500 transition-colors
                            ${match.isPlayed 
                                ? 'bg-white dark:bg-[#2c2c2e] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white' 
                                : 'bg-gray-100 dark:bg-gray-800 border-transparent text-gray-400'}`}
                    />
                </div>
            </div>
          </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <button 
          onClick={handleSave}
          disabled={!isDirty}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm ${isDirty ? 'bg-blue-500 hover:bg-blue-600 text-white scale-100' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed scale-95'}`}
        >
          <Save size={14} /> Save
        </button>
      </div>
    </div>
  );
};