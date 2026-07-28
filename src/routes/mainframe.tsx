import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  X,
  Plus,
  Minus,
  Star,
  Phone,
  MapPin,
  Clock,
  Wrench,
  Monitor,
  Cpu,
  Camera,
  Wifi,
  Printer,
  HardDrive,
  Battery,
  Shield,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { CountUp } from "@/components/growframe/CountUp";
import { Spotlight } from "@/components/growframe/Spotlight";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export const Route = createFileRoute("/mainframe")({
  component: MainframePage,
  head: () => ({
    meta: [
      {
        title: "Mainframe Computers — Revive Your Tech, Restore Your Life",
      },
      {
        name: "description",
        content:
          "Mainframe Computers is Kolhapur's trusted computer sales & service center. Laptop repair, custom PC building, CCTV installation, network setup & IT solutions.",
      },
    ],
  }),
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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = ["Services", "About", "Process", "Reviews", "Why Us", "FAQ", "Contact"];

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-40 border-b border-border/50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.6)]"
            : "bg-background/20 backdrop-blur-xl"
        }`}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 md:px-10">
          <a href="#top" className="font-display text-lg tracking-tight">
            Mainframe<span className="text-accent"> Computers</span>
          </a>

          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            {links.map((l, i) => (
              <motion.a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
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

          <div className="flex items-center gap-3">
            <motion.a
              href="tel:+91982306470"
              className="btn-primary !py-2.5 !px-5 !text-sm hidden md:inline-flex"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(163,255,63,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              <Phone className="h-3.5 w-3.5" /> Call Now
            </motion.a>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 md:hidden p-2"
              aria-label="Toggle menu"
            >
              <motion.span
                className="block h-0.5 w-6 bg-foreground origin-center"
                animate={mobileOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-foreground origin-center"
                animate={mobileOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-background/95 backdrop-blur-3xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {links.map((l, i) => (
              <motion.a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-3xl font-display tracking-tight py-3 hover:text-accent transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setMobileOpen(false)}
              >
                {l}
              </motion.a>
            ))}
            <motion.a
              href="tel:+91982306470"
              className="btn-primary mt-8 !py-4 !px-8 !text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Phone className="h-4 w-4" /> +91 98230 6470
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
          Mainframe Computers — Sales & Services | Kolhapur
        </motion.div>

        <motion.div className="origin-top-left will-change-transform" style={{ scale }}>
          <h1 ref={taglineRef} className="text-hero">
            <span className="block animate-line">Revive your tech.</span>
            <span className="block text-muted-foreground/40 animate-line">Restore your</span>
            <span className="block animate-line">
              <span className="italic text-accent">life.</span>
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
              href="https://wa.me/919021039470"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(163,255,63,0.45)" }}
              whileTap={{ scale: 0.97 }}
            >
              Book Service Now <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="#services"
              className="btn-ghost"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Explore Services
            </motion.a>
          </motion.div>
          <motion.p
            className="max-w-md text-lg leading-relaxed text-muted-foreground md:text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            Trusted computer sales and service center in Kolhapur providing reliable, affordable,
            and professional IT solutions.
          </motion.p>
        </div>

        <motion.div
          className="mt-24 flex items-center justify-between border-t border-border/50 pt-6 text-xs uppercase tracking-widest text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>📍 Kolhapur, Maharashtra</span>
          <span className="hidden md:inline">Fast Turnaround · Genuine Parts</span>
          <span>© Mainframe 2026</span>
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
    <section id="about" className="relative border-t border-border/50 py-32 md:py-48">
      <div ref={ref} className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-16 md:grid-cols-[2fr_1fr] md:gap-24">
          <div>
            <h2 className="text-display overflow-hidden">
              <span className="block story-line">Your tech should</span>
              <span className="block text-muted-foreground/40 story-line">work seamlessly.</span>
              <span className="block story-line">We make sure</span>
              <span className="block italic text-accent story-line">it does.</span>
            </h2>
          </div>
          <motion.div
            className="flex flex-col justify-end gap-6 text-muted-foreground"
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-100px" }}
            variants={fadeUp}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 001 / About Us
            </span>
            <p className="text-base leading-relaxed md:text-lg">
              Mainframe Computers is a trusted computer sales and service center dedicated to providing
              reliable, affordable, and professional technology solutions. Whether you need a quick laptop repair,
              a custom PC build, or CCTV setup — customer satisfaction is our top priority.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

function Numbers() {
  const stats = [
    { n: 1000, s: "+", label: "Devices Repaired" },
    { n: 250, s: "+", label: "Custom Builds" },
    { n: 99, s: "%", label: "Satisfaction Rate" },
    { n: 100, s: "%", label: "Genuine Parts" },
  ];

  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="grid gap-12 md:grid-cols-4 md:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={staggerContainer}
        >
          {stats.map((s) => (
            <motion.div key={s.label} className="border-t border-border pt-6" variants={fadeUp}>
              <div className="text-6xl font-display tracking-tighter md:text-8xl text-foreground">
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

const servicesList = [
  {
    title: "Laptop & Desktop Repair",
    desc: "Chip-level motherboard repair, screen replacement, liquid damage recovery, and speed optimization.",
    image: "/mainframe-hero.jpg",
    tag: "Hardware & Software",
  },
  {
    title: "Custom PC Building & Upgrades",
    desc: "Tailored gaming PCs, workstation setups, and high-performance component upgrades.",
    image: "/mainframe-pc.jpg",
    tag: "Performance",
  },
  {
    title: "CCTV Camera Installation & Maintenance",
    desc: "HD security surveillance systems for homes, offices, schools, and commercial spaces.",
    image: "/mainframe-cctv.jpg",
    tag: "Security",
  },
  {
    title: "Network Setup & Configuration",
    desc: "High-speed wired/wireless router setup, LAN wiring, firewall configuration, and IT cabling.",
    image: "/mainframe-network.jpg",
    tag: "Infrastructure",
  },
  {
    title: "Hardware Diagnostics & Troubleshooting",
    desc: "Comprehensive diagnostic testing for boot errors, blue screens, and failing components.",
    image: "/mainframe-diagnostics.jpg",
    tag: "Diagnostics",
  },
  {
    title: "Printer Repair & Cartridge Refilling",
    desc: "Laser & inkjet printer maintenance, paper-jam fixes, and genuine toner cartridge refilling.",
    image: "/mainframe-printer.jpg",
    tag: "Peripherals",
  },
  {
    title: "Data Recovery & Backup Solutions",
    desc: "Recover crashed hard drives, corrupted SSDs, format recovery, and cloud backup systems.",
    image: "/mainframe-data.jpg",
    tag: "Data Safety",
  },
  {
    title: "Windows Installation & Formatting",
    desc: "Clean OS installation, driver updates, antivirus setup, and malware removal.",
    image: "/mainframe-software.jpg",
    tag: "Software",
  },
  {
    title: "Battery & Component Replacement",
    desc: "Original laptop batteries, power adapters, keyboard replacement, and thermal repasting.",
    image: "/mainframe-components.jpg",
    tag: "Components",
  },
  {
    title: "Refurbished Laptops & Computers",
    desc: "Pre-tested, certified refurbished laptops and desktops with warranty support.",
    image: "/mainframe-refurbished.jpg",
    tag: "Sales",
  },
  {
    title: "Computer Accessories & Peripherals",
    desc: "Keyboards, mice, monitors, SSDs, RAM modules, cables, and gaming gear.",
    image: "/mainframe-accessories.jpg",
    tag: "Accessories",
  },
];

function Services() {
  return (
    <section id="services" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16 flex items-end justify-between"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={fadeUp}
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 002 / What We Do
            </span>
            <h3 className="text-display mt-4">Our Services</h3>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {servicesList.map((s, i) => (
            <ServiceCard key={s.title} s={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ s, index }: { s: (typeof servicesList)[number]; index: number }) {
  return (
    <motion.div
      className="group relative rounded-2xl border border-border bg-surface/40 p-8 flex flex-col justify-between overflow-hidden"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-40px" }}
      transition={{ duration: 0.7, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        y: -8,
        borderColor: "rgba(163,255,63,0.4)",
        backgroundColor: "rgba(163,255,63,0.03)",
        boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px rgba(163,255,63,0.15)",
      }}
    >
      {s.image && (
        <div className="mb-6 h-48 w-full overflow-hidden rounded-xl border border-border relative">
          <img
            src={s.image}
            alt={s.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
        </div>
      )}

      <div>
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs text-accent uppercase tracking-widest">{s.tag}</span>
          <span className="font-mono text-xs text-muted-foreground">0{index + 1}</span>
        </div>
        <h4 className="text-2xl font-display leading-snug tracking-tight text-foreground group-hover:text-accent transition-colors">
          {s.title}
        </h4>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
      </div>

      <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>Available in Kolhapur</span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </motion.div>
  );
}

// ─── Comparison ───────────────────────────────────────────────────────────────

const compare = [
  ["Overpriced Repairs", "Transparent & Honest Pricing"],
  ["Weeks of Delay", "Fast Turnaround Times"],
  ["Cheap Knockoff Parts", "High-Quality Genuine Replacement Parts"],
  ["Generic Support", "Personalized Customer Attention"],
  ["Hidden Charges", "Free Initial Diagnostics"],
];

function Comparison() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 003 / Why Choose Mainframe
          </span>
          <h3 className="text-display mt-4">The difference is total trust.</h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl border border-border overflow-hidden bg-surface/40">
          <motion.div
            className="comparison-column p-6 md:p-10 border-b md:border-b-0 md:border-r border-border"
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-60px" }}
            variants={slideInLeft}
          >
            <div className="mb-6 md:mb-8 text-xs md:text-sm uppercase tracking-widest text-muted-foreground">
              Ordinary Repair Shop
            </div>
            {compare.map(([bad], i) => (
              <motion.div
                key={bad}
                className="flex items-center gap-3 py-3.5 md:py-4 border-t border-border first:border-t-0 text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <X className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-red-500/80" />
                <span className="text-base md:text-2xl">{bad}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="comparison-column p-6 md:p-10 bg-gradient-to-br from-accent/[0.03] to-transparent"
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: "-60px" }}
            variants={slideInRight}
          >
            <div className="mb-6 md:mb-8 flex items-center gap-2 text-xs md:text-sm uppercase tracking-widest text-accent">
              Mainframe Computers{" "}
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            </div>
            {compare.map(([, good], i) => (
              <motion.div
                key={good}
                className="flex items-center gap-3 py-3.5 md:py-4 border-t border-border first:border-t-0"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              >
                <Check className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-accent" />
                <span className="text-base md:text-2xl text-foreground font-medium">{good}</span>
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
  { n: "01", t: "Bring or Call", d: "Visit our center in Kolhapur or request a home/office visit." },
  { n: "02", t: "Free Diagnosis", d: "We inspect your device and pinpoint exact hardware/software issues." },
  { n: "03", t: "Honest Quote", d: "You get a clear cost breakdown before any work begins. No surprises." },
  { n: "04", t: "Expert Repair", d: "Certified technicians repair your tech using genuine replacement parts." },
  { n: "05", t: "Quality QA", d: "Thorough testing to make sure everything works perfectly." },
  { n: "06", t: "Handover & Support", d: "Fast pickup with post-service warranty and ongoing technical support." },
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
          viewport={{ once: false }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 004 / How We Work
          </span>
          <h3 className="text-display mt-4">Six steps to flawless tech.</h3>
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
      className={`process-step-item relative flex flex-col gap-4 py-8 md:grid md:grid-cols-2 md:gap-16 md:py-12 ${
        i % 2 === 1 ? "md:[&>*:first-child]:col-start-2" : ""
      }`}
      initial={{ opacity: 0, x: i % 2 === 0 ? -60 : 60, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: false, margin: "-60px" }}
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
        viewport={{ once: false }}
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
          viewport={{ once: false }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.h3 className="text-hero !text-[clamp(3rem,9vw,9rem)]" style={{ x }}>
            Every repair
            <br />
            has a <span className="italic text-accent">guarantee.</span>
          </motion.h3>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    q: "Mainframe Computers saved my office system when our server network crashed. Fast repair and extremely honest advice!",
    a: "Ganesh Rathod",
    r: "Local Business Owner",
  },
  {
    q: "Built my custom gaming PC here. Cable management is super clean and performance is top-tier. Best tech shop in Kolhapur!",
    a: "Kabir Joshi",
    r: "Content Creator & Gamer",
  },
  {
    q: "Replaced my laptop screen and upgraded SSD in under 4 hours. Genuine parts and very polite technicians.",
    a: "Dr. Ananya Iyer",
    r: "Professor, Kolhapur University",
  },
];

function Testimonials() {
  return (
    <section id="reviews" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 005 / Customer Reviews
          </span>
          <h3 className="text-display mt-4">What our clients say.</h3>
        </motion.div>

        <motion.div
          className="grid gap-12 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={staggerContainer}
        >
          {testimonials.map((t) => (
            <motion.figure
              key={t.a}
              className="rounded-3xl border border-border bg-surface/40 p-8 flex flex-col justify-between"
              variants={fadeUp}
              whileHover={{
                y: -8,
                borderColor: "rgba(163,255,63,0.4)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div>
                <div className="mb-6 flex gap-1 text-accent">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: false }}
                      transition={{ delay: 0.2 + i * 0.08, type: "spring", stiffness: 400 }}
                    >
                      <Star className="h-4 w-4 fill-current text-accent" />
                    </motion.div>
                  ))}
                </div>
                <blockquote className="text-xl font-display leading-snug tracking-tight md:text-2xl">
                  "{t.q}"
                </blockquote>
              </div>
              <figcaption className="mt-8 border-t border-border pt-4 text-sm">
                <div className="font-medium text-foreground">{t.a}</div>
                <div className="text-muted-foreground">{t.r}</div>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Industries We Serve ──────────────────────────────────────────────────────

const industries = [
  "Students",
  "Home Users",
  "Offices",
  "Schools & Colleges",
  "Small Businesses",
  "Retail Stores",
  "Government & Private Orgs",
];

function Industries() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 006 / Audience
          </span>
          <h3 className="text-display mt-4">Industries We Serve</h3>
        </motion.div>

        <motion.div
          className="flex flex-wrap gap-4"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-60px" }}
          variants={staggerContainer}
        >
          {industries.map((ind) => (
            <motion.div
              key={ind}
              className="rounded-2xl border border-border bg-surface/40 px-8 py-5 text-xl md:text-2xl font-display font-medium hover:border-accent hover:text-accent transition-colors"
              variants={fadeUp}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              {ind}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Vision & Mission ────────────────────────────────────────────────────────

function VisionMission() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Vision */}
          <motion.div
            className="rounded-3xl border border-border bg-surface/40 p-8 md:p-12 relative overflow-hidden"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — Our Vision
            </span>
            <h4 className="mt-4 text-3xl md:text-4xl font-display">
              To become the most trusted technology service provider.
            </h4>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Delivering innovative, reliable, and customer-focused IT solutions that simplify tech for everyone.
            </p>
          </motion.div>

          {/* Mission */}
          <motion.div
            className="rounded-3xl border border-border bg-surface/40 p-8 md:p-12 relative overflow-hidden"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — Our Mission
            </span>
            <h4 className="mt-4 text-3xl md:text-4xl font-display">
              To simplify technology with genuine products & expert repair.
            </h4>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Offering high-quality repair services, transparent advice, and professional support customers rely on.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Core Values ─────────────────────────────────────────────────────────────

const values = [
  { t: "Integrity", d: "Honest quotes, original parts, no hidden fees." },
  { t: "Quality", d: "Precision workmanship on every single repair." },
  { t: "Reliability", d: "Consistent service and dependable turnaround times." },
  { t: "Customer First", d: "Personal support tailored to your exact needs." },
  { t: "Innovation", d: "Latest diagnostics tools and repair techniques." },
  { t: "Professionalism", d: "Skilled technicians trained across all hardware." },
];

function CoreValues() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={fadeUp}
        >
          <span className="font-mono text-xs uppercase tracking-widest text-accent">
            — 007 / Core Values
          </span>
          <h3 className="text-display mt-4">What drives us.</h3>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={staggerContainer}
        >
          {values.map((v, i) => (
            <motion.div
              key={v.t}
              className="group relative rounded-2xl border border-border bg-surface/40 p-8"
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
              <div className="text-3xl font-display">{v.t}</div>
              <p className="mt-3 text-sm text-muted-foreground">{v.d}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const faqs = [
  {
    q: "Where is Mainframe Computers located?",
    a: "We are located in Kolhapur, Maharashtra, India. You can bring your device directly to our sales & service center or call us for on-site support.",
  },
  {
    q: "How fast can you repair my laptop?",
    a: "Most software, formatting, and battery/screen replacements are done same-day. Complex motherboard level repairs take 24–48 hours.",
  },
  {
    q: "Do you offer genuine replacement parts?",
    a: "Yes! We use 100% genuine and high-quality replacement parts backed by official manufacturer warranties.",
  },
  {
    q: "Do you install CCTV cameras for homes and offices?",
    a: "Yes, we provide end-to-end CCTV camera installation, wiring, DVR/NVR setup, and remote smartphone viewing configuration.",
  },
  {
    q: "Can you build a custom gaming or editing PC?",
    a: "Absolutely! We build custom PCs tailored to your budget and workload requirements, complete with cable management and testing.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <div className="grid gap-16 md:grid-cols-[1fr_2fr]">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: false }} variants={fadeUp}>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 008 / FAQ
            </span>
            <h3 className="text-display mt-4">Questions & Answers.</h3>
          </motion.div>
          <div>
            {faqs.map((f, i) => (
              <motion.div
                key={f.q}
                className="border-t border-border last:border-b"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-lg md:text-2xl font-display tracking-tight">{f.q}</span>
                  <motion.span
                    className="shrink-0 rounded-full border border-border p-2"
                    animate={{
                      rotate: open === i ? 180 : 0,
                      borderColor: open === i ? "var(--accent)" : "var(--border)",
                    }}
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

// ─── MapSection ───────────────────────────────────────────────────────────────

function MapSection() {
  return (
    <section className="relative border-t border-border/50 py-24 md:py-36">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10">
        <motion.div
          className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, margin: "-80px" }}
          variants={fadeUp}
        >
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              — 009 / Location
            </span>
            <h3 className="text-display mt-4">Visit Our Center</h3>
            <p className="mt-2 text-muted-foreground flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" /> Kolhapur, Maharashtra, India
            </p>
          </div>

          <motion.a
            href="https://share.google/Mtyeay59d6MGzmbD1"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-3.5 !px-6"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(163,255,63,0.45)" }}
            whileTap={{ scale: 0.97 }}
          >
            Open in Google Maps <ArrowUpRight className="h-4 w-4" />
          </motion.a>
        </motion.div>

        <motion.div
          className="relative h-[400px] md:h-[500px] w-full overflow-hidden rounded-3xl border border-border bg-surface/40 shadow-2xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-60px" }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <iframe
            title="Mainframe Computers Location"
            src="https://maps.google.com/maps?q=Mainframe+Computers+Kolhapur&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="h-full w-full border-0 grayscale invert contrast-125 opacity-80 transition-opacity hover:opacity-100"
            loading="lazy"
            allowFullScreen
          />
          <div className="absolute bottom-6 left-6 right-6 md:right-auto flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/90 backdrop-blur-xl p-4 md:p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent border border-accent/20">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display font-medium text-foreground">Mainframe Computers</div>
                <div className="text-xs text-muted-foreground">Sales, Repairs & CCTV Solutions</div>
              </div>
            </div>
            <a
              href="https://share.google/Mtyeay59d6MGzmbD1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-accent hover:underline hidden sm:inline-flex items-center gap-1"
            >
              Directions <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>
        </motion.div>
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
          viewport={{ once: false }}
        >
          — Contact Mainframe
        </motion.span>
        <motion.h3
          className="mx-auto mt-8 text-hero"
          initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: false }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
        >
          READY TO
          <br />
          <span className="italic text-accent">REPAIR?</span>
        </motion.h3>
        <motion.p
          className="mx-auto mt-8 max-w-xl text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          Your trusted partner for computer sales, repairs, upgrades, and IT solutions in Kolhapur.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ delay: 0.5, duration: 0.9 }}
        >
          <motion.a
            href="https://wa.me/919021039470"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-5 !px-8 !text-base"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(163,255,63,0.5)" }}
            whileTap={{ scale: 0.97 }}
          >
            Chat on WhatsApp <ArrowRight className="h-4 w-4" />
          </motion.a>
          <motion.a
            href="tel:+91982306470"
            className="btn-ghost !py-5 !px-8 !text-base"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Call +91 98230 6470
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
          viewport={{ once: false }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="text-[clamp(3.5rem,13vw,12rem)] font-display leading-none tracking-tighter">
            Mainframe<span className="text-accent"> Computers</span>
          </div>
        </motion.div>
        <div className="grid gap-10 border-t border-border pt-10 md:grid-cols-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Location</div>
            <a
              href="https://share.google/Mtyeay59d6MGzmbD1"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm hover:text-accent transition-colors"
            >
              Kolhapur, Maharashtra, India <ArrowUpRight className="h-3 w-3 text-accent" />
            </a>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Navigation
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {["Home", "Services", "About", "Why Us", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                    className="hover:text-accent transition-colors"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Services</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Laptop & Desktop Repair</li>
              <li>Custom PC Building</li>
              <li>CCTV Installation</li>
              <li>Data Recovery</li>
              <li>Network Configuration</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Contact</div>
            <a
              href="tel:+91982306470"
              className="mt-3 block text-sm hover:text-accent transition-colors"
            >
              +91 98230 6470
            </a>
            <a
              href="https://wa.me/919021039470"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              WhatsApp Support
            </a>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs uppercase tracking-widest text-muted-foreground md:flex-row md:items-center">
          <span>© Mainframe Computers 2026 — Sales & Services</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
            Revive Your Tech, Restore Your Life
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Preloader ───────────────────────────────────────────────────────────────

function Preloader() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    let animationFrameId: number;
    let startTime: number | null = null;
    const duration = 1100; // 1.1s smooth 60fps count-up

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progressRatio = Math.min(1, elapsed / duration);
      
      const easedProgress = Math.round((1 - Math.pow(1 - progressRatio, 3)) * 100);
      setProgress(easedProgress);

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          setLoading(false);
          document.body.style.overflow = "unset";
        }, 150);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-50 flex flex-col justify-between bg-background p-8 md:p-16 text-foreground overflow-hidden transform-gpu"
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
        >
          {/* Ambient Radial Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-accent/10 blur-[180px] pointer-events-none transform-gpu" />
          <div className="grid-bg absolute inset-0 opacity-40 pointer-events-none" />

          {/* Top Info Bar */}
          <motion.div
            className="relative z-10 flex items-center justify-between text-xs font-mono uppercase tracking-[0.25em] text-muted-foreground"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.4 } }}
          >
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-dot" />
              Kolhapur, Maharashtra
            </span>
            <span>Est. 2018</span>
          </motion.div>

          {/* Center Giant Typographic Counter with Zoom & Blur Exit */}
          <motion.div
            className="relative z-10 mx-auto text-center my-auto flex flex-col items-center justify-center transform-gpu"
            exit={{
              scale: 4,
              filter: "blur(40px)",
              opacity: 0,
              transition: { duration: 0.85, ease: [0.87, 0, 0.13, 1] },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-xs uppercase tracking-[0.4em] text-accent font-mono mb-4"
            >
              Mainframe Computers · Sales & Services
            </motion.div>

            <div className="font-display text-[clamp(5rem,20vw,16rem)] font-bold tracking-tighter leading-none text-foreground select-none">
              {String(progress).padStart(3, "0")}
              <span className="text-accent text-[0.4em] tracking-normal font-light">%</span>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mt-6 text-xs md:text-sm text-muted-foreground tracking-[0.25em] uppercase font-mono"
            >
              Revive Your Tech · Restore Your Life
            </motion.p>
          </motion.div>

          {/* Bottom Hairline ScaleX Progress Bar */}
          <motion.div
            className="relative z-10 border-t border-border/40 pt-6"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.4 } }}
          >
            <div className="flex items-center justify-between font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <span>Initializing System Hardware</span>
              <span className="text-accent">Kolhapur IT Center</span>
            </div>

            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface relative">
              <div
                className="h-full bg-accent origin-left transition-transform duration-75 ease-out transform-gpu"
                style={{ transform: `scaleX(${progress / 100})` }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Mobile Sticky Bar ───────────────────────────────────────────────────────

function MobileStickyBar() {
  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex items-center gap-3 rounded-full border border-border bg-background/90 backdrop-blur-2xl p-2.5 shadow-2xl md:hidden">
      <a
        href="tel:+91982306470"
        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-3 text-xs font-semibold text-background"
      >
        <Phone className="h-3.5 w-3.5" /> Call Technician
      </a>
      <a
        href="https://wa.me/919021039470"
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-surface py-3 text-xs font-medium text-foreground hover:border-accent"
      >
        WhatsApp <ArrowUpRight className="h-3.5 w-3.5 text-accent" />
      </a>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MainframePage() {
  return (
    <div className="relative bg-background text-foreground overflow-x-hidden pb-16 md:pb-0">
      <Preloader />
      <Spotlight />
      <Nav />
      <main>
        <Hero />
        <StoryStatement />
        <Services />
        <Numbers />
        <Comparison />
        <Process />
        <PixelPurpose />
        <Testimonials />
        <Industries />
        <VisionMission />
        <CoreValues />
        <MapSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <MobileStickyBar />
    </div>
  );
}
