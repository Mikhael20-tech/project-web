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
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  Languages
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { socket } from "@/src/lib/socket";
import { useLanguage } from "@/src/lib/LanguageContext";
import Logo from "@/src/components/Logo";

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
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
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
    {
      q: t("q1"),
      a: t("a1")
    },
    {
      q: t("q2"),
      a: t("a2")
    },
    {
      q: t("q3"),
      a: t("a3")
    },
    {
      q: t("q4"),
      a: t("a4")
    }
  ];

  return (
    <div className="min-h-screen bg-[#F0FAF8] text-teal-950 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden relative">

      {/* Hero Section */}
      <section className="relative pt-44 pb-20 md:pt-56 md:pb-32 px-6 overflow-hidden">
        {/* Deep Background Decorations for scrollable feel */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/40 to-orange-200/40 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ animationDuration: "6s" }}
          />
          <div
            className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200/40 to-teal-200/40 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse"
            style={{ animationDuration: "8s", animationDelay: "1s" }}
          />

          <div className="absolute top-[80vh] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-100/30 blur-[150px] rounded-full" />
          <div className="absolute top-[100vh] right-0 w-64 h-64 bg-orange-100/20 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-700 mb-8 border border-teal-100"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">{t("hero_tagline")}</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-950 via-teal-800 to-indigo-950">
              {t("hero_title")}
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-orange-500 pr-2">
              PTI UNESA.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-teal-800/60 font-medium mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {lang === "id" ? (
              <>
                Sistem pemilihan dosen pembimbing skripsi yang{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-orange-500 font-extrabold">
                  cepat
                </span>{" "}
                dan{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500 font-extrabold">
                  transparan
                </span>.
              </>
            ) : lang === "en" ? (
              <>
                A{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-orange-500 font-extrabold">
                  fast
                </span>{" "}
                and{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-500 font-extrabold">
                  transparent
                </span>{" "}
                thesis advisor selection system.
              </>
            ) : (
              t("hero_subtitle")
            )}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-10 py-5 bg-teal-950 text-white rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-teal-800 hover:-translate-y-1 transition-all shadow-2xl shadow-teal-950/20 flex items-center justify-center gap-3"
            >
              {t("start_now")} <ChevronRight className="w-5 h-5" />
            </button>
            <a 
              href="#features"
              className="w-full sm:w-auto px-10 py-5 bg-white text-teal-950 border border-teal-100 rounded-[2rem] text-sm font-black uppercase tracking-widest hover:bg-teal-50 transition-all flex items-center justify-center gap-3"
            >
              {t("view_features")}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 relative z-10 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">{t("why_wardosen")}</h2>
            <div className="w-20 h-1.5 bg-teal-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: t("f1_t"), desc: t("f1_d"), color: "bg-blue-50 text-blue-500" },
              { icon: MessageSquare, title: t("f2_t"), desc: t("f2_d"), color: "bg-purple-50 text-purple-500" },
              { icon: LayoutDashboard, title: t("f3_t"), desc: t("f3_d"), color: "bg-orange-50 text-orange-500" },
              { icon: ShieldCheck, title: t("f4_t"), desc: t("f4_d"), color: "bg-emerald-50 text-emerald-500" },
              { icon: Zap, title: t("f5_t"), desc: t("f5_d"), color: "bg-pink-50 text-pink-500" },
              { icon: CheckCircle2, title: t("f6_t"), desc: t("f6_d"), color: "bg-indigo-50 text-indigo-500" }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white/70 backdrop-blur-md p-10 rounded-[3rem] border border-white/50 shadow-xl shadow-teal-500/5 group hover:bg-white/90 hover:shadow-2xl transition-all duration-300 relative z-10"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110", f.color)}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-3">{f.title}</h3>
                <p className="text-sm text-teal-800/60 font-medium leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Modules Section */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">{t("landing_modules_title")}</h2>
              <p className="text-sm md:text-lg text-teal-800/60 font-medium">{t("landing_modules_subtitle")}</p>
            </div>
            <div className="hidden md:block h-px bg-teal-100 flex-1 mx-12 mb-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {[
              { t: t("module_magang_t"), d: t("module_magang_d"), icon: Users, color: "from-indigo-500 to-indigo-600", bg: "bg-indigo-50 text-indigo-500" },
              { t: t("module_skripsi_t"), d: t("module_skripsi_d"), icon: ShieldCheck, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 text-emerald-500" }
            ].map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -5 }}
                className="relative group p-1 bg-white/50 backdrop-blur-md rounded-[3rem] border border-white/35 shadow-xl shadow-teal-900/5 overflow-hidden"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", m.color)} />
                <div className="relative z-10 bg-white/70 backdrop-blur-md p-10 rounded-[2.8rem] h-full flex flex-col items-start transition-all duration-500 group-hover:bg-transparent">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-lg group-hover:bg-white/20 group-hover:text-white transition-all", m.bg)}>
                    <m.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors">{m.t}</h3>
                  <p className="text-sm text-teal-800/60 font-medium leading-relaxed group-hover:text-white/80 transition-colors">{m.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 bg-teal-950 rounded-2xl flex items-center justify-center text-teal-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tighter">{t("faq_title")}</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-8 flex items-center justify-between text-left hover:bg-teal-50/50 transition-colors"
                >
                  <span className="font-black text-teal-950 pr-8">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-teal-400 transition-transform duration-300 ${activeFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-8 pt-0 text-sm text-teal-800/60 font-medium leading-relaxed border-t border-teal-50/50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-teal-50 px-6 text-center">
        <Logo showText={true} className="justify-center mb-6" iconSize="w-8 h-8" />
        <p className="text-[10px] font-black text-teal-800/30 uppercase tracking-[0.3em]">
          &copy; 2024 PTI UNESA. All Rights Reserved. Crafted for Excellence.
        </p>
      </footer>

    </div>
  );
};

export default LandingPage;
