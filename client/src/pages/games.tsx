import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { GAMES } from "@/lib/gamesCatalog";

type GameDef = typeof GAMES[number];

export default function GamesPage() {
  const [category, setCategory] = useState<'recycling' | 'climate' | 'habits' | 'wildlife' | 'fun' | 'all'>('all');
  const [summary, setSummary] = useState<{ totalGamePoints: number; badges: string[]; monthCompletedCount: number; totalUniqueGames: number } | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { username } = useAuth();
  const [tapLock, setTapLock] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingSummary(true);
      try {
        const res = await fetch('/api/student/games/summary', { headers: username ? { 'x-username': username } : undefined });
        const json = await res.json();
        if (active) setSummary(json);
      } catch {
        if (active) setSummary({ totalGamePoints: 0, badges: [], monthCompletedCount: 0, totalUniqueGames: 0 });
      } finally {
        if (active) setLoadingSummary(false);
      }
    })();
    return () => { active = false; };
  }, [username]);

  const filtered = useMemo(() => {
    return category === 'all' ? GAMES : GAMES.filter(g => g.category === category);
  }, [category]);

  const openGame = (g: GameDef) => {
    if (tapLock) return;
    setTapLock(true);
    setTimeout(()=>setTapLock(false), 500); // simple debounce
  };
  // Refresh progress when user returns from a game
  useEffect(() => {
    const onFocus = () => {
      fetch('/api/student/games/summary', { headers: username ? { 'x-username': username } : undefined })
        .then(r=>r.json())
        .then(setSummary)
        .catch(()=>{});
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [username]);

  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/beautiful-morning-view-indonesia-panorama-landscape-paddy-fields-with-beauty-color-and-sky-natural-light-photo.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2 text-white/90">Eco-Games <span>🌱🎮</span></h1>
              <p className="mt-1 text-white/70">Play fun interactive games, learn sustainability, and earn Eco-Points & badges.</p>
            </div>
            <div className="rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm p-3 min-w-[240px]">
              <div className="text-sm font-medium text-white/90">Your Game Progress</div>
              {loadingSummary ? (
                <div className="text-xs text-white/70 mt-1">Loading…</div>
              ) : (
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between text-white/80"><span>Game Points</span><span className="font-semibold">{summary?.totalGamePoints ?? 0}</span></div>
                  <div className="flex items-center justify-between text-white/80"><span>Games this month</span><span className="font-semibold">{summary?.monthCompletedCount ?? 0}</span></div>
                  <div className="flex items-center justify-between text-white/80"><span>Unique games</span><span className="font-semibold">{summary?.totalUniqueGames ?? 0}</span></div>
                  <div className="pt-2 border-t border-white/30">
                    <div className="text-xs text-white/70 mb-1">Badges</div>
                    <div className="flex flex-wrap gap-2 text-base">{(summary?.badges ?? []).length ? summary!.badges.map((b,i)=>(<span key={i}>{b}</span>)) : <span className="text-white/60 text-xs">No badges yet</span>}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Categories */}
      <div className="mt-6">
        <Tabs value={category} onValueChange={(v)=>setCategory(v as any)}>
          <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="all" className="data-[state=active]:bg-white/20">All</TabsTrigger>
            <TabsTrigger value="recycling" className="data-[state=active]:bg-white/20">♻️ Recycling</TabsTrigger>
            <TabsTrigger value="climate" className="data-[state=active]:bg-white/20">🌍 Climate</TabsTrigger>
            <TabsTrigger value="habits" className="data-[state=active]:bg-white/20">🏡 Habits</TabsTrigger>
            <TabsTrigger value="wildlife" className="data-[state=active]:bg-white/20">🌱 Plant & Wildlife</TabsTrigger>
            <TabsTrigger value="fun" className="data-[state=active]:bg-white/20">🎲 Fun</TabsTrigger>
          </TabsList>
          <TabsContent value={category}>
            {/* Grid of game cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(g => (
                <div key={g.id} className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm p-4 flex flex-col hover:bg-white/20 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-semibold flex items-center gap-2 text-white/90">{g.icon && <span>{g.icon}</span>}<span>{g.name}</span></div>
                    <span className="text-xs px-2 py-1 rounded-full border border-white/30 bg-white/10">{g.difficulty}</span>
                  </div>
                  <p className="text-sm text-white/80 mt-2">{g.description}</p>
                  <div className="mt-3 text-sm flex items-center justify-between">
                    <div className="text-white/90">Reward: <span className="font-semibold">+{g.points} pts</span></div>
                    <Link href={`/games/play/${g.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={()=>openGame(g)}>Play Now</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      </div>
    </div>
  );
}
