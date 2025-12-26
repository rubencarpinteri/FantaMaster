
import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Swords, Settings, CalendarDays, Ticket, Sun, Moon, Home } from 'lucide-react';
import { parseCSV, calculateCampionato, calculateBattleRoyale, calculateSchedineLeaderboard } from './services/leagueService';
import { Match, Competition, SchedinaSubmission, SchedineAdjustment } from './types';
import { 
    supabase, 
    saveData, 
    subscribeToData 
} from './services/supabase';
import { LeagueTable } from './components/LeagueTable';
import { AdminPanel } from './components/AdminPanel';
import { CalendarView } from './components/CalendarView';
import { TeamProfile } from './components/TeamProfile';
import { Schedine } from './components/Schedine';
import { Dashboard } from './components/Dashboard';
import { INITIAL_CSV_DATA, LEGACY_SCHEDINE_DATA } from './data/seedData';

const BACKUP_STORAGE_KEY = 'fantasy_matches_backup_v10';

const SoccerBallIcon = ({ size = 20 }: { size?: number }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m12 12-4 3 1 5" />
    <path d="m12 12 4 3-1 5" />
    <path d="M12 12V7l-5-2" />
    <path d="M12 12V7l5-2" />
    <path d="m7 5-3 5 4 2" />
    <path d="m17 5 3 5-4 2" />
  </svg>
);

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [schedineSubmissions, setSchedineSubmissions] = useState<SchedinaSubmission[]>([]);
  const [schedineAdjustments, setSchedineAdjustments] = useState<SchedineAdjustment>({});
  const [frozenMatchdays, setFrozenMatchdays] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<Competition | 'Admin' | 'Calendar' | 'Schedine' | 'Dashboard'>('Schedine');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const initApp = async () => {
        const localData = localStorage.getItem(BACKUP_STORAGE_KEY);
        if (localData) {
            try {
                const parsed = JSON.parse(localData);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMatches(parsed);
                } else {
                    setMatches(parseCSV(INITIAL_CSV_DATA));
                }
            } catch (e) {
                setMatches(parseCSV(INITIAL_CSV_DATA));
            }
        } else {
            setMatches(parseCSV(INITIAL_CSV_DATA));
        }

        if (supabase) {
            subscribeToData('matches', (data) => data && setMatches(data));
            subscribeToData('schedine', (data) => data && setSchedineSubmissions(data));
            subscribeToData('adjustments', (data) => data && setSchedineAdjustments(data));
            subscribeToData('frozen', (data) => data && setFrozenMatchdays(data));
        }
        setIsInitialized(true);
    };
    initApp();
  }, []);

  useEffect(() => {
      document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const campionatoStats = useMemo(() => calculateCampionato(matches), [matches]);
  const battleRoyaleStats = useMemo(() => calculateBattleRoyale(matches), [matches]);
  const schedineStats = useMemo(() => calculateSchedineLeaderboard(matches, schedineSubmissions, LEGACY_SCHEDINE_DATA, schedineAdjustments), [matches, schedineSubmissions, schedineAdjustments]);

  const handleUpdateMatch = (id: string, hScore: number | null, aScore: number | null, hFP: number | null, aFP: number | null) => {
    const updated = matches.map(m => m.id === id ? { ...m, homeScore: hScore, awayScore: aScore, homeFantasyPoints: hFP, awayFantasyPoints: aFP, isPlayed: hScore !== null } : m);
    setMatches(updated);
    if (supabase) saveData('matches', updated);
  };

  const handleUpdateAdjustment = (team: string, ec: number, ep: number) => {
    const updated = { ...schedineAdjustments, [team]: { extraCorrect: ec, extraPerfect: ep } };
    setSchedineAdjustments(updated);
    if (supabase) saveData('adjustments', updated);
  };

  const handleDeleteSubmission = (teamName: string, matchday: number) => {
    const updated = schedineSubmissions.filter(s => !(s.teamName === teamName && s.matchday === matchday));
    setSchedineSubmissions(updated);
    if (supabase) saveData('schedine', updated);
  };

  const handleToggleFreeze = (md: number) => {
    const updated = frozenMatchdays.includes(md) ? frozenMatchdays.filter(f => f !== md) : [...frozenMatchdays, md];
    setFrozenMatchdays(updated);
    if (supabase) saveData('frozen', updated);
  };

  const handleReset = () => {
    if (confirm("Sei sicuro di voler resettare TUTTI i dati?")) {
        const defaultMatches = parseCSV(INITIAL_CSV_DATA);
        setMatches(defaultMatches);
        setSchedineSubmissions([]);
        setSchedineAdjustments({});
        setFrozenMatchdays([]);
        if (supabase) {
            saveData('matches', defaultMatches);
            saveData('schedine', []);
            saveData('adjustments', {});
            saveData('frozen', []);
        }
    }
  };

  const handleSchedinaSubmit = (submission: SchedinaSubmission) => {
    const updatedSubmissions = schedineSubmissions.filter(s => !(s.teamName === submission.teamName && s.matchday === submission.matchday));
    updatedSubmissions.push(submission);
    setSchedineSubmissions(updatedSubmissions);
    if (supabase) saveData('schedine', updatedSubmissions);
  };

  const navigateToTab = (tab: any) => {
    setSelectedTeam(null);
    setActiveTab(tab);
  };

  const renderContent = () => {
    if (!isInitialized) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-brand-base text-slate-400">
            <div className="w-12 h-12 border-[3px] border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <div className="font-bold uppercase tracking-widest text-xs">Stadium Loading...</div>
        </div>
    );
    
    if (selectedTeam) return <TeamProfile teamName={selectedTeam} matches={matches} onBack={() => setSelectedTeam(null)} />;
    
    switch (activeTab) {
      case 'Dashboard': return <Dashboard campionatoStats={campionatoStats} battleRoyaleStats={battleRoyaleStats} matches={matches} schedineSubmissions={schedineSubmissions} frozenMatchdays={frozenMatchdays} onNavigate={navigateToTab} onTeamClick={setSelectedTeam} />;
      case Competition.CAMPIONATO: return <LeagueTable stats={campionatoStats} title="Campionato" type={Competition.CAMPIONATO} onTeamClick={setSelectedTeam} />;
      case Competition.BATTLE_ROYALE: return <LeagueTable stats={battleRoyaleStats} title="Battle Royale" type={Competition.BATTLE_ROYALE} onTeamClick={setSelectedTeam} />;
      case 'Calendar': return <CalendarView matches={matches} frozenMatchdays={frozenMatchdays} onTeamClick={setSelectedTeam} />;
      case 'Schedine': return <Schedine matches={matches} legacyData={LEGACY_SCHEDINE_DATA} adjustments={schedineAdjustments} submissions={schedineSubmissions} frozenMatchdays={frozenMatchdays} onSubmit={handleSchedinaSubmit} />;
      // Fix: Changed 'submissions' to 'schedineSubmissions'
      case 'Admin': return <AdminPanel matches={matches} schedineStats={schedineStats} adjustments={schedineAdjustments} submissions={schedineSubmissions} frozenMatchdays={frozenMatchdays} onUpdateMatch={handleUpdateMatch} onUpdateSchedineAdjustment={handleUpdateAdjustment} onDeleteSubmission={handleDeleteSubmission} onToggleFreeze={handleToggleFreeze} onReset={handleReset} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-brand-base text-gray-900 dark:text-slate-200 transition-colors duration-300">
        {isInitialized && (
            <>
                {/* iPhone Status Bar Gradient Blur */}
                <div 
                    className="fixed top-0 left-0 right-0 h-28 pointer-events-none z-[55] backdrop-blur-xl bg-white/20 dark:bg-brand-base/40"
                    style={{
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
                    }}
                />

                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 w-full max-w-fit pointer-events-none">
                    <header className="pointer-events-auto bg-white/70 dark:bg-brand-card/70 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-3xl shadow-soft py-1.5 px-2 md:px-3 flex items-center gap-2 md:gap-4 grain transition-all duration-300">
                        <div className="flex items-center gap-1 bg-gray-100/50 dark:bg-brand-base/50 p-1.5 rounded-2xl border border-gray-200 dark:border-white/5 mr-1 hidden lg:flex">
                            <div className="bg-brand-accent text-white p-1.5 rounded-xl shadow-glow-blue grain">
                                <SoccerBallIcon size={18} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-tighter px-2 text-slate-900 dark:text-white">Wizz</span>
                        </div>

                        <nav className="flex items-center gap-1 md:gap-2">
                            <NavButton active={activeTab === 'Schedine' && !selectedTeam} onClick={() => navigateToTab('Schedine')} icon={<Ticket size={18} />} label="Gioca" />
                            <NavButton active={activeTab === 'Dashboard' && !selectedTeam} onClick={() => navigateToTab('Dashboard')} icon={<Home size={18} />} label="Home" />
                            <NavButton active={activeTab === Competition.CAMPIONATO && !selectedTeam} onClick={() => navigateToTab(Competition.CAMPIONATO)} icon={<Trophy size={18} />} label="Classifica" />
                            <NavButton active={activeTab === Competition.BATTLE_ROYALE && !selectedTeam} onClick={() => navigateToTab(Competition.BATTLE_ROYALE)} icon={<Swords size={18} />} label="Royale" />
                            <NavButton active={activeTab === 'Calendar' && !selectedTeam} onClick={() => navigateToTab('Calendar')} icon={<CalendarDays size={18} />} label="Giornate" />
                        </nav>
                        
                        <div className="w-px h-8 bg-gray-200 dark:bg-white/10 mx-1 md:mx-2"></div>
                        
                        <div className="flex items-center gap-1 md:gap-2">
                             <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 md:p-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-brand-accent transition-all hover:bg-brand-accent/10 dark:hover:bg-white/5">
                                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                             </button>
                             <button onClick={() => navigateToTab('Admin')} className={`p-2.5 md:p-3 rounded-2xl transition-all ${activeTab === 'Admin' && !selectedTeam ? 'bg-brand-accent text-white shadow-glow-blue grain' : 'text-slate-500 dark:text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 dark:hover:bg-white/5'}`}>
                                <Settings size={20} />
                             </button>
                        </div>
                    </header>
                </div>
            </>
        )}

        <div className="container mx-auto px-4 pt-24 pb-12 max-w-[1400px]">
            <main>{renderContent()}</main>
        </div>
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-3 md:px-5 py-2.5 md:py-3 rounded-2xl text-[10px] md:text-sm font-black uppercase tracking-tighter transition-all duration-300 ${active ? 'active-nav-pill text-white shadow-glow-blue grain' : 'text-slate-500 dark:text-slate-400 hover:text-brand-accent hover:bg-brand-accent/10 dark:hover:text-white dark:hover:bg-white/5'}`}>
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

export default App;
