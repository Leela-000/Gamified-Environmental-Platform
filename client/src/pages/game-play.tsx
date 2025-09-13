import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import WasteSegregation from "@/components/games/WasteSegregation";
import EcoHome from "@/components/games/EcoHome";
import Quiz from "@/components/games/primitives/Quiz";
import Reorder from "@/components/games/primitives/Reorder";
import ClickCollect from "@/components/games/primitives/ClickCollect";
import GridPicker from "@/components/games/primitives/GridPicker";
import Stepper from "@/components/games/primitives/Stepper";
import { useAuth } from "@/lib/auth";
import { getGameById } from "@/lib/gamesCatalog";

function Particles() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    const dots = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.8 + 0.6,
    }));
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      // background subtle radial
      const grad = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)/1.2);
      grad.addColorStop(0, 'rgba(42, 84, 164, 0.15)');
      grad.addColorStop(1, 'rgba(7, 14, 28, 0.15)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      // particles
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 -z-10" />;
}

function ParallaxBlobs() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current!;
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = (e.clientX / w - 0.5) * 20;
      const y = (e.clientY / h - 0.5) * 20;
      el.style.setProperty('--rx', `${-y}deg`);
      el.style.setProperty('--ry', `${x}deg`);
      el.style.setProperty('--tx', `${x * 0.5}px`);
      el.style.setProperty('--ty', `${y * 0.5}px`);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-24 -left-24 w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(56,189,248,0.35),transparent_60%)]"
           style={{ transform: 'translate(var(--tx), var(--ty)) rotateX(var(--rx)) rotateY(var(--ry))', filter: 'blur(20px)' }} />
      <div className="absolute -bottom-32 -right-24 w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle_at_60%_60%,rgba(16,185,129,0.35),transparent_60%)]"
           style={{ transform: 'translate(calc(var(--tx)*-0.6), calc(var(--ty)*-0.6)) rotateX(calc(var(--rx)*-1)) rotateY(calc(var(--ry)*-1))', filter: 'blur(20px)' }} />
    </div>
  );
}

export default function GamePlayPage() {
  const [, params] = useRoute("/games/play/:id");
  const gameId = params?.id || "";
  const game = getGameById(gameId);
  const { username } = useAuth();
  const [, navigate] = useLocation();
  const [completed, setCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!game) {
      // unknown id -> back to catalog
      navigate('/games');
    }
  }, [game, navigate]);

  const onCompleted = async () => {
    if (!game || completed || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`/api/student/games/${encodeURIComponent(game.id)}/play`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(username ? { 'x-username': username } : {}),
        },
        body: JSON.stringify({ points: game.points }),
      });
      setCompleted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const body = useMemo(() => {
    switch (game?.id) {
      case 'waste-segregation':
        return <WasteSegregation onComplete={onCompleted} />;
      case 'eco-home':
        return <EcoHome onComplete={onCompleted} />;
      case 'recycling-factory':
        return (
          <Reorder
            items={["Collect", "Sort", "Clean", "Shred", "Remold"]}
            targetOrder={["Collect", "Sort", "Clean", "Shred", "Remold"]}
            onComplete={onCompleted}
          />
        );
      case 'ocean-cleanup':
        return <ClickCollect count={12} durationMs={20000} onComplete={onCompleted} />;
      case 'air-catcher':
        return <ClickCollect count={10} durationMs={15000} onComplete={onCompleted} />;
      case 'carbon-choices':
        return (
          <GridPicker
            tiles={[
              { label: 'Cycle to school', correct: true },
              { label: 'Drive alone', correct: false },
              { label: 'Use LED bulbs', correct: true },
              { label: 'Leave AC on', correct: false },
              { label: 'Plant a tree', correct: true },
              { label: 'Single-use plastics', correct: false },
            ]}
            targetCount={3}
            onComplete={onCompleted}
          />
        );
      case 'eco-shopping':
        return (
          <GridPicker
            tiles={[
              { label: 'Reusable bottle', correct: true },
              { label: 'Plastic straw pack', correct: false },
              { label: 'Cloth bag', correct: true },
              { label: 'Over-packaged snack', correct: false },
              { label: 'Local veggies', correct: true },
              { label: 'Fast fashion tee', correct: false },
            ]}
            targetCount={3}
            onComplete={onCompleted}
          />
        );
      case 'energy-quiz':
        return (
          <Quiz
            questions={[
              { id: 'q1', text: 'Best time to do laundry to save energy?', options: ['Peak afternoon', 'Off-peak evening', 'All day same'], answerIndex: 1 },
              { id: 'q2', text: 'Which bulb uses less energy?', options: ['Incandescent', 'CFL/LED'], answerIndex: 1 },
              { id: 'q3', text: 'Ideal AC temp for efficiency?', options: ['18°C', '24–26°C'], answerIndex: 1 },
            ]}
            onComplete={() => onCompleted()}
          />
        );
      case 'tree-planting':
        return (
          <Stepper
            steps={[
              'Dig a small pit',
              'Place the sapling upright',
              'Cover roots with soil',
              'Water gently and add mulch',
            ]}
            onComplete={onCompleted}
          />
        );
      case 'wildlife-rescue':
        return (
          <Stepper
            steps={[
              'Clear path from litter',
              'Guide the animal towards the safe zone',
              'Close the gate behind safely',
            ]}
            onComplete={onCompleted}
          />
        );
      case 'pollinator-garden':
        return (
          <GridPicker
            tiles={[
              { label: 'Lavender', correct: true },
              { label: 'Concrete statue', correct: false },
              { label: 'Sunflower', correct: true },
              { label: 'Neonic pesticide', correct: false },
              { label: 'Basil', correct: true },
              { label: 'Plastic turf', correct: false },
            ]}
            targetCount={3}
            onComplete={onCompleted}
          />
        );
      case 'eco-crossword':
        return (
          <GridPicker
            tiles={[
              { label: 'Reduce', correct: true },
              { label: 'Waste', correct: false },
              { label: 'Reuse', correct: true },
              { label: 'Random', correct: false },
              { label: 'Recycle', correct: true },
              { label: 'Wrong', correct: false },
            ]}
            targetCount={3}
            onComplete={onCompleted}
          />
        );
      case 'trivia-wheel':
        return (
          <Quiz
            questions={[
              { id: 't1', text: 'Main greenhouse gas from cars?', options: ['CO₂', 'Helium'], answerIndex: 0 },
              { id: 't2', text: 'Renewable energy source?', options: ['Coal', 'Wind'], answerIndex: 1 },
            ]}
            onComplete={() => onCompleted()}
          />
        );
      case 'flood-defender':
        return <ClickCollect count={18} durationMs={25000} onComplete={onCompleted} />;
      case 'eco-runner':
        return <ClickCollect count={14} durationMs={20000} onComplete={onCompleted} />;
      default:
        return <div className="text-sm text-earth-muted">This game is coming soon.</div>;
    }
  }, [game?.id]);

  return (
    <div 
      className="relative min-h-screen text-white"
      style={{
        backgroundImage: 'url(/api/image/background-pictures-nature-hd-images-1920x1200-wallpaper-preview.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better visibility */}
      <div className="absolute inset-0 bg-black/40"></div>
      <Particles />
      <ParallaxBlobs />
      
      {/* Exit button */}
      <div className="fixed top-4 right-4 z-50">
        <Button 
          variant="secondary" 
          onClick={() => navigate('/games')}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
        >
          Exit
        </Button>
      </div>
      
      {/* Title */}
      <div className="relative z-10 pt-16 pb-6 text-center">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 max-w-2xl mx-auto">
          <div className="text-sm text-white/70">Eco-Game</div>
          <h1 className="text-3xl font-semibold mt-1 text-white/90">{game?.icon || '🎮'} {game?.name || 'Play'}</h1>
          <div className="text-xs text-white/60 mt-1">Reward: +{game?.points ?? 0} pts · Difficulty: {game?.difficulty}</div>
        </div>
      </div>

      {/* Play surface */}
      <div className="relative z-10 mx-auto max-w-4xl w-full">
        <div className="m-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-6 shadow-xl">
          {body}
        </div>
      </div>

      {/* Completion ribbon */}
      {completed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className="px-6 py-3 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white shadow-xl border border-emerald-400/50">
            Completed! +{game?.points ?? 0} pts awarded.
          </div>
        </div>
      )}
    </div>
  );
}
