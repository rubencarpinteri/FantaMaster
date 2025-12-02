import React, { useMemo } from 'react';
import { Match, FormResult } from '../types';
import { ArrowLeft, TrendingUp, Target, Activity, Trophy, Hash, History, Skull, Zap, Scale, Shield } from 'lucide-react';

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

    const resultsFrequency: Record<string, number> = {};
    const form: FormResult[] = [];
    const opponentStats: Record<string, { w: number, d: number, l: number, total: number }> = {};

    teamMatches.forEach(m => {
      const isHome = m.homeTeam === teamName;
      const opponent = isHome ? m.awayTeam : m.homeTeam;
      const gf = isHome ? (m.homeScore || 0) : (m.awayScore || 0);
      const ga = isHome ? (m.awayScore || 0) : (m.homeScore || 0);
      const fp = isHome ? m.homeFantasyPoints : m.awayFantasyPoints;
      
      const scoreStr = isHome ? `${gf}-${ga}` : `${gf}-${ga}`;

      totalGoalsFor += gf;
      totalGoalsAgainst += ga;
      
      if (fp !== null) {
        totalFantasyPoints += fp;
        fpCount++;
      }

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

      const resultKey = `${gf}-${ga}`;
      resultsFrequency[resultKey] = (resultsFrequency[resultKey] || 0) + 1;
    });

    const topResults = Object.entries(resultsFrequency).sort((a, b) => b[1] - a[1]).slice(0, 3);
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
      winRate: ((wins / played) * 100).toFixed(0),
      totalGoalsFor, totalGoalsAgainst,
      matches: teamMatches.reverse(),
      nemesis: nemesisEntry ? { name: nemesisEntry[0], stats: nemesisEntry[1] } : null,
      ezWin: ezWinEntry ? { name: ezWinEntry[0], stats: ezWinEntry[1] } : null,
      fierceRival: fierceRivalEntry ? { name: fierceRivalEntry[0], stats: fierceRivalEntry[1] } : null
    };
  }, [teamName, matches]);

  if (!stats) return <div className="p-10 text-center text-gray-500"><button onClick={onBack}>Go Back</button></div>;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-3 bg-white dark:bg-[#1c1c1e] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all shadow-sm border border-gray-100 dark:border-gray-800"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{teamName}</h2>
          <p className="text-gray-500 text-sm font-medium">Performance Analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={<Target className="text-blue-500" />} label="Avg Scored" value={stats.avgGoalsFor} subLabel={`Total: ${stats.totalGoalsFor}`} />
        <StatCard icon={<Shield className="text-red-500" />} label="Avg Conceded" value={stats.avgGoalsAgainst} subLabel={`Total: ${stats.totalGoalsAgainst}`} />
        <StatCard icon={<Activity className="text-purple-500" />} label="Avg Fantasy Pts" value={stats.avgFantasyPoints} subLabel="Per Match" />
        <StatCard icon={<TrendingUp className="text-green-500" />} label="Win Rate" value={`${stats.winRate}%`} subLabel={`${stats.wins}W - ${stats.draws}D - ${stats.losses}L`} />
        <StatCard icon={<Hash className="text-orange-500" />} label="Most Frequent" value={stats.topResults[0] ? stats.topResults[0][0] : '-'} subLabel={stats.topResults[0] ? `${stats.topResults[0][1]} times` : ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
            icon={<Skull className="text-gray-800 dark:text-white" />} label="Nemesis" value={stats.nemesis?.name || "None"}
            subLabel={stats.nemesis ? `Played ${stats.nemesis.stats.total} (${stats.nemesis.stats.w}W-${stats.nemesis.stats.d}D-${stats.nemesis.stats.l}L)` : "Undefeated"}
        />
        <StatCard 
            icon={<Zap className="text-yellow-500" />} label="EZ Win" value={stats.ezWin?.name || "None"}
            subLabel={stats.ezWin ? `Played ${stats.ezWin.stats.total} (${stats.ezWin.stats.w}W-${stats.ezWin.stats.d}D-${stats.ezWin.stats.l}L)` : "No easy matches"}
        />
        <StatCard 
            icon={<Scale className="text-blue-400" />} label="Stalemate" value={stats.fierceRival?.name || "None"}
            subLabel={stats.fierceRival ? `Played ${stats.fierceRival.stats.total} (${stats.fierceRival.stats.w}W-${stats.fierceRival.stats.d}D-${stats.fierceRival.stats.l}L)` : "No draw streaks"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <History size={18} className="text-blue-500" /> Recent Form
            </h3>
            <div className="flex flex-wrap gap-3">
              {stats.form.map((r, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl font-bold text-lg border shadow-sm ${r.result === 'W' ? 'bg-green-500 text-white border-green-600' : r.result === 'D' ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600' : 'bg-red-500 text-white border-red-600'}`}>
                    {r.result}
                  </div>
                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tight text-center leading-none">
                    {r.opponent.substring(0,3)}
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 dark:text-gray-400">
                    {r.score}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
              <Trophy size={18} className="text-yellow-500" /> Common Scores
            </h3>
            <div className="space-y-3">
              {stats.topResults.map(([score, count], idx) => (
                <div key={score} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <span className="font-mono text-xl font-bold text-gray-900 dark:text-white">{score}</span>
                  <span className="text-sm text-gray-500">{count} times</span>
                  {idx === 0 && <span className="text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full">MOST COMMON</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1c1c1e] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden h-full">
             <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Match History</h3>
             </div>
             <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 uppercase font-bold sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4">MD</th>
                      <th className="px-6 py-4">Opponent</th>
                      <th className="px-6 py-4 text-center">Result</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">FP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {stats.matches.map((m) => {
                      const isHome = m.homeTeam === teamName;
                      const gf = isHome ? m.homeScore : m.awayScore;
                      const ga = isHome ? m.awayScore : m.homeScore;
                      const fp = isHome ? m.homeFantasyPoints : m.awayFantasyPoints;
                      const opponent = isHome ? m.awayTeam : m.homeTeam;
                      let resultLabel = 'D'; let resultClass = 'text-gray-400';
                      if ((gf || 0) > (ga || 0)) { resultLabel = 'W'; resultClass = 'text-green-500'; }
                      else if ((gf || 0) < (ga || 0)) { resultLabel = 'L'; resultClass = 'text-red-500'; }

                      return (
                        <tr key={m.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                          <td className="px-6 py-4 text-gray-500">{m.matchday}</td>
                          <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{opponent}</td>
                          <td className={`px-6 py-4 text-center font-black ${resultClass}`}>{resultLabel}</td>
                          <td className="px-6 py-4 text-center font-mono text-gray-900 dark:text-white font-medium">{gf}-{ga}</td>
                          <td className="px-6 py-4 text-center text-blue-500 font-medium">{fp ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subLabel }: { icon: React.ReactNode, label: string, value: string | number, subLabel: string }) => (
  <div className="bg-white dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300">
    <div className="p-3.5 bg-gray-50 dark:bg-gray-800 rounded-2xl">
      {icon}
    </div>
    <div>
      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">{label}</p>
      <div className="text-xl font-bold text-gray-900 dark:text-white truncate max-w-[120px]" title={String(value)}>{value}</div>
      <p className="text-xs text-gray-500 mt-0.5">{subLabel}</p>
    </div>
  </div>
);