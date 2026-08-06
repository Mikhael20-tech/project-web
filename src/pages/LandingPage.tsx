import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Zap,
  ShieldCheck,
  Users,
  MessageSquare,
  ChevronRight,
  LayoutDashboard,
  Clock,
  HelpCircle,
  ChevronDown,
  Languages,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { socket } from "@/src/lib/socket";
import { useLanguage } from "@/src/lib/LanguageContext";
import Logo from "@/src/components/Logo";

// ─── Dosen card fetches real data from /api/dosen ───────────────────────────

function DosenCard() {
  const { t } = useLanguage();
  const [list, setList] = React.useState<any[]>([]);

  useEffect(() => {
    fetch("/api/dosen")
      .then((r) => r.json())
      .then((data: any[]) => {
        // Sort: prefer Yeni & Eko first, then rest; take top 4
        const sorted = [...data].sort((a, b) => {
          const aName = a.nama.toLowerCase();
          const bName = b.nama.toLowerCase();
          if (aName.includes("yeni") && !bName.includes("yeni")) return -1;
          if (!aName.includes("yeni") && bName.includes("yeni")) return 1;
          if (aName.includes("eko") && !bName.includes("eko")) return -1;
          if (!aName.includes("eko") && bName.includes("eko")) return 1;
          return 0;
        });
        setList(sorted.slice(0, 4));
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden w-full max-w-sm">
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest">{t("dash_admin_total_quota")}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <div className="divide-y divide-zinc-100">
        {list.map((d, i) => {
          const taken = d._count?.mahasiswa ?? 0;
          const max   = d.kuotaMax ?? 6;
          const full  = taken >= max;
          const pct   = Math.round((taken / max) * 100);
          return (
            <div key={d.id ?? i} className="px-5 py-4 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-zinc-800 leading-snug">{d.nama}</span>
                <span className={cn(
                  "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full",
                  full ? "bg-zinc-100 text-zinc-500" : "bg-teal-50 text-teal-700"
                )}>
                  {full ? "PENUH" : `${taken}/${max}`}
                </span>
              </div>
              <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full", full ? "bg-zinc-300" : "bg-teal-500")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100">
        <span className="text-[11px] text-zinc-400 font-mono">wardospem.com · live</span>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang, t } = useLanguage();
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => element.scrollIntoView({ behavior: "smooth" }), 100);
      }
    }
  }, [location.pathname, location.hash]);

  const languages = [
    { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
    { code: "en", label: "English", flag: "🇺🇸" },
    { code: "zh", label: "Chinese (Mandarin)", flag: "🇨🇳" },
    { code: "ja", label: "Japanese", flag: "🇯🇵" },
    { code: "ko", label: "Korean", flag: "🇰🇷" },
  ];

  useEffect(() => {
    socket.on("online_count", (count) => setOnlineCount(count));
    return () => { socket.off("online_count"); };
  }, []);

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
  ];

  const features = [
    { icon: Clock,          title: t("f1_t"), desc: t("f1_d") },
    { icon: MessageSquare,  title: t("f2_t"), desc: t("f2_d") },
    { icon: LayoutDashboard,title: t("f3_t"), desc: t("f3_d") },
    { icon: ShieldCheck,    title: t("f4_t"), desc: t("f4_d") },
    { icon: Zap,            title: t("f5_t"), desc: t("f5_d") },
  ];

  const ease = [0.16, 1, 0.3, 1] as const;

  return (
    <div className="min-h-screen bg-[#F9F9F6] text-zinc-900 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left col — copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
            className="space-y-8"
          >
            {/* Online indicator — one only, no tag cloud */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[12px] font-medium text-zinc-500">
                {onlineCount} {t("landing_online_users")}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] text-zinc-900">
              {t("hero_title")}<br />
              <span className="text-teal-600">PTI UNESA.</span>
            </h1>

            <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-md">
              {t("hero_subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-3">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white text-sm font-semibold rounded-lg hover:bg-zinc-700 active:scale-[0.98] transition-all"
              >
                {t("start_now")} <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="#features"
                className="inline-flex items-center gap-2 px-6 py-3 bg-transparent text-zinc-700 text-sm font-semibold rounded-lg border border-zinc-200 hover:border-zinc-400 hover:text-zinc-900 transition-all"
              >
                {t("view_features")}
              </a>
            </div>
          </motion.div>

          {/* Right col — Video Tutorial YouTube Embed */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="flex justify-center lg:justify-end w-full"
          >
            <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-sm p-2 overflow-hidden">
              <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
                <iframe
                  className="w-full h-full border-0"
                  src="https://www.youtube.com/embed/qcKkxShjlxQ"
                  title="Video Tutorial WarDosPem PTI UNESA"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-14">
            {t("why_WarDosPem")}
          </h2>

          {/* Asymmetric bento: 2-col big + 3-col small */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease }}
                className={cn(
                  "bg-[#F9F9F6] p-8 group hover:bg-white transition-colors duration-200",
                  i === 0 && "md:col-span-2",  // first feature gets full width
                )}
              >
                <div className="flex items-start gap-5">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 group-hover:bg-teal-500 group-hover:border-teal-500 transition-colors">
                    <f.icon className="w-4 h-4 text-teal-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-1.5">{f.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES — asymmetric split layout ─────────────────────────────── */}
      <section className="py-24 px-6 bg-zinc-900 text-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("landing_modules_title")}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {t("landing_modules_subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: t("module_magang_t"), desc: t("module_magang_d"), icon: Users },
              { title: t("module_skripsi_t"), desc: t("module_skripsi_d"), icon: ShieldCheck },
            ].map((m, i) => (
              <div
                key={i}
                className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 space-y-3 hover:border-teal-500/50 transition-colors"
              >
                <m.icon className="w-5 h-5 text-teal-400" />
                <h3 className="font-semibold text-white">{m.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight mb-12">
            {t("faq_title")}
          </h2>

          <div className="divide-y divide-zinc-200">
            {faqs.map((faq, i) => (
              <div key={i}>
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full py-5 flex items-start justify-between text-left gap-8 hover:text-teal-700 transition-colors group"
                >
                  <span className="font-medium text-zinc-900 group-hover:text-teal-700 transition-colors">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 shrink-0 text-zinc-400 transition-transform duration-200 mt-0.5",
                      activeFaq === i && "rotate-180 text-teal-600"
                    )}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm text-zinc-500 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-10 border-t border-zinc-200 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div className="max-w-xs space-y-3">
            <Logo showText={true} className="justify-start" iconSize="w-7 h-7" />
            <p className="text-sm text-zinc-500 leading-relaxed">
              {t("footer_desc")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-12">
            <div>
              <h4 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-widest mb-4">{t("footer_links")}</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li><a href="/" className="hover:text-zinc-900 transition-colors">{t("nav_home")}</a></li>
                <li><a href="/guide" className="hover:text-zinc-900 transition-colors">{t("nav_guide")}</a></li>
                <li><a href="/portfolio" className="hover:text-zinc-900 transition-colors">{t("nav_portfolio")}</a></li>
                <li><a href="/#faq" className="hover:text-zinc-900 transition-colors">{t("nav_faq")}</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-semibold text-zinc-900 uppercase tracking-widest mb-4">{t("footer_contact")}</h4>
              <ul className="space-y-3 text-sm text-zinc-500">
                <li>
                  <a href="mailto:s1ptiunesa1@gmail.com" className="hover:text-zinc-900 transition-colors">
                    s1ptiunesa1@gmail.com
                  </a>
                </li>
                <li>{t("footer_address_building")}</li>
                <li>{t("footer_address_city")}</li>
                <li>
                  <a
                    href="https://www.instagram.com/hmppti.unesa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-zinc-900 transition-colors inline-flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                    @hmppti.unesa
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-8 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[11px] text-zinc-400">
            &copy; {new Date().getFullYear()} PTI UNESA. {t("footer_rights")}
          </p>
          <p className="text-[11px] text-zinc-400">
            v1.0.0
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
