import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
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
import { socket } from "@/src/lib/socket";
import { useLanguage } from "@/src/lib/LanguageContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLanguage();
  const [onlineCount, setOnlineCount] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

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
      q: "Kapan jadwal war dospem dimulai?",
      a: "Jadwal ditentukan oleh Admin Prodi. Anda dapat melihat hitung mundur (countdown) secara real-time di Dashboard setelah login."
    },
    {
      q: "Bagaimana jika kuota dosen yang saya inginkan penuh?",
      a: "Sistem menggunakan prinsip 'First Come First Served'. Jika kuota penuh, silakan pilih dosen lain yang masih tersedia."
    },
    {
      q: "Apakah saya bisa mengubah pilihan dosen?",
      a: "Selama masa war masih dibuka oleh admin, Anda dapat membatalkan pilihan dan memilih kembali dosen lain."
    },
    {
      q: "Apa fungsi fitur AI Broadcast?",
      a: "Fitur ini membantu Admin menyusun pengumuman resmi yang profesional dan mengirimkannya langsung ke WhatsApp Anda agar tidak ketinggalan informasi."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-teal-950 font-sans selection:bg-teal-100 selection:text-teal-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-teal-50 px-6 py-4 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-950 rounded-xl flex items-center justify-center text-teal-400 shadow-lg shadow-teal-950/20">
            <Zap className="w-6 h-6" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">WarDosen<span className="text-teal-500">.</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-xs font-black uppercase tracking-widest text-teal-800/60 hover:text-teal-950 transition-colors">{t("view_features")}</a>
          <a href="#faq" className="text-xs font-black uppercase tracking-widest text-teal-800/60 hover:text-teal-950 transition-colors">FAQ</a>
          
          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-xl hover:bg-teal-100 transition-all"
            >
              <Languages className="w-4 h-4 text-teal-500" />
              <span className="text-[10px] font-black text-teal-900 uppercase">{lang}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-48 bg-white border border-teal-50 rounded-2xl shadow-2xl p-2 z-[70]"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all ${lang === l.code ? "bg-teal-50 text-teal-950" : "hover:bg-slate-50 text-teal-800/60"}`}
                    >
                      <span className="text-lg">{l.flag}</span>
                      <span className="text-xs font-bold">{l.label}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-teal-700 uppercase">{onlineCount} {t("online_status")}</span>
          </div>
        </div>

        <button 
          onClick={() => navigate("/login")}
          className="px-6 py-2.5 bg-teal-950 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg shadow-teal-950/10 active:scale-95"
        >
          {t("login")}
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-teal-100 rounded-full blur-[100px] opacity-50" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100 rounded-full blur-[100px] opacity-30" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full text-teal-700 mb-8 border border-teal-100"
          >
            <Zap className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest italic">The Future of Lecturer Selection</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8"
          >
            {t("hero_title")} <br/>
            <span className="text-teal-500">PTI UNESA.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-teal-800/60 font-medium mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {t("hero_subtitle")}
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
      <section id="features" className="py-24 bg-teal-50/30 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-4">Kenapa WarDosen?</h2>
            <div className="w-20 h-1.5 bg-teal-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Clock, title: "Real-time War", desc: "Sistem sinkronisasi detik demi detik untuk menjamin keadilan dalam pemilihan dospem." },
              { icon: MessageSquare, title: "AI Smart Broadcast", desc: "Terima notifikasi resmi langsung ke WhatsApp Anda melalui integrasi AI Gemini." },
              { icon: LayoutDashboard, title: "Premium Dashboard", desc: "Tampilan antarmuka kelas dunia yang memudahkan navigasi dan monitoring data." },
              { icon: ShieldCheck, title: "Security First", desc: "Perlindungan data terjamin dengan enkripsi tingkat tinggi dan validasi ganda." },
              { icon: Zap, title: "Fonnte Integration", desc: "Gateway pesan WhatsApp yang handal untuk menjamin informasi sampai tepat waktu." },
              { icon: CheckCircle2, title: "Evidence PDF", desc: "Dapatkan bukti pemilihan resmi dalam format PDF langsung setelah Anda berhasil." }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-10 rounded-[3rem] border border-teal-50 shadow-xl shadow-teal-500/5 group"
              >
                <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 mb-6 group-hover:bg-teal-950 group-hover:text-teal-400 transition-colors">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black mb-3">{f.title}</h3>
                <p className="text-sm text-teal-800/60 font-medium leading-relaxed">{f.desc}</p>
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
                className="bg-white border border-teal-50 rounded-[2rem] overflow-hidden shadow-sm"
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
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-8 h-8 bg-teal-950 rounded-lg flex items-center justify-center text-teal-400">
            <Zap className="w-5 h-5" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">WarDosen<span className="text-teal-500">.</span></span>
        </div>
        <p className="text-[10px] font-black text-teal-800/30 uppercase tracking-[0.3em]">
          &copy; 2024 PTI UNESA. All Rights Reserved. Crafted for Excellence.
        </p>
      </footer>

      {/* Floating Support Button */}
      <a 
        href="https://wa.me/628123456789" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:bg-emerald-600 hover:-translate-y-2 transition-all z-[60] group"
      >
        <MessageSquare className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute right-20 px-4 py-2 bg-teal-950 text-white text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
          {t("support_hint")}
        </span>
      </a>
    </div>
  );
};

export default LandingPage;
