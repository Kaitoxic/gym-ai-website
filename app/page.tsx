"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView, useScroll, useSpring, useMotionValue } from "framer-motion";
import Lenis from "lenis";

// ─── Smooth scroll (Lenis) ────────────────────────────────────────
function useLenis() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);
}

// ─── Custom cursor ────────────────────────────────────────────────
function Cursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 800, damping: 50, mass: 0.2 });
  const springY = useSpring(cursorY, { stiffness: 800, damping: 50, mass: 0.2 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12);
      cursorY.set(e.clientY - 12);
      setVisible(true);
    };
    const leave = () => setVisible(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, [cursorX, cursorY]);

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen"
      style={{ x: springX, y: springY, opacity: visible ? 1 : 0 }}
    >
      <div className="w-6 h-6 rounded-full bg-violet-400/70 blur-[6px]" />
    </motion.div>
  );
}

// ─── Scroll progress bar ──────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 origin-left z-50"
      style={{ scaleX }}
    />
  );
}

// ─── Animation presets ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ─── Scroll-triggered section wrapper ────────────────────────────
function FadeInSection({ children, className = "", delay = 0, id }: { children: React.ReactNode; className?: string; delay?: number; id?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated counter ─────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView || !ref.current) return;
    let start = 0;
    const duration = 1800;
    const step = (timestamp: number, startTime: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      if (ref.current) ref.current.textContent = Math.floor(eased * to).toLocaleString("fr-FR") + suffix;
      if (progress < 1) requestAnimationFrame((t) => step(t, startTime));
    };
    requestAnimationFrame((t) => step(t, t));
  }, [inView, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

// ─── Phone screenshot carousel ────────────────────────────────────
const screens = ["/screen1.png", "/screen2.png", "/screen3.png"];

function PhoneCarousel() {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % screens.length);
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.75, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Glow */}
      <motion.div
        className="absolute inset-0 rounded-[44px] bg-violet-500/20 blur-3xl pointer-events-none"
        animate={{ scale: [0.88, 1.06, 0.88], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating phone frame */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative w-[260px] sm:w-[280px] h-[540px] rounded-[44px] border border-violet-500/30 bg-[#0c0a1a] shadow-[0_30px_100px_rgba(0,0,0,0.7)] overflow-hidden mx-auto"
      >
        {/* Shimmer top line */}
        <div className="absolute top-0 left-0 right-0 h-px overflow-hidden z-10">
          <motion.div
            className="h-full w-1/2 bg-gradient-to-r from-transparent via-violet-400/80 to-transparent"
            animate={{ x: ["-100%", "300%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
          />
        </div>

        {/* Dynamic island notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-10" />

        {/* Screenshot */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={screens[index]}
              alt={`App screenshot ${index + 1}`}
              fill
              className="object-cover object-top"
              priority={index === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Bottom overlay gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {screens.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === index ? "bg-violet-400 w-3" : "bg-white/30"}`}
            />
          ))}
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-[#08070f] to-transparent rounded-b-[44px] pointer-events-none" />
    </motion.div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────
const features = [
  { icon: "🤖", title: "Programmes IA", desc: "Génère un programme de musculation complet en 30 secondes, adapté à ton profil, ton matériel et tes objectifs.", badge: "Pro" },
  { icon: "🥗", title: "Nutrition AI", desc: "Conseils nutritionnels personnalisés basés sur ta morphologie, ton objectif et tes habitudes alimentaires.", badge: "Pro" },
  { icon: "🏃", title: "Cardio AI", desc: "Plans HIIT, LISS et MIIT générés par l'IA selon ton niveau et ta composition corporelle cible.", badge: "Pro" },
  { icon: "📊", title: "Suivi & Streaks", desc: "Logge tes séances en temps réel, visualise ta progression et garde ta flamme avec les streaks quotidiens." },
  { icon: "⚡", title: "Adaptation IA", desc: "Après chaque séance, l'IA analyse tes perfs et ajuste automatiquement les charges de la prochaine session.", badge: "Pro" },
  { icon: "💬", title: "Coach Chat", desc: "Pose tes questions à ton coach IA 24h/24 — technique, récupération, nutrition, motivation." },
];

const stats = [
  { value: 0, suffix: "", label: "Inscrits bêta", display: "N/A" },
  { value: 200, suffix: "+", label: "Exercices", display: null },
  { value: 0, suffix: "", label: "Satisfaction", display: "N/A%" },
  { value: 30, suffix: "s", label: "Pour générer un programme", display: null },
];

const freeTier = ["3 messages coach / jour", "Suivi des séances illimité", "Historique nutrition & cardio", "Calcul de streak quotidien", "Catalogue d'exercices complet"];
const proTier = ["Tout le tier gratuit inclus", "Génération de programme IA", "Adaptation IA après chaque séance", "Coach nutrition & cardio illimité", "Accès prioritaire aux nouveautés"];

// ─── Page ─────────────────────────────────────────────────────────
export default function Home() {
  useLenis();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, margin: "-60px" });

  return (
    <>
      <Cursor />
      <ScrollProgress />

      <main className="relative min-h-screen bg-[#08070f] text-white overflow-hidden">

        {/* ── Grain texture overlay ── */}
        <div
          className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />

        {/* ── Grid overlay ── */}
        <div
          className="pointer-events-none fixed inset-0 z-[1] opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(139,92,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.4) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        {/* ── Orbs de fond animés ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <motion.div
            className="absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-violet-700/20 blur-[140px]"
            animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.28, 0.18] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-60 -right-60 w-[700px] h-[700px] rounded-full bg-purple-800/20 blur-[140px]"
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.12, 0.2] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[120px]"
            animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* ── Navigation ── */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto"
        >
          <span className="text-xl font-black tracking-tight">
            <span className="text-white">GymCoach</span>
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
          </span>
          <motion.a
            href="#newsletter"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="px-5 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-300 text-sm font-semibold hover:bg-violet-600/30 hover:border-violet-400/50 transition-colors duration-200"
          >
            Rejoindre la bêta
          </motion.a>
        </motion.nav>

        {/* ── Hero ── */}
        <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-32 max-w-5xl mx-auto">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 text-xs font-bold tracking-[0.15em] mb-10 uppercase"
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-violet-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Application bientôt disponible
          </motion.div>

          {/* Titre */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] mb-7"
          >
            <span className="text-white">Le coach IA</span>
            <br />
            <motion.span
              className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent inline-block"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              style={{ backgroundSize: "200% auto" }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            >
              qui s&apos;adapte à toi
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed"
          >
            GymCoach AI génère tes programmes de musculation, suit tes séances et adapte
            chaque workout après chaque performance. Un vrai coach intelligent dans ta poche.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row gap-4 mb-24"
          >
            <motion.a
              href="#newsletter"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-[0_0_40px_rgba(139,92,246,0.35)] hover:shadow-[0_0_70px_rgba(139,92,246,0.6)] transition-shadow duration-300"
            >
              Rejoindre la liste d&apos;attente →
            </motion.a>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-2xl border border-white/10 text-gray-300 font-semibold text-sm hover:border-violet-500/40 hover:text-white transition-all duration-200"
            >
              Voir les fonctionnalités
            </motion.a>
          </motion.div>

          {/* Mockup téléphone flottant — carousel screenshots */}
          <PhoneCarousel />
        </section>

        {/* ── Stats bar ── */}
        <FadeInSection className="relative z-10 px-6 py-10 max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-violet-500/10 rounded-2xl overflow-hidden border border-violet-500/10">
            {stats.map((s, i) => (
              <div key={i} className="bg-[#0c0b18] px-6 py-8 text-center">
                <p className="text-3xl sm:text-4xl font-black text-white mb-1">
                  {s.display ? s.display : <Counter to={s.value} suffix={s.suffix} />}
                </p>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        </FadeInSection>

        {/* ── Features ── */}
        <section id="features" className="relative z-10 px-6 py-24 max-w-6xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Tout pour progresser
              </span>
            </h2>
            <p className="text-gray-500 text-lg">intelligemment, sans se poser de questions</p>
          </FadeInSection>

          <motion.div
            ref={featuresRef}
            variants={staggerContainer}
            initial="hidden"
            animate={featuresInView ? "show" : "hidden"}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={cardVariant}
                whileHover={{ scale: 1.02, borderColor: "rgba(139, 92, 246, 0.4)" }}
                className="group relative p-6 rounded-2xl bg-white/[0.025] border border-violet-500/10 hover:bg-white/[0.05] transition-colors duration-300 cursor-default overflow-hidden"
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-violet-500/5 to-transparent pointer-events-none" />
                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div
                    className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-[-20deg]"
                    animate={{ x: ["-100%", "400%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear", repeatDelay: 0.8 }}
                  />
                </div>
                {f.badge && (
                  <span className="absolute top-4 right-4 px-2.5 py-1 text-[10px] font-black rounded-full bg-violet-600/30 border border-violet-500/40 text-violet-300 tracking-wider uppercase">
                    {f.badge}
                  </span>
                )}
                <div className="text-3xl mb-4 relative">{f.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2 relative">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed relative">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Section bêta ── */}
        <FadeInSection className="relative z-10 px-6 py-8 max-w-3xl mx-auto">
          <div className="relative p-10 sm:p-14 rounded-3xl border border-violet-500/20 overflow-hidden">
            {/* Shimmer border sweep */}
            <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 left-0 w-1/2 h-px bg-gradient-to-r from-transparent via-violet-400/70 to-transparent"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-violet-950/70 via-purple-950/50 to-[#08070f]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.08)_0%,transparent_70%)]" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

            <div className="relative flex flex-col items-center text-center gap-7">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-violet-500/30 blur-xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-3xl font-black shadow-[0_0_40px_rgba(139,92,246,0.6)] border border-violet-400/30">
                  C
                </div>
              </div>

              <div>
                <span className="inline-block px-4 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 text-xs font-bold tracking-widest uppercase mb-5">
                  Pendant la bêta
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-5">
                  Je suis disponible pour toi pendant la bêta
                </h2>
                <p className="text-gray-400 leading-relaxed text-base max-w-xl mx-auto">
                  Durant la phase bêta, je génère ton programme sur-mesure et te donne des conseils directement.
                  Tu as une question sur ta séance, ta nutrition ou ton programme ? Je réponds.
                </p>
              </div>

              <div>
                <p className="text-white font-bold text-lg">Kaito</p>
                <p className="text-gray-500 text-sm">Fondateur &amp; Coach GymCoach AI</p>
              </div>
            </div>
          </div>
        </FadeInSection>

        {/* ── Pricing ── */}
        <section className="relative z-10 px-6 py-24 max-w-4xl mx-auto">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black mb-4">
              <span className="bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
                Tarifs simples
              </span>
            </h2>
            <p className="text-gray-500 text-lg">Commence gratuitement, évolue quand tu veux</p>
          </FadeInSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <FadeInSection delay={0.1}>
              <div className="p-8 rounded-3xl bg-white/[0.025] border border-white/10 flex flex-col gap-7 h-full">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Gratuit</p>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-white">0</span>
                    <span className="text-gray-400 text-xl mb-1">€</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-1">Pour toujours</p>
                </div>
                <ul className="flex flex-col gap-3.5 flex-1">
                  {freeTier.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-400 text-sm">
                      <span className="text-gray-600 font-bold flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <motion.a
                  href="#newsletter"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="block text-center py-3.5 rounded-2xl border border-white/10 text-gray-400 text-sm font-semibold hover:border-violet-500/40 hover:text-white transition-all duration-200"
                >
                  Rejoindre la liste →
                </motion.a>
              </div>
            </FadeInSection>

            {/* Pro */}
            <FadeInSection delay={0.2}>
              <div className="relative p-8 rounded-3xl border border-violet-500/40 overflow-hidden flex flex-col gap-7 h-full shadow-[0_0_60px_rgba(139,92,246,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-b from-violet-950/80 via-purple-950/60 to-[#100820]" />

                {/* Animated glow border */}
                <motion.div
                  className="absolute inset-0 rounded-3xl"
                  animate={{ boxShadow: ["0 0 40px rgba(139,92,246,0.1)", "0 0 80px rgba(139,92,246,0.3)", "0 0 40px rgba(139,92,246,0.1)"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Shimmer sweep on Pro card */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  <motion.div
                    className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-violet-400/[0.07] to-transparent skew-x-[-15deg]"
                    animate={{ x: ["-100%", "500%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                  />
                </div>

                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-b-xl">
                  Offre bêta
                </div>

                <div className="relative mt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-violet-300 text-xs font-bold uppercase tracking-widest">Pro</p>
                    <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-black uppercase tracking-wider">
                      -70% bêta
                    </span>
                  </div>
                  <div className="flex items-end gap-2 mb-1">
                    <span className="text-5xl font-black text-white">2.99</span>
                    <span className="text-gray-400 text-xl mb-1">€</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 text-sm line-through">9.99€/mois</span>
                    <span className="text-gray-500 text-sm">· sans engagement</span>
                  </div>
                </div>

                <ul className="flex flex-col gap-3.5 flex-1 relative">
                  {proTier.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-gray-300 text-sm">
                      <span className="text-violet-400 font-bold flex-shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <motion.a
                  href="#newsletter"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative block text-center py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_50px_rgba(139,92,246,0.65)] transition-shadow duration-300"
                >
                  Rejoindre la liste Pro →
                </motion.a>
              </div>
            </FadeInSection>
          </div>
        </section>

        {/* ── Newsletter ── */}
        <FadeInSection className="relative z-10 px-6 py-24 max-w-2xl mx-auto text-center" id="newsletter">
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-violet-700/10 blur-[80px]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-black mb-5 relative">
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Sois parmi les premiers
            </span>
          </h2>
          <p className="text-gray-400 mb-10 text-base leading-relaxed relative">
            Inscris-toi pour être notifié du lancement et accéder à la bêta en avant-première.
            <br />
            <span className="text-violet-400 font-medium">Places limitées.</span>
          </p>

          {!submitted ? (
            <motion.form
              onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }}
              className="relative flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.com"
                className="flex-1 px-5 py-4 rounded-2xl bg-white/[0.04] border border-violet-500/20 text-white placeholder-gray-600 outline-none focus:border-violet-500/50 focus:bg-white/[0.07] transition-all text-sm"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold text-sm shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_50px_rgba(139,92,246,0.6)] transition-shadow duration-300 whitespace-nowrap"
              >
                Je m&apos;inscris →
              </motion.button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-8 rounded-2xl bg-violet-500/10 border border-violet-500/25"
            >
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="text-4xl mb-3"
              >
                🎉
              </motion.p>
              <p className="text-white font-bold text-lg">Tu es sur la liste !</p>
              <p className="text-gray-400 text-sm mt-2">On te contactera dès l&apos;ouverture de la bêta. Reste connecté.</p>
            </motion.div>
          )}

          <p className="text-gray-700 text-xs mt-5 relative">
            Pas de spam. Désabonnement en un clic. Données hébergées en Europe.
          </p>
        </FadeInSection>

        {/* ── Footer ── */}
        <footer className="relative z-10 border-t border-white/[0.04] py-10 px-6 text-center">
          <p className="text-xl font-black mb-3">
            <span className="text-white">GymCoach</span>
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">AI</span>
          </p>
          <p className="text-gray-600 text-sm">© 2025 GymCoach AI — Application mobile en développement</p>
        </footer>

      </main>
    </>
  );
}
