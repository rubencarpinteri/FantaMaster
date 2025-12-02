
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Swords, Settings, CalendarDays, Ticket, Sun, Moon, LayoutGrid } from 'lucide-react';
import { parseCSV, calculateCampionato, calculateBattleRoyale, calculateSchedineLeaderboard } from './services/leagueService';
import { Match, Competition, SchedinaSubmission, SchedineAdjustment } from './types';
import { LeagueTable } from './components/LeagueTable';
import { AdminPanel } from './components/AdminPanel';
import { CalendarView } from './components/CalendarView';
import { TeamProfile } from './components/TeamProfile';
import { Schedine } from './components/Schedine';
import { Dashboard } from './components/Dashboard';
import { INITIAL_CSV_DATA, LEGACY_SCHEDINE_DATA } from './data/seedData';

const STORAGE_KEY = 'fantasy_matches_v8';
const SCHEDINE_KEY = 'fantasy_schedine_v1';
const SCHEDINE_ADJ_KEY = 'fantasy_schedine_adj_v1';

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedineSubmissions, setSchedineSubmissions] = useState<SchedinaSubmission[]>([]);
  const [schedineAdjustments, setSchedineAdjustments] = useState<SchedineAdjustment>({});
  const [activeTab, setActiveTab] = useState<Competition | 'Admin' | 'Calendar' | 'Schedine' | 'Dashboard'>('Dashboard');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Initialize Data
  useEffect(() => {
    const savedMatches = localStorage.getItem(STORAGE_KEY);
    if (savedMatches) {
      try {
        const parsed = JSON.parse(savedMatches);
        setMatches(parsed.length > 0 ? parsed : parseCSV(INITIAL_CSV_DATA));
      } catch { setMatches(parseCSV(INITIAL_CSV_DATA)); }
    } else {
        setMatches(parseCSV(INITIAL_CSV_DATA));
    }

    const savedSchedine = localStorage.getItem(SCHEDINE_KEY);
    if (savedSchedine) {
        try { setSchedineSubmissions(JSON.parse(savedSchedine)); } catch (e) { console.error(e); }
    }

    const savedAdj = localStorage.getItem(SCHEDINE_ADJ_KEY);
    if (savedAdj) {
        try { setSchedineAdjustments(JSON.parse(savedAdj)); } catch (e) { console.error(e); }
    }

    setIsInitialized(true);
  }, []);

  // Theme Handling
  useEffect(() => {
      if (theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [theme]);

  // Persistence
  useEffect(() => { if (matches.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(matches)); }, [matches]);
  useEffect(() => { if (schedineSubmissions.length > 0) localStorage.setItem(SCHEDINE_KEY, JSON.stringify(schedineSubmissions)); }, [schedineSubmissions]);
  useEffect(() => { localStorage.setItem(SCHEDINE_ADJ_KEY, JSON.stringify(schedineAdjustments)); }, [schedineAdjustments]);

  const handleReset = () => {
      if (window.confirm("Delete all data and revert to default?")) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(SCHEDINE_KEY);
          localStorage.removeItem(SCHEDINE_ADJ_KEY);
          setMatches(parseCSV(INITIAL_CSV_DATA));
          setSchedineSubmissions([]);
          setSchedineAdjustments({});
          setActiveTab('Dashboard');
      }
  }

  const updateMatchResult = (id: string, homeScore: number | null, awayScore: number | null, hFP: number | null, aFP: number | null) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, homeScore, awayScore, homeFantasyPoints: hFP, awayFantasyPoints: aFP, isPlayed: homeScore !== null && awayScore !== null } : m));
  };

  const handleSchedinaSubmit = (submission: SchedinaSubmission) => {
      setSchedineSubmissions(prev => {
          const filtered = prev.filter(s => !(s.teamName === submission.teamName && s.matchday === submission.matchday));
          return [...filtered, submission];
      });
  };

  const updateSchedineAdjustment = (team: string, extraCorrect: number, extraPerfect: number) => {
      setSchedineAdjustments(prev => ({
          ...prev,
          [team]: { extraCorrect, extraPerfect }
      }));
  };

  const campionatoStats = useMemo(() => calculateCampionato(matches), [matches]);
  const battleRoyaleStats = useMemo(() => calculateBattleRoyale(matches), [matches]);

  const schedineStats = useMemo(() => 
    calculateSchedineLeaderboard(matches, schedineSubmissions, LEGACY_SCHEDINE_DATA, schedineAdjustments), 
    [matches, schedineSubmissions, schedineAdjustments]
  );

  const renderContent = () => {
    if (!isInitialized) return null;
    if (selectedTeam) return <TeamProfile teamName={selectedTeam} matches={matches} onBack={() => setSelectedTeam(null)} />;

    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard campionatoStats={campionatoStats} battleRoyaleStats={battleRoyaleStats} matches={matches} schedineSubmissions={schedineSubmissions} onNavigate={setActiveTab} onTeamClick={setSelectedTeam} />;
      case Competition.CAMPIONATO:
        return <LeagueTable stats={campionatoStats} title="Campionato" type={Competition.CAMPIONATO} onTeamClick={setSelectedTeam} />;
      case Competition.BATTLE_ROYALE:
        return <LeagueTable stats={battleRoyaleStats} title="Battle Royale" type={Competition.BATTLE_ROYALE} onTeamClick={setSelectedTeam} />;
      case Competition.SUPER_LEGA:
        return (
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-[#1c1c1e] rounded-2xl border border-gray-100 dark:border-gray-800 border-dashed text-center p-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
                <Trophy className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-400 dark:text-gray-500">Super Lega</h3>
            <p className="text-gray-400">Competition rules coming soon...</p>
          </div>
        );
      case 'Calendar':
        return <CalendarView matches={matches} onTeamClick={setSelectedTeam} />;
      case 'Schedine':
        return <Schedine matches={matches} legacyData={LEGACY_SCHEDINE_DATA} adjustments={schedineAdjustments} submissions={schedineSubmissions} onSubmit={handleSchedinaSubmit} />;
      case 'Admin':
        return <AdminPanel matches={matches} schedineStats={schedineStats} adjustments={schedineAdjustments} onUpdateMatch={updateMatchResult} onUpdateSchedineAdjustment={updateSchedineAdjustment} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-[#000000] text-gray-900 dark:text-gray-100 transition-colors duration-300">
        {/* Increased max-w to 1920px (basically full width on most screens) to allow 5 calendar items in a row */}
        <div className="container mx-auto px-4 py-8 max-w-[1920px]">
            {isInitialized && !selectedTeam && (
                <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                            FantaWizz CTA
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-medium mt-1 uppercase tracking-wide">
                            Manager Dashboard 25/26
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto">
                        <div className="bg-white dark:bg-[#1c1c1e] p-1 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-wrap justify-center gap-1">
                            <NavButton active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} icon={<LayoutGrid size={16} />} label="Home" />
                            <NavButton active={activeTab === Competition.CAMPIONATO} onClick={() => setActiveTab(Competition.CAMPIONATO)} icon={<Trophy size={16} />} label="Campionato" />
                            <NavButton active={activeTab === Competition.BATTLE_ROYALE} onClick={() => setActiveTab(Competition.BATTLE_ROYALE)} icon={<Swords size={16} />} label="Royale" />
                            <NavButton active={activeTab === 'Calendar'} onClick={() => setActiveTab('Calendar')} icon={<CalendarDays size={16} />} label="Calendar" />
                            <NavButton active={activeTab === 'Schedine'} onClick={() => setActiveTab('Schedine')} icon={<Ticket size={16} />} label="Schedine" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                             <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-xl bg-white dark:bg-[#1c1c1e] border border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 shadow-sm transition-all"
                             >
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                             </button>
                             <button 
                                onClick={() => setActiveTab('Admin')}
                                className={`p-2 rounded-xl border transition-all shadow-sm ${activeTab === 'Admin' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white dark:bg-[#1c1c1e] border-gray-200 dark:border-gray-800 text-gray-500 hover:text-blue-500'}`}
                             >
                                <Settings size={18} />
                             </button>
                        </div>
                    </div>
                </header>
            )}

            <main className="transition-all duration-300 ease-in-out">
                {renderContent()}
            </main>
        </div>
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; special?: boolean }> = ({ active, onClick, icon, label, special }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
      active 
        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-inner' 
        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
    } ${special && !active ? 'text-purple-400 hover:text-purple-500' : ''}`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
