import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';

export default function QuizzesPage() {
  const { username, role } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [active, setActive] = useState<any | null>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [resultDetails, setResultDetails] = useState<Array<{ index:number; correctIndex:number; selected:number; isCorrect:boolean }> | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const list = await fetch('/api/student/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
        if (!mounted) return;
        if (Array.isArray(list) && list.length > 0) {
          setQuizzes(list);
        } else {
          // Dev convenience: attempt to seed demo quizzes then refetch
          try {
            await fetch('/api/dev/seed-quizzes', { method: 'POST' });
            const list2 = await fetch('/api/student/quizzes', { headers: { 'X-Username': username || '' } }).then(r => r.json());
            if (!mounted) return;
            setQuizzes(Array.isArray(list2) ? list2 : []);
          } catch {
            setQuizzes([]);
          }
        }
      } catch {}
    };
    if (role === 'student') load();
    return () => { mounted = false; };
  }, [username, role]);

  const globalQuizzes = useMemo(() => quizzes.filter(q => q.visibility === 'global'), [quizzes]);
  const schoolQuizzes = useMemo(() => quizzes.filter(q => q.visibility !== 'global'), [quizzes]);

  const start = async (q: any) => {
    // Check if already attempted
    const attempt = await fetch(`/api/student/quizzes/${q.id}/attempt`, { headers: { 'X-Username': username || '' } }).then(r=>r.json());
    if (attempt && attempt.scorePercent != null) {
      // open review-only view
      setActive(q);
      const ans: number[] = Array.isArray(attempt.answers) ? attempt.answers : new Array((q.questions?.length||0)).fill(-1);
      setAnswers(ans);
      setScore(attempt.scorePercent);
      setLocked(true);
      try {
        const r = await fetch(`/api/quizzes/${q.id}/score`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ answers: ans }) });
        const data = await r.json();
        if (Array.isArray(data?.details)) setResultDetails(data.details);
      } catch {}
      setReviewOpen(true);
      setIdx(0);
      return;
    }
    setActive(q);
    setIdx(0);
    setAnswers(new Array((q.questions?.length||0)).fill(-1));
    setScore(null);
  setLocked(false);
  setResultDetails(null);
  setReviewOpen(false);
  };
  const select = (choice: number) => {
    if (locked) return;
    setAnswers(a => a.map((v,i)=> i===idx ? choice : v));
  };
  const next = () => setIdx(i => Math.min(i + 1, (active?.questions?.length || 1) - 1));
  const prev = () => setIdx(i => Math.max(0, i - 1));
  const submit = async () => {
    if (!active) return;
    // Ask server to score securely
    let pct = 0;
    try {
      const r = await fetch(`/api/quizzes/${active.id}/score`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ answers }) });
      const data = await r.json();
      pct = Number(data?.percent) || 0;
      setScore(pct);
      if (Array.isArray(data?.details)) setResultDetails(data.details);
      setLocked(true);
  setReviewOpen(false);
    } catch {
      const total = active.questions.length || 0;
      const answered = answers.filter(a => a >= 0).length;
      pct = Math.round((answered / Math.max(1,total)) * 100);
      setScore(pct);
      setLocked(true);
  setReviewOpen(false);
    }
    try {
  await fetch('/api/student/quiz-attempts', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': username || '' }, body: JSON.stringify({ quizId: active.id, scorePercent: pct, answers }) });
    } catch {}
  };

  return (
    <div 
      className="min-h-screen text-white p-6 relative"
      style={{
        backgroundImage: 'url(/api/image/pngtree-abstract-cloudy-background-beautiful-natural-streaks-of-sky-and-clouds-red-image_15684333.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white/90">Quizzes</h1>
              <p className="mt-1 text-white/70">Test your environmental knowledge</p>
            </div>
            {role !== 'student' && <div className="text-sm text-white/70">Sign in as a student to attempt quizzes.</div>}
          </div>
        </div>

      {!active ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Global Quizzes">
            <QuizGrid list={globalQuizzes} onStart={start} />
          </Section>
          <Section title="Your School Quizzes">
            <QuizGrid list={schoolQuizzes} onStart={start} />
          </Section>
        </div>
      ) : (
        <Section title={active.title}>
            <QuizRunner
            quiz={active}
            idx={idx}
            answers={answers}
            onSelect={select}
            onNext={next}
            onPrev={prev}
            onExit={()=> setActive(null)}
            onSubmit={submit}
            score={score}
            locked={locked}
            results={resultDetails}
              reviewOpen={reviewOpen}
              onToggleReview={()=> setReviewOpen(v=>!v)}
          />
        </Section>
      )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-3 text-white/90">{title}</h2>
      <div className="p-4 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">{children}</div>
    </section>
  );
}

function QuizGrid({ list, onStart }: { list: any[]; onStart: (q:any)=>void }) {
  if (!list || list.length === 0) return <p className="text-sm text-white/60">No quizzes yet.</p>;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {list.map((q) => (
        <div key={q.id} className="relative overflow-hidden rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06),transparent_60%)] pointer-events-none" />
          <div className="p-4">
            <div className="text-lg font-semibold text-white/90">{q.title}</div>
            {q.description && <div className="text-sm text-white/70 line-clamp-2">{q.description}</div>}
            <div className="text-xs text-white/60 mt-1">{q.points} pts • {(q.questions?.length||0)} questions</div>
            {q._attempt && <div className="text-xs text-emerald-300 mt-1">Attempted • {q._attempt.scorePercent}%</div>}
            <div className="mt-3">
              {q._attempt ? (
                <Button 
                  variant="secondary" 
                  onClick={()=>onStart(q)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  Review
                </Button>
              ) : (
                <Button 
                  className="bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/50" 
                  onClick={()=>onStart(q)}
                >
                  Start
                </Button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuizRunner({ quiz, idx, answers, onSelect, onNext, onPrev, onExit, onSubmit, score, locked, results, reviewOpen, onToggleReview }: {
  quiz: any; idx: number; answers: number[]; onSelect: (choice:number)=>void; onNext: ()=>void; onPrev: ()=>void; onExit: ()=>void; onSubmit: ()=>void; score: number | null; locked: boolean; results: Array<{ index:number; correctIndex:number; selected:number; isCorrect:boolean }> | null; reviewOpen: boolean; onToggleReview: ()=>void;
}) {
  const total = Array.isArray(quiz?.questions) ? quiz.questions.length : 0;
  const safeIdx = Math.max(0, Math.min(idx, Math.max(0, total - 1)));
  const q = total > 0 ? quiz.questions[safeIdx] : undefined;
  return (
    <div className="relative">
      <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-white/60">Question {safeIdx+1} of {total}</div>
        <button className="text-xs text-white/60 underline hover:text-white/80" onClick={onExit}>Exit</button>
      </div>
      <div className="p-4 rounded-lg border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl transition-transform duration-300">
        {!q ? (
          <div className="text-sm text-red-300">No questions available.</div>
        ) : (
        <>
        <div className="text-lg font-semibold mb-3 animate-fade-in text-white/90">{q.text}</div>
        <div className="grid gap-2">
          {q.options.map((opt: string, i: number) => {
            const selected = answers[safeIdx] === i;
            const rd = results?.find(r => r.index === safeIdx);
            const isAnswer = !!rd && i === rd.correctIndex;
            const isWrongSelected = !!rd && rd.selected === i && !rd.isCorrect;
            const normalSelected = selected && !locked;
            return (
              <button key={i} disabled={locked} onClick={()=>onSelect(i)} className={`text-left rounded-lg px-4 py-3 border transition-all text-white/90 ${normalSelected ? 'bg-emerald-600/40 border-emerald-400' : 'border-white/30 hover:bg-white/10'} ${(locked && reviewOpen && isAnswer) ? 'bg-emerald-600/30 border-emerald-400' : ''} ${(locked && reviewOpen && isWrongSelected) ? 'bg-red-600/20 border-red-400' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-full grid place-items-center text-xs ${normalSelected ? 'bg-emerald-400 text-black' : (locked && reviewOpen && isAnswer) ? 'bg-emerald-400 text-black' : (locked && reviewOpen && isWrongSelected) ? 'bg-red-400 text-black' : 'bg-white/20 text-white'}`}>{i+1}</span>
                  <span>{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-4">
          <Button 
            variant="secondary" 
            onClick={onPrev} 
            disabled={safeIdx===0}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            Prev
          </Button>
          {locked ? (
            <Button 
              className="bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/50" 
              onClick={onNext} 
              disabled={safeIdx >= total - 1}
            >
              Next
            </Button>
          ) : (
            safeIdx < total - 1 ? (
              <Button 
                className="bg-blue-500/80 hover:bg-blue-600/80 text-white border border-blue-400/50" 
                onClick={onNext}
              >
                Next
              </Button>
            ) : (
              <Button 
                className="bg-emerald-500/80 hover:bg-emerald-600/80 text-white border border-emerald-400/50" 
                onClick={onSubmit}
              >
                Submit
              </Button>
            )
          )}
        </div>
        {score != null && (
          <div className="mt-3 flex items-center justify-center gap-4 animate-fade-in">
            <div className="text-center">
              <div className="text-sm text-white/60">Your score</div>
              <div className="text-3xl font-bold text-white/90">{score}%</div>
            </div>
            {locked && results && (
              <Button 
                variant="secondary" 
                onClick={onToggleReview}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {reviewOpen ? 'Hide Review' : 'Review Answers'}
              </Button>
            )}
          </div>
        )}
        {locked && reviewOpen && results && (
          <div className="mt-3 text-center text-sm text-white/70">
            {results.map((r) => {
              const inRange = r.index >= 0 && r.index < total;
              const options = inRange ? quiz.questions[r.index].options : [];
              const answerText = (options && r.correctIndex >= 0 && r.correctIndex < options.length) ? options[r.correctIndex] : 'N/A';
              return (
                <div key={r.index}>
                  Q{r.index + 1}: {r.isCorrect ? 'Correct' : `Wrong (Answer: ${answerText})`}
                </div>
              );
            })}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
