import { useEffect, useState } from "react";

const stages = ["Design", "Development", "Launch"];

export function GrowthMeter() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(100, Math.max(0, (window.scrollY / h) * 100)) : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const activeStage = Math.min(2, Math.floor((progress / 100) * 3));

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden w-[240px] rounded-2xl border border-border bg-surface/80 p-4 backdrop-blur-xl md:block">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="font-display text-foreground">GrowFrame</span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          Live
        </span>
      </div>
      <div className="mt-3 text-[11px] uppercase tracking-widest text-muted-foreground">
        Growth Progress
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div className="flex gap-[3px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-[10px] rounded-[2px] transition-colors duration-300 ${
                i < Math.round(progress / 10) ? "bg-accent" : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <div className="font-mono-num text-sm text-foreground">{Math.round(progress)}%</div>
      </div>
      <div className="mt-3 flex justify-between text-[10px] uppercase tracking-wider">
        {stages.map((s, i) => (
          <span key={s} className={i === activeStage ? "text-accent" : "text-muted-foreground/60"}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
