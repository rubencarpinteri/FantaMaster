import React, { useMemo } from 'react';
import { Match, FormResult } from '../types';
import { ArrowLeft, TrendingUp, Target, Activity, Trophy, Hash, History, Skull, Zap, Scale, Shield, BarChart2 } from 'lucide-react';

interface TeamProfileProps {
  teamName: string;
  matches: Match[];
  onBack: () => void;
}

export const TeamProfile: React.FC<TeamProfileProps> = ({ teamName, matches, onBack }) => {
  const stats = useMemo(() => {
    const teamMatches = matches
      .filter(m => (m.homeTeam === teamName || m.awayTeam === teamName) && m.isPlayed)
      .sort((a, b) => a.matchday - b.matchday);

    const played = teamMatches.length;
    if (played === 0) return null;

    let totalGoalsFor = 0;
    let totalGoalsAgainst = 0;
    let totalFantasyPoints = 0;
    let fpCount = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;

    const goalBuckets = { g0: 0, g1: 0, g2: 0, g3: 0, g4plus: 0 };
    const scoreFrequency: Record<string, { count: number; gf: number; ga: number }> = {};
    const form: FormResult[] = [];
    const opponentStats: Record<string, { w: number, d: number, l: number, total: number }> = {};

    teamMatches.forEach(m => {
      const isHome = m.homeTeam === teamName;
      const opponent = isHome ? m.awayTeam : m.homeTeam;
      const gf = isHome ? (m.homeScore || 0) : (m.awayScore || 0);
      const ga = isHome ? (m.awayScore || 0) : (m.homeScore || 0);
      const fp = isHome ? m.homeFantasyPoints : m.awayFantasyPoints;
      
      const scoreStr = `${gf}-${ga}`;

      totalGoalsFor += gf;
      totalGoalsAgainst += ga;
      
      if (fp !== null) {
        totalFantasyPoints += fp;
        fpCount++;
      }

      // Goal Distribution logic
      if (gf === 0) goalBuckets.g0++;
      else if (gf === 1) goalBuckets.g1++;
      else if (gf === 2) goalBuckets.g2++;
      else if (gf === 3) goalBuckets.g3++;
      else goalBuckets.g4plus++;

      if (!opponentStats[opponent]) opponentStats[opponent] = { w: 0, d: 0, l: 0, total: 0 };
      opponentStats[opponent].total++;

      if (gf > ga) { 
        wins++; 
        form.push({ result: 'W', opponent, score: scoreStr }); 
        opponentStats[opponent].w++; 
      } else if (gf < ga) { 
        losses++; 
        form.push({ result: 'L', opponent, score: scoreStr }); 
        opponentStats[opponent].l++; 
      } else { 
        draws++; 
        form.push({ result: 'D', opponent, score: scoreStr }); 
        opponentStats[opponent].d++; 
      }

      // Result-aware score tracking
      scoreFrequency[scoreStr] = {
        count: (scoreFrequency[scoreStr]?.count || 0) + 1,
        gf,
        ga
      };
    });

    const topResults = Object.entries(scoreFrequency)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([score, data]) => ({
          score,
          count: data.count,
          type: data.gf > data.ga ? 'W' : data.gf < data.ga ? 'L' : 'D'
      }));

    const nemesisEntry = Object.entries(opponentStats).filter(([, s]) => s.w === 0).sort((a, b) => b[1].l - a[1].l || b[1].total - a[1].total)[0];
    const ezWinEntry = Object.entries(opponentStats).filter(([, s]) => s.w === s.total).sort((a, b) => b[1].total - a[1].total)[0];
    const fierceRivalEntry = Object.entries(opponentStats).filter(([, s]) => s.d === s.total).sort((a, b) => b[1].total - a[1].total)[0];

    return {
      played, wins, draws, losses,
      avgGoalsFor: (totalGoalsFor / played).toFixed(2),
      avgGoalsAgainst: (totalGoalsAgainst / played).toFixed(2),
      avgFantasyPoints: fpCount > 0 ? (totalFantasyPoints / fpCount).toFixed(2) : 'N/A',
      form: form.slice(-10).reverse(),
      topResults,
      goalBuckets,
      winRate: ((wins / played) * 100).toFixed(0),
      totalGoalsFor, totalGoalsAgainst,
      matches: teamMatches.reverse(),
      nemesis: nemesisEntry ? { name: nemesisEntry[0], stats: nemesisEntry[1] } : null,
      ezWin: ezWinEntry ? { name: ezWinEntry[0], stats: ezWinEntry[1] } : null,
      fierceRival: fierceRivalEntry ? { name: fierceRivalEntry[0], stats: fierceRivalEntry[1] } : null
    };
  }, [teamName, matches]);

  if (!stats) return <div className="p-10 text-center text-gray-500"><button onClick={onBack} className="text-brand-accent font-bold">Torna Indietro</button></div>;

  return (
    <div className="space-y-6 pb-20 animate-fadeIn px-1 md:px-0 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-4 mb-4 md:mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-brand-card hover:bg-slate-50 dark:hover:bg-brand-base rounded-2xl text-slate-400 hover:text-brand-accent transition-all shadow-soft border border-slate-100 dark:border-white/5"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{teamName}</h2>
          <p className="text-slate-500 text-[10px] md:text-sm font-black uppercase tracking-[0.2em]">Performance Analytics</p>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard icon={<Target className="text-brand-accent" />} label="Avg Segnati" value={stats.avgGoalsFor} subLabel={`Totale: ${stats.totalGoalsFor}`} />
        <StatCard icon={<Shield className="text-brand-danger" />} label="Avg Subiti" value={stats.avgGoalsAgainst} subLabel={`Totale: ${stats.totalGoalsAgainst}`} />
        <StatCard icon={<Activity className="text-brand-secondary" />} label="Avg Punti" value={stats.avgFantasyPoints} subLabel="FantaMedia" />
        <StatCard icon={<TrendingUp className="text-brand-success" />} label="Win Rate" value={`${stats.winRate}%`} subLabel={`${stats.wins}V - ${stats.draws}N - ${stats.losses}P`} />
        <div className="col-span-1">
             <StatCard icon={<Hash className="text-amber-500" />} label="Risultato Top" value={stats.topResults[0]?.score || '-'} subLabel={`${stats.topResults[0]?.count || 0} volte`} />
        </div>
      </div>

      {/* Goal Distribution Grid */}
      <div className="bg-white dark:bg-brand-card rounded-[2rem] p-5 md:p-8 shadow-soft border border-gray-100 dark:border-white/5">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <BarChart2 size={16} className="text-brand-accent" /> Distribuzione Goal
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
            <GoalBucketCard label="0 Goal" value={stats.goalBuckets.g0} color="text-slate-400" />
            <GoalBucketCard label="1 Goal" value={stats.goalBuckets.g1} color="text-brand-accent" />
            <GoalBucketCard label="2 Goal" value={stats.goalBuckets.g2} color="text-brand-secondary" />
            <GoalBucketCard label="3 Goal" value={stats.goalBuckets.g3} color="text-amber-500" />
            <GoalBucketCard label="4+ Goal" value={stats.goalBuckets.g4plus} color="text-brand-success" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <StatCard 
            icon={<Skull className="text-slate-900 dark:text-white" />} label="Nemesi" value={stats.nemesis?.name || "Nessuna"}
            subLabel={stats.nemesis ? `${stats.nemesis.stats.total} partite (${stats.nemesis.stats.w}V-${stats.nemesis.stats.d}N-${stats.nemesis.stats.l}P)` : "Imbattuto"}
        />
        <StatCard 
            icon={<Zap className="text-amber-500" />} label="Vittoria Facile" value={stats.ezWin?.name || "Nessuna"}
            subLabel={stats.ezWin ? `${stats.ezWin.stats.total} partite (${stats.ezWin.stats.w}V-${stats.ezWin.stats.d}N-${stats.ezWin.stats.l}P)` : "Nessuna preda"}
        />
        <StatCard 
            icon={<Scale className="text-slate-400" />} label="X-Rival" value={stats.fierceRival?.name || "Nessuna"}
            subLabel={stats.fierceRival ? `${stats.fierceRival.stats.total} pareggi su ${stats.fierceRival.stats.total}` : "Nessun pareggio seriale"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-brand-card rounded-[2rem] p-6 shadow-soft border border-slate-100 dark:border-white/5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <History size={16} className="text-brand-accent" /> Ultime 10 Partite
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {stats.form.map((r, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-sm border-2 shadow-sm grain ${r.result === 'W' ? 'bg-brand-success text-white border-brand-success' : r.result === 'D' ? 'bg-slate-100 dark:bg-brand-base text-slate-500 border-slate-200 dark:border-white/10' : 'bg-brand-danger text-white border-brand-danger'}`}>
                    {r.result}
                  </div>
                  <div className="text-[8px] font-black text-slate-400 uppercase tracking-tighter text-center leading-none max-w-[40px] truncate">
                    {r.opponent}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-brand-card rounded-[2rem] p-6 shadow-soft border border-slate-100 dark:border-white/5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Trophy size={16} className="text-amber-500" /> Risultati Ricorrenti
            </h3>
            <div className="space-y-3">
              {stats.topResults.map((res, idx) => (
                <div key={res.score} className="flex justify-between items-center p-3.5 bg-slate-50 dark:bg-brand-base/50 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black ${res.type === 'W' ? 'bg-brand-success/10 text-brand-success' : res.type === 'L' ? 'bg-brand-danger/10 text-brand-danger' : 'bg-slate-400/10 text-slate-400'}`}>
                        {res.type}
                    </span>
                    <span className={`font-mono text-lg font-black tracking-widest ${res.type === 'W' ? 'text-brand-success' : res.type === 'L' ? 'text-brand-danger' : 'text-slate-500'}`}>
                        {res.score}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">{res.count} volte</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-brand-card rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-soft overflow-hidden h-full flex flex-col">
             <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-brand-base/30">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Storico Partite</h3>
             </div>
             
             {/* Desktop View */}
             <div className="hidden md:block overflow-y-auto max-h-[700px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 dark:bg-brand-base/50 text-slate-400 uppercase text-[10px] font-black tracking-widest sticky top-0 backdrop-blur-md z-10">
                    <tr>
                      <th className="px-6 py-4 w-16">MD</th>
                      <th className="px-6 py-4">Avversario</th>
                      <th className="px-6 py-4 text-center">Esito</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">FP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {stats.matches.map((m) => {
                      const isHome = m.homeTeam === teamName;
                      const gf = isHome ? m.homeScore : m.awayScore;
                      const ga = isHome ? m.awayScore : m.homeScore;
                      const fp = isHome ? m.homeFantasyPoints : m.awayFantasyPoints;
                      const opponent = isHome ? m.awayTeam : m.homeTeam;
                      let resultLabel = 'N'; let resultClass = 'text-slate-400';
                      if ((gf || 0) > (ga || 0)) { resultLabel = 'V'; resultClass = 'text-brand-success'; }
                      else if ((gf || 0) < (ga || 0)) { resultLabel = 'P'; resultClass = 'text-brand-danger'; }

                      return (
                        <tr key={m.id} className="hover:bg-brand-accent/[0.02] transition-colors group">
                          <td className="px-6 py-5 text-[11px] font-bold text-slate-400">G{m.matchday}</td>
                          <td className="px-6 py-5 font-black text-sm uppercase text-slate-900 dark:text-white group-hover:text-brand-accent transition-colors">{opponent}</td>
                          <td className={`px-6 py-5 text-center font-black ${resultClass}`}>{resultLabel}</td>
                          <td className="px-6 py-5 text-center font-mono text-base font-black text-slate-900 dark:text-white">{gf}-{ga}</td>
                          <td className="px-6 py-5 text-center text-brand-accent font-black text-sm">{fp ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>

             {/* Mobile View - Zero Horizontal Scroll */}
             <div className="md:hidden divide-y divide-slate-100 dark:divide-white/5 overflow-y-auto max-h-[800px]">
                {stats.matches.map((m) => {
                    const isHome = m.homeTeam === teamName;
                    const gf = isHome ? m.homeScore : m.awayScore;
                    const ga = isHome ? m.awayScore : m.homeScore;
                    const fp = isHome ? m.homeFantasyPoints : m.awayFantasyPoints;
                    const opponent = isHome ? m.awayTeam : m.homeTeam;
                    const isWin = (gf || 0) > (ga || 0);
                    const isLoss = (gf || 0) < (ga || 0);

                    return (
                        <div key={m.id} className="p-4 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="text-[10px] font-black text-slate-400 w-6 flex-shrink-0">G{m.matchday}</span>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border flex-shrink-0 ${isWin ? 'bg-brand-success/10 text-brand-success border-brand-success/20' : isLoss ? 'bg-brand-danger/10 text-brand-danger border-brand-danger/20' : 'bg-slate-100 dark:bg-brand-base text-slate-400 border-slate-200 dark:border-white/5'}`}>
                                    {isWin ? 'V' : isLoss ? 'P' : 'N'}
                                </div>
                                <div className="truncate font-black uppercase text-xs text-slate-900 dark:text-white leading-tight pr-2">{opponent}</div>
                            </div>
                            
                            <div className="flex items-center gap-3 flex-shrink-0">
                                <div className="font-mono font-black text-sm text-slate-900 dark:text-white w-10 text-right">{gf}-{ga}</div>
                                <div className="w-10 text-right">
                                    <div className="text-[10px] font-black text-brand-accent leading-none">{fp ?? '-'}</div>
                                    <div className="text-[7px] font-bold text-slate-400 uppercase mt-0.5">FP</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalBucketCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="bg-slate-50 dark:bg-brand-base/50 p-3 rounded-2xl border border-slate-100 dark:border-white/5 text-center">
        <div className={`text-lg md:text-2xl font-black ${color} tabular-nums mb-1`}>{value}</div>
        <div className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-tighter">{label}</div>
    </div>
);

const StatCard = ({ icon, label, value, subLabel }: { icon: React.ReactNode, label: string, value: string | number, subLabel: string }) => (
  <div className="bg-white dark:bg-brand-card p-4 md:p-6 rounded-[1.8rem] border border-slate-100 dark:border-white/5 shadow-soft flex items-center gap-4 transition-all hover:scale-[1.02] duration-300">
    <div className="p-2.5 md:p-3.5 bg-slate-50 dark:bg-brand-base rounded-2xl flex-shrink-0 border border-slate-100 dark:border-white/5">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest font-black mb-1">{label}</p>
      <div className="text-sm md:text-xl font-black text-slate-900 dark:text-white truncate leading-tight" title={String(value)}>{value}</div>
      <p className="text-[8px] md:text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{subLabel}</p>
    </div>
  </div>
);