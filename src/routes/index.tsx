import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, X, Plus, Minus, Star } from "lucide-react";
import { GrowthMeter } from "@/components/growframe/GrowthMeter";
import { CountUp } from "@/components/growframe/CountUp";
import { Spotlight } from "@/components/growframe/Spotlight";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/")({
  component: GrowFramePage,
});

// ─── Shared animation variants ───────────────────────────────────────────────

const EASE_OUT_EXPO = "easeOut" as const;

const fadeUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE_OUT_EXPO },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

const slideInRight = {
  hidden: { opacity: 0, x: 80, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE_OUT_EXPO },
  },
};

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-40 border-b border-border/50 transition-all duration-500 ${scrolled ? "bg-background/80 backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.6)]" : "bg-background/20 backdrop-blur-xl"}`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
        <a href="#top" className="font-display text-lg tracking-tight">
          Grow<span className="text-accent">Frame</span>
        </a>
        <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
          {["Work", "Services", "Process", "About", "Contact"].map((l, i) => (
            <motion.a
              key={l}
              href={`#${l.toLowerCase()}`}
              className="transition hover:text-foreground"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.5 }}
              whileHover={{ y: -2 }}
            >
              {l}
            </motion.a>
          ))}
        </nav>
        <motion.a
          href="#contact"
          className="btn-primary !py-2.5 !px-5 !text-sm"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(163,255,63,0.5)" }}
          whileTap={{ scale: 0.97 }}
        >
          Start a Project
        </motion.a>
      </div>
    </motion.header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLHeadingElement | null>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const scaleRaw = useTransform(scrollYProgress, [0, 1], [1, 0.55]);
  const scale = useSpring(scaleRaw, { stiffness: 80, damping: 20 });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    if (!taglineRef.current) return;
    const blocks = taglineRef.current.querySelectorAll(".animate-line");
    gsap.set(blocks, { opacity: 0, y: 60, filter: "blur(8px)" });
    gsap.to(blocks, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 1.3,
      stagger: 0.2,
      ease: "expo.out",
      delay: 0.4,
    });
  }, []);

  return (
    <section
      id="top"
      ref={heroRef}
      className="relative min-h-screen overflow-hidden pt-32 md:pt-40"
    >
      <div className="absolute inset-0 grid-bg opacity-60" />
      <motion.div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-accent/10 blur-[140px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-[120px]"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <div className="grain-overlay" />

      <motion.div
        className="relative z-10 mx-auto max-w-[1440px] px-6 md:px-10"
        style={{ y, opacity }}
      >
        <motion.div
          className="mb-10 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-muted-foreground"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
          Available for select projects — Q3 2026
        </motion.div>

        <motion.div
          className="origin-top-left will-change-transform"
          style={{ scale }}
        >
          <h1 ref={taglineRef} className="text-hero">
            <span className="block animate-line">Your competitors</span>
            <span className="block text-muted-foreground/40 animate-line">already have</span>
            <span className="block animate-line">a website.</span>
            <span className="block animate-line">
              <span className="italic text-accent">Do you?</span>
            </span>
          </h1>
        </motion.div>

        <div className="mt-16 grid gap-10 md:mt-24 md:grid-cols-[1.5fr_1fr] md:items-end">
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.a
              href="#contact"
              className="btn-primary"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(163,255,63,0.45)" }}
              whileTap={{ scale: 0.97 }}
            >
              Start a Project <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="#work"
              className="btn-ghost"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              View Our Work
            </motion.a>
          </motion.div>
          <motion.p
            className="max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            GrowFrame designs digital experiences that transform ambitious businesses into
            unforgettable brands.
          </motion.p>
        </div>

        <motion.div
          className="mt-24 flex items-center justify-between border-t border-border/50 pt-6 text-xs uppercase tracking-widest text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>Est. 2019 — Remote-first studio</span>
          <span className="hidden md:inline">Scroll to explore ↓</span>
          <span>© GrowFrame 2026</span>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── StoryStatement ───────────────────────────────────────────────────────────

function StoryStatement() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const spans = ref.current.querySelectorAll(".story-line");
    gsap.fromTo(
      spans,
      { opacity: 0, y: 80, skewY: 4 },
      {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "expo.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, []);

  return (
    <section className="relative border-t border-border/50 py-32 md:py-48">
      <div ref={ref} className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-16 md:grid-cols-[2fr_1fr] md:gap-24">
          <div>
            <h2 className="text-display overflow-hidden">
              <span className="block story-line">Every business has</span>
              <span className="block text-muted-foreground/40 story-line">a story.</span>
              <span className="block story-line">Most websites</span>
              <span className="block italic text-accent story-line">fail to tell it.</span>
            </h2>
          </div>
          <motion.div
            className="flex flex-col justify-end gap-6 text-muted-foreground"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 001 / Manifesto
            </span>
            <p className="text-base leading-relaxed md:text-lg">
              We treat every project as a growth engine. Not a portfolio piece. Not a template
              refresh. A living system that compounds attention, trust, and revenue for the teams
              brave enough to build something worth remembering.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Work ─────────────────────────────────────────────────────────────────────

type Project = {
  n: string;
  name: string;
  tags: string[];
  gradient: string;
  year: string;
  url?: string;
  previewImage?: string;
};

const projects: Project[] = [
  {
    n: "01",
    name: "Mainframe Computers",
    tags: ["Website", "Brand Identity", "Booking Platform"],
    gradient: "from-[#1a1a1a] via-[#0f2415] to-[#050505]",
    year: "2026",
    url: "https://mainframecomputers.netlify.app/",
    previewImage: "/mainframe_computers_mockup.jpg",
  },
  {
    n: "02",
    name: "Ignite",
    tags: ["Instant Deployment", "Real-time Collaboration", "Enterprise Security"],
    gradient: "from-[#0d0d1a] via-[#1a1032] to-[#050505]",
    year: "2026",
    url: "https://igniteind.netlify.app/",
  },
  {
    n: "03",
    name: "Aura Dental Clinic",
    tags: ["Healthcare UI", "Appointment Engine", "Brand Strategy"],
    gradient: "from-[#151a10] via-[#2d3a10] to-[#050505]",
    year: "2025",
    url: "https://auradentalclinicindia.netlify.app/",
  },
  {
    n: "04",
    name: "Anjana Dry Fruits",
    tags: ["E-commerce", "Admin Dashboard", "Inventory System"],
    gradient: "from-[#1c1208] via-[#3a1e0a] to-[#050505]",
    year: "2025",
    url: "https://anjanadryfruitsdashboard.netlify.app/",
  },
];

function Work() {
  return (
    <section id="work" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16 flex items-end justify-between"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 002 / Selected work
            </span>
            <h3 className="text-display mt-4">Selected Work</h3>
          </div>
          <a
            href="#"
            className="hidden text-sm text-muted-foreground hover:text-foreground md:inline-flex items-center gap-2"
          >
            View archive <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>

        <div className="flex flex-col">
          {projects.map((p, i) => (
            <ProjectRow key={p.n} p={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectRow({ p, index }: { p: Project; index: number }) {
  return (
    <motion.div
      className="project-row-item group relative border-t border-border overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <a
        href={p.url ?? "#"}
        target={p.url ? "_blank" : undefined}
        rel={p.url ? "noopener noreferrer" : undefined}
        className="relative flex flex-col gap-6 py-8 transition-all md:flex-row md:items-center md:gap-12 md:py-12 w-full max-w-full"
      >
        <span className="font-mono text-xs text-muted-foreground md:w-16">{p.n}</span>

        <div className="relative flex-1">
          <motion.h4
            className="text-3xl font-display leading-tight tracking-tight md:text-6xl lg:text-7xl"
            whileHover={{ x: 10, color: "var(--accent)" }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {p.name}
          </motion.h4>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            {p.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        {/* MOBILE PREVIEW CARD */}
        {p.url && (
          <motion.div
            className="mt-2 block md:hidden w-full h-[220px] rounded-xl border border-border/60 relative shadow-lg"
            style={{ overflow: 'hidden' }}
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`}
              style={{ overflow: 'hidden' }}
            >
              <iframe
                src={p.url}
                scrolling="no"
                title={`${p.name} mobile preview`}
                loading="lazy"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '390px',
                  height: '275px',
                  border: 'none',
                  opacity: 0.92,
                  pointerEvents: 'none',
                  transformOrigin: 'top left',
                  transform: 'scale(calc(100vw / 390px))',
                }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-[10px] text-white/90 z-10 pointer-events-none">
              <span className="font-mono bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">{p.year}</span>
              <span className="font-display text-xs tracking-tight bg-black/40 px-2.5 py-0.5 rounded-full backdrop-blur-sm">{p.name.split(" ")[0]}</span>
            </div>
          </motion.div>
        )}

        {/* Desktop hover preview card */}
        <div className="pointer-events-none absolute right-0 top-1/2 hidden h-[220px] w-[340px] -translate-y-1/2 translate-x-4 scale-95 overflow-hidden rounded-2xl opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:scale-100 group-hover:opacity-100 md:block border border-border/60 shadow-2xl">
          <div className={`h-full w-full bg-gradient-to-br ${p.gradient} relative overflow-hidden`}>
            {p.url ? (
              <iframe
                src={p.url}
                className="absolute inset-0 w-[1280px] h-[830px] border-none origin-top-left scale-[0.265625] opacity-80"
                title={`${p.name} preview`}
                loading="lazy"
              />
            ) : (
              <div className="grid-bg absolute inset-0 opacity-40" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-xs text-white/90 z-10">
              <span className="font-mono bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">{p.year}</span>
              <span className="font-display text-lg tracking-tight bg-black/40 px-3 py-0.5 rounded-full backdrop-blur-sm">{p.name.split(" ")[0]}</span>
            </div>
          </div>
        </div>

        <motion.span
          className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground"
          whileHover={{ color: "var(--accent)", x: -4 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          View Project <ArrowUpRight className="h-4 w-4" />
        </motion.span>
      </a>
    </motion.div>
  );
}



function Numbers() {
  const stats = [
    { n: 4, s: "+", label: "Projects" },
    { n: 98, s: "%", label: "Client Satisfaction" },
    { n: 4, s: "x", label: "Average Growth" },
    { n: 100, s: "%", label: "Custom Design" },
  ];

  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="grid gap-12 md:grid-cols-4 md:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {stats.map((s) => (
            <motion.div key={s.label} className="border-t border-border pt-6" variants={fadeUp}>
              <div className="text-6xl font-display tracking-tighter md:text-8xl">
                <CountUp end={s.n} suffix={s.s} />
              </div>
              <div className="mt-4 text-sm uppercase tracking-widest text-muted-foreground">
                {s.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────

const services = [
  "Website Design",
  "WhatsApp Automation Setup",
  "Full Stack Website",
  "More Coming Soon...",
];

function Services() {
  return (
    <section id="services" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16 flex items-end justify-between"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 003 / Services
            </span>
            <h3 className="text-display mt-4">What we do</h3>
          </div>
        </motion.div>

        <div className="flex flex-col">
          {services.map((s, i) => (
            <ServiceRow key={s} label={s} n={i + 1} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceRow({ label, n, index }: { label: string; n: number; index: number }) {
  return (
    <motion.div
      className="group relative flex items-center border-t border-border py-6 md:py-8 last:border-b overflow-hidden"
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">
        {String(n).padStart(2, "0")}
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex items-center gap-8 transition-transform duration-500 group-hover:-translate-x-2">
          <motion.h4
            className="text-4xl font-display leading-none tracking-tight md:text-6xl lg:text-7xl"
            whileHover={{ color: "var(--accent)" }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.h4>
          <ArrowUpRight className="h-8 w-8 shrink-0 -translate-x-4 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-accent" />
        </div>
      </div>
      <div className="ml-6 hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block">
        <div className="grid-bg h-full w-full bg-gradient-to-br from-accent/30 to-transparent" />
      </div>
    </motion.div>
  );
}

// ─── Comparison ───────────────────────────────────────────────────────────────

const compare = [
  ["Templates", "Custom Strategy"],
  ["Slow Support", "Fast Response"],
  ["Generic Design", "Conversion Focused"],
  ["Fixed Roadmap", "Adaptive Sprints"],
  ["Handoff & Vanish", "Long-term Partnership"],
];

function Comparison() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 004 / Why it matters
          </span>
          <h3 className="text-display mt-4">The difference is the details.</h3>
        </motion.div>
        <div className="grid grid-cols-2 rounded-3xl border border-border overflow-hidden bg-surface/40">
          <motion.div
            className="comparison-column p-6 md:p-10 border-r border-border"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={slideInLeft}
          >
            <div className="mb-8 text-sm uppercase tracking-widest text-muted-foreground">
              Typical Agency
            </div>
            {compare.map(([bad], i) => (
              <motion.div
                key={bad}
                className="flex items-center gap-3 py-4 border-t border-border first:border-t-0 text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <X className="h-5 w-5 shrink-0" />
                <span className="text-lg md:text-2xl">{bad}</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="comparison-column p-6 md:p-10 bg-gradient-to-br from-accent/[0.03] to-transparent"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            variants={slideInRight}
          >
            <div className="mb-8 flex items-center gap-2 text-sm uppercase tracking-widest text-accent">
              GrowFrame <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            </div>
            {compare.map(([, good], i) => (
              <motion.div
                key={good}
                className="flex items-center gap-3 py-4 border-t border-border first:border-t-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                <Check className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-lg md:text-2xl">{good}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Process ──────────────────────────────────────────────────────────────────

const steps = [
  { n: "01", t: "Discover", d: "Deep-dive workshops to map goals, audience & opportunity." },
  { n: "02", t: "Research", d: "Competitive teardown, brand audit, user interviews." },
  { n: "03", t: "Design", d: "System-first UI, prototypes, motion & interaction design." },
  { n: "04", t: "Develop", d: "Custom, performance-obsessed builds. No page builders." },
  { n: "05", t: "Launch", d: "QA, SEO, analytics wiring, migration and monitoring." },
  { n: "06", t: "Grow", d: "Ongoing experimentation to compound your growth." },
];

function Process() {
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!lineRef.current) return;
    gsap.fromTo(
      lineRef.current,
      { scaleY: 0, transformOrigin: "top center" },
      {
        scaleY: 1,
        ease: "none",
        scrollTrigger: {
          trigger: lineRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      }
    );
  }, []);

  return (
    <section id="process" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 005 / Process
          </span>
          <h3 className="text-display mt-4">Six stages. One outcome.</h3>
        </motion.div>
        <div className="relative">
          <div ref={lineRef} className="absolute left-8 top-0 bottom-0 w-px bg-border md:left-1/2" />
          {steps.map((s, i) => (
            <ProcessStep key={s.n} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ s, i }: { s: (typeof steps)[number]; i: number }) {
  return (
    <motion.div
      className={`process-step-item relative flex flex-col gap-4 py-8 md:grid md:grid-cols-2 md:gap-16 md:py-12 ${i % 2 === 1 ? "md:[&>*:first-child]:col-start-2" : ""}`}
      initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="process-content pl-16 md:pl-0 md:pr-16 md:text-right">
        <div className="font-mono text-sm text-accent">{s.n}</div>
        <div className="mt-2 text-3xl font-display md:text-5xl">{s.t}</div>
        <p className="mt-3 text-muted-foreground max-w-sm md:ml-auto">{s.d}</p>
      </div>
      <motion.div
        className="process-dot absolute left-8 top-10 h-3 w-3 -translate-x-1/2 rounded-full bg-accent ring-4 ring-background md:left-1/2"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.3 }}
      />
    </motion.div>
  );
}

// ─── PixelPurpose ─────────────────────────────────────────────────────────────

function PixelPurpose() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  return (
    <section ref={ref} className="relative border-t border-border/50 py-32 md:py-48 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5" />
        <div className="grid-bg absolute inset-0 opacity-30" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h3
            className="text-hero !text-[clamp(3rem,9vw,9rem)]"
            style={{ x }}
          >
            Every pixel
            <br />
            has a <span className="italic text-accent">purpose.</span>
          </motion.h3>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    q: "Working with GrowFrame completely transformed our online presence. We doubled inbound within a quarter.",
    a: "Ganesh Rathod",
    r: "CEO, Mainframe Computers",
  },
  {
    q: "The most operationally sharp studio we've worked with. Design, engineering and strategy in one voice.",
    a: "Kabir Joshi",
    r: "Founder, Ignite",
  },
  {
    q: "They obsess over the details clients never see — that's exactly why the ones we do see feel effortless.",
    a: "Dr. Ananya Iyer",
    r: "Director, Aura Dental Clinic",
  },
];

function Testimonials() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 006 / Words
          </span>
        </motion.div>
        <motion.div
          className="grid gap-12 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.a}
              className="rounded-3xl border border-border bg-surface/40 p-8"
              variants={fadeUp}
              whileHover={{
                y: -8,
                borderColor: "rgba(163,255,63,0.4)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="mb-6 flex gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.08, type: "spring", stiffness: 400 }}
                  >
                    <Star className="h-4 w-4 fill-current" />
                  </motion.div>
                ))}
              </div>
              <blockquote className="text-xl font-display leading-snug tracking-tight md:text-2xl">
                "{t.q}"
              </blockquote>
              <figcaption className="mt-8 border-t border-border pt-4 text-sm">
                <div className="font-medium">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── WhyUs ────────────────────────────────────────────────────────────────────

const whyus = [
  { t: "Fast", d: "Milliseconds matter. Every build ships lean." },
  { t: "Premium", d: "Feel is not decoration. It's the product." },
  { t: "SEO Ready", d: "Structured, semantic, indexable by default." },
  { t: "AI Powered", d: "Automations that work while you sleep." },
  { t: "Responsive", d: "Perfect from watch to widescreen." },
  { t: "Future Proof", d: "Modular systems that grow with you." },
];

function WhyUs() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 007 / Why choose us
          </span>
          <h3 className="text-display mt-4">Built for outcomes.</h3>
        </motion.div>
        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          variants={staggerContainer}
        >
          {whyus.map((w, i) => (
            <WhyCard key={w.t} w={w} i={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function WhyCard({ w, i }: { w: (typeof whyus)[number]; i: number }) {
  return (
    <motion.div
      className="why-card-item group relative rounded-2xl border border-border bg-surface/40 p-8"
      variants={fadeUp}
      whileHover={{
        y: -8,
        borderColor: "rgba(163,255,63,0.4)",
        backgroundColor: "rgba(163,255,63,0.03)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(163,255,63,0.15)",
      }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
    >
      <div className="mb-8 font-mono text-xs text-muted-foreground">0{i + 1}</div>
      <div className="text-3xl font-display">{w.t}</div>
      <p className="mt-3 text-sm text-muted-foreground">{w.d}</p>
      <motion.div
        className="absolute right-6 top-6"
        whileHover={{ rotate: 45, color: "var(--accent)" }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition" />
      </motion.div>
    </motion.div>
  );
}

// ─── CaseStudy ────────────────────────────────────────────────────────────────

function CaseStudy() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);
  const borderRadius = useTransform(scrollYProgress, [0, 1], [40, 24]);

  return (
    <section ref={ref} className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="relative overflow-hidden border border-border"
          style={{ scale, borderRadius }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f2415] via-[#050505] to-black" />
          <div className="grid-bg absolute inset-0 opacity-40" />
          <div className="absolute -top-40 -right-20 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[120px]" />
          <div className="relative p-8 md:p-16">
            <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>Case Study — 2026</span>
              <motion.a
                href="https://mainframecomputers.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 transition-colors hover:text-accent"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                Mainframe Computers <ArrowUpRight className="h-3.5 w-3.5" />
              </motion.a>
            </div>
            <motion.h3
              className="mt-10 text-hero !text-[clamp(2.5rem,7vw,7rem)]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              Mainframe
              <br />
              <span className="italic text-accent">Computers.</span>
            </motion.h3>
            <motion.div
              className="mt-16 grid gap-8 border-t border-border pt-10 md:grid-cols-3"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                { n: 42, s: "%", l: "Increase in inquiries" },
                { n: 3.5, s: "x", l: "More bookings" },
                { n: 98, s: "", l: "Performance score" },
              ].map((s) => (
                <motion.div key={s.l} variants={fadeUp}>
                  <div className="text-6xl font-display tracking-tighter md:text-7xl">
                    <CountUp end={s.n} suffix={s.s} />
                  </div>
                  <div className="mt-3 text-sm uppercase tracking-widest text-muted-foreground">
                    {s.l}
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <motion.a
                href="https://mainframecomputers.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-3.5 !px-7"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(163,255,63,0.45)" }}
                whileTap={{ scale: 0.97 }}
              >
                Visit Live Site <ArrowUpRight className="h-4 w-4" />
              </motion.a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "How long does a typical project take?",
    a: "Most engagements land between 6–12 weeks. Complex products stretch to 4 months. We share a detailed timeline before you sign anything.",
  },
  {
    q: "Do you work with startups or only enterprise?",
    a: "Both. Our sweet spot is Series A–C teams and profitable founder-led businesses that treat design as leverage, not decoration.",
  },
  {
    q: "What's the investment range?",
    a: "Websites start at $18k. Product design & web apps typically fall between $40k and $120k. Retainers begin at $6k/month.",
  },
  {
    q: "Do you offer ongoing support?",
    a: "Yes — every build ships with an optional 'Grow' retainer covering performance, experiments, content and iteration.",
  },
  {
    q: "Can you match our internal team?",
    a: "Absolutely. We regularly slot in with in-house design, engineering and marketing teams — as leads or as extra horsepower.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="about" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-16 md:grid-cols-[1fr_2fr]">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 008 / FAQ
            </span>
            <h3 className="text-display mt-4">Answers.</h3>
          </motion.div>
          <div>
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                className="border-t border-border last:border-b"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg md:text-2xl font-display tracking-tight">{f.q}</span>
                  <motion.span
                    className="shrink-0 rounded-full border border-border p-2"
                    animate={{ rotate: open === i ? 180 : 0, borderColor: open === i ? "var(--accent)" : "var(--border)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {open === i ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pr-12 text-muted-foreground">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── FinalCTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-border/50 py-32 md:py-56"
    >
      <div className="absolute inset-0">
        <motion.div
          className="absolute -top-40 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-accent/15 blur-[160px]"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute bottom-0 left-10 h-[400px] w-[400px] rounded-full bg-accent/10 blur-[120px] animate-float-slow [animation-delay:-6s]" />
        <div className="grid-bg absolute inset-0 opacity-40" />
        <div className="grain-overlay" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-6 text-center md:px-10">
        <motion.span
          className="font-mono text-xs uppercase tracking-widest text-accent"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          — 009 / Let's build
        </motion.span>
        <motion.h3
          className="mx-auto mt-8 text-hero"
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          READY TO
          <br />
          <span className="italic text-accent">GROW?</span>
        </motion.h3>
        <motion.p
          className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          Tell us where you're stuck. We'll respond in under 24 hours with a real human, a real
          plan, and next steps.
        </motion.p>
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.9 }}
        >
          <motion.a
            href="mailto:growframe@gmail.com"
            className="btn-primary !py-5 !px-8 !text-base"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(163,255,63,0.5)" }}
            whileTap={{ scale: 0.97 }}
          >
            Let's Build <ArrowRight className="h-4 w-4" />
          </motion.a>
          <motion.a
            href="#work"
            className="btn-ghost !py-5 !px-8 !text-base"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            See recent work
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="relative border-t border-border/50 bg-surface/40 pt-24 pb-10">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[clamp(4rem,15vw,14rem)] font-display leading-none tracking-tighter">
            Grow<span className="text-accent">Frame</span>
          </div>
        </motion.div>
        <div className="grid gap-10 border-t border-border pt-10 md:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Studio</div>
            <div className="mt-3 text-sm">
              Kolhapur, India
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Navigation
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {["Home", "Work", "Services", "About", "Contact"].map((l) => (
                <li key={l}>
                  <a href={`#${l.toLowerCase()}`} className="hover:text-accent transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Socials</div>
            <ul className="mt-3 space-y-2 text-sm">
              {["GitHub", "LinkedIn", "Instagram", "X"].map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-accent inline-flex items-center gap-1 transition-colors">
                    {l} <ArrowUpRight className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
            <a href="mailto:growframe@gmail.com" className="mt-3 block text-sm hover:text-accent transition-colors">
              growframe@gmail.com
            </a>
            <div className="mt-1 text-sm text-muted-foreground">+91 90210 39470</div>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs uppercase tracking-widest text-muted-foreground md:flex-row md:items-center">
          <span>© GrowFrame Studio 2026 — All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            Currently booking Q3 2026
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function GrowFramePage() {
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden">
      <Spotlight />
      <GrowthMeter />
      <Nav />
      <main>
        <Hero />
        <StoryStatement />
        <Work />
        <Numbers />
        <Services />
        <Comparison />
        <Process />
        <PixelPurpose />
        <Testimonials />
        <WhyUs />
        <CaseStudy />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
