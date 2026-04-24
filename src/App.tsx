import React, { useState, useEffect, ReactNode, FormEvent } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, Users, Timer, GraduationCap, Lock, CheckCircle2, AlertCircle, Plus, Trash2, Edit, Save, Settings, Calendar, UserPlus, Info, Download, XCircle, RefreshCcw, Camera, Upload, TrendingUp, Smartphone, Globe, Award, Search, Menu, ArrowRight, ChevronRight, Play, BookOpen, Star } from "lucide-react";
import { socket } from "@/src/lib/socket";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white/70 backdrop-blur-md border border-white border-opacity-40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300", className)}>
    {children}
  </div>
);

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 py-3 flex justify-center items-center transition-all">
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-teal-600 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
            <GraduationCap className="text-white w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            WarDosen <span className="text-teal-600">2024</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="text-right hidden md:block mr-2">
                <p className="text-[11px] text-gray-500 font-medium tracking-wider uppercase">
                  {user.role === 'ADMIN' ? 'Administrator' : 'Mahasiswa'}
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.role === 'ADMIN' ? user.username : (user.mahasiswa?.nama || user.username)}
                </p>
              </div>
              <div className="flex items-center gap-5 pl-5 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden ring-2 ring-transparent shadow-sm transition-all duration-300 hover:ring-teal-100 cursor-default">
                  {user.mahasiswa?.foto ? (
                    <img referrerPolicy="no-referrer" src={user.mahasiswa.foto || undefined} alt="Profile" className="w-full h-full object-cover" />
                  ) : user.foto ? (
                    <img referrerPolicy="no-referrer" src={user.foto || undefined} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">
                      {user.mahasiswa?.nama ? getInitials(user.mahasiswa.nama) : (user.role === 'ADMIN' ? 'A' : '??')}
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className="text-sm font-medium text-gray-500 hover:text-red-600 px-3 py-2 rounded-xl border border-transparent hover:border-red-100 hover:bg-red-50 transition-all"
                >
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-teal-700 transition-all hover:shadow-md"
            >
              Login Portal
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

// --- PAGES ---

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const LandingPage = ({ user }: { user: any }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F0FAF8]">
      {/* Navbar space filler */}
      <div className="h-16 bg-[#F0FAF8] border-b border-white/50 backdrop-blur-md sticky top-0 z-40" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-28 px-6 overflow-hidden">
        <div className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.5] z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-teal-100/40 to-orange-100/40 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-100/40 to-teal-100/40 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center max-w-4xl"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-teal-100 shadow-sm rounded-full mb-10 overflow-hidden relative group">
              <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
              <span className="relative text-[10px] font-black uppercase tracking-widest text-teal-600">Pendaftaran TA Semester Genap 2024 Dibuka</span>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h1 className="text-6xl md:text-8xl font-black text-teal-950 tracking-tighter leading-[0.9] mb-8">
                Pilih Dosen.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500 italic px-2">Masa Depan</span><br />
                Dimulai Sekarang.
              </h1>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <p className="max-w-2xl mx-auto text-teal-800/70 text-lg md:text-xl font-medium leading-relaxed mb-12">
                Platform ekosistem kampus modern. Dapatkan dosen pembimbing skripsi impian Anda secara adil, transparan, dan real-time.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              {user ? (
                <button 
                  onClick={() => navigate(user.role === 'ADMIN' ? "/admin" : "/dashboard")}
                  className="w-full sm:w-auto px-10 py-5 bg-teal-500 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-500/20 hover:bg-teal-600 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  Dashboard Saya <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button 
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-10 py-5 bg-teal-950 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-950/20 hover:bg-teal-900 hover:shadow-teal-950/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  Mulai Pemilihan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button className="w-full sm:w-auto px-10 py-5 bg-white text-teal-950 border border-teal-100 rounded-[1.25rem] font-black text-sm uppercase tracking-widest hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center justify-center gap-3">
                <Play className="w-4 h-4 text-teal-500" /> Lihat Panduan
              </button>
            </motion.div>
          </motion.div>

          {/* Social Proof Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 bg-white p-10 rounded-[2.5rem] border border-teal-50 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-20" />
            <div className="flex flex-col items-center justify-center relative">
              <span className="text-4xl lg:text-5xl font-black text-teal-950 tracking-tighter mb-2">2,500<span className="text-teal-500">+</span></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">Mahasiswa Aktif</span>
            </div>
            <div className="hidden md:block absolute left-1/3 top-1/2 -translate-y-1/2 w-px h-16 bg-teal-50" />
            <div className="flex flex-col items-center justify-center relative">
              <span className="text-4xl lg:text-5xl font-black text-teal-950 tracking-tighter mb-2">45<span className="text-orange-400">+</span></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">Dosen Ahli Tersedia</span>
            </div>
            <div className="hidden md:block absolute right-1/3 top-1/2 -translate-y-1/2 w-px h-16 bg-teal-50" />
            <div className="flex flex-col items-center justify-center relative">
              <span className="text-4xl lg:text-5xl font-black text-teal-950 tracking-tighter mb-2">100<span className="text-yellow-500">%</span></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">Transparansi Sistem</span>
            </div>

          </motion.div>
        </div>
      </section>

      {/* Categories / Steps Section */}
      <section className="py-32 px-6 flex flex-col items-center">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black text-teal-950 tracking-tighter mb-6">Bagaimana Cara Kerjanya?</h2>
            <p className="text-teal-800/60 font-medium text-lg max-w-2xl mx-auto">Tiga langkah struktural untuk mengamankan dosen pembimbing pilihan tim Anda.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: UserPlus, title: "1. Bentuk Kelompok", desc: "Buat atau bergabunglah dengan kelompok penelitian hingga maksimal 3 anggota. Sistem mengutamakan kerja tim." },
              { icon: Search, title: "2. Pantau Kuota", desc: "Periksa sisa kapasitas masing-masing dosen di dashboard secara live sebelum waktu pemilihan resmi dibuka." },
              { icon: Award, title: "3. War Dosen", desc: "Pastikan Anda login tepat waktu. Pilih dosen dengan sistem 'first come, first served' demi transparansi absolut." }
            ].map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, type: "spring", stiffness: 300, damping: 24 }}
                className="bg-white p-10 rounded-[2.5rem] border border-teal-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] hover:border-teal-100 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full translate-x-12 -translate-y-12 group-hover:bg-yellow-50/50 transition-colors duration-500" />
                <div className="w-16 h-16 bg-teal-50/50 rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10 text-teal-700">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-teal-950 mb-4 relative z-10">{step.title}</h3>
                <p className="text-teal-800/60 font-medium text-sm leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses / Experts Section */}
      <section className="py-32 px-6 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20"
          >
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-teal-950 tracking-tighter mb-6">Pakar Multi-Disiplin</h2>
              <p className="text-teal-800/60 font-medium text-lg">Pilih dari puluhan dosen berpengalaman dengan spesialisasi industri terkini untuk membimbing riset skripsi Anda.</p>
            </div>
            <button className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest hover:text-teal-700 transition-colors group px-6 py-3 rounded-full hover:bg-teal-50">
              Jelajahi Profil Dosen <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Artificial Intelligence", count: "12 Dosen Ahli", icon: Globe, color: "bg-yellow-50 text-yellow-500 border-yellow-100 hover:shadow-yellow-500/10" },
              { title: "Software Engineering", count: "15 Dosen Ahli", icon: Smartphone, color: "bg-teal-50 text-teal-500 border-teal-100 hover:shadow-teal-500/10" },
              { title: "Data Science & Big Data", count: "8 Dosen Ahli", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:shadow-emerald-500/10" },
              { title: "Cyber Sec & Networks", count: "10 Dosen Ahli", icon: Lock, color: "bg-amber-50 text-amber-600 border-amber-100 hover:shadow-amber-500/10" }
            ].map((cat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                className="p-8 rounded-[2rem] border border-slate-100 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all cursor-pointer group bg-white"
              >
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110", cat.color)}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-900 mb-2 group-hover:text-teal-500 transition-colors">{cat.title}</h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{cat.count}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="bg-teal-950 rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
          >
            {/* Dark mode abstract decor */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/20 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-400/20 blur-[100px] rounded-full -translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10 max-w-4xl mx-auto text-white flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.1] mb-8">
                Siap Melangkah Ke Tahap <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400">Berikutnya?</span>
              </h2>
              <p className="text-teal-100/70 text-lg md:text-xl font-medium mb-12 max-w-2xl">
                Amankan posisi Anda secepatnya. Gabung sekarang, lengkapi profil, bentuk tim, dan bersiaplah untuk War Dosen.
              </p>
              <button 
                onClick={() => navigate("/login")}
                className="px-12 py-6 bg-white text-teal-950 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-500 hover:text-white hover:scale-105 transition-all shadow-xl flex items-center gap-3 group"
              >
                PAPAN DASHBOARD <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-white border-t border-teal-50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-teal-950 tracking-tighter">WarDosen<span className="text-teal-500">.</span></span>
            </div>
            <p className="text-teal-800/60 text-sm font-medium">© 2026 University Academic System. All rights reserved.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-teal-800/40">
            <a href="#" className="hover:text-teal-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-teal-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-teal-500 transition-colors">Security</a>
            <a href="#" className="hover:text-teal-500 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (token: string, user: any) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        onLogin(event.data.token, event.data.user);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    try {
      const parentOrigin = encodeURIComponent(window.location.origin);
      const response = await fetch(`/api/auth/google/url?origin=${parentOrigin}`);
      if (!response.ok) {
        throw new Error('Gagal mendapatkan URL otentikasi Google');
      }
      const { url } = await response.json();
  
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) {
        alert('Tolong izinkan pop-up untuk situs ini agar bisa login dengan SSO.');
      }
    } catch (err: any) {
      console.error('OAuth error:', err);
      setError(err.message || "Gagal membuka SSO Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Terjadi kesalahan saat login.");
      }
      
      const data = await res.json();
      onLogin(data.token, data.user);
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        setError(err.message || "Username atau password salah.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0FAF8] relative overflow-hidden">
      {/* Decorative Gradients for modern esthetic */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/50 to-orange-200/50 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200/50 to-teal-200/50 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05),0_0_0_1px_rgba(255,255,255,0.7)] group hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.1),0_0_0_1px_rgba(255,255,255,1)] transition-all duration-500">
          <div className="text-center space-y-3 mb-10">
            <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ type: "spring", delay: 0.2 }}
               className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-teal-500/20 mx-auto mb-6"
            >
               <Lock className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black text-teal-950 tracking-tighter leading-tight">STUDENT <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500 italic">PORTAL</span></h1>
            <p className="text-teal-800/50 text-[10px] uppercase font-black tracking-[0.3em]">War Dosen Pembimbing v2.0</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2 relative"
            >
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">NIM / Username</label>
                <span className="text-[9px] text-teal-800/50 font-mono tracking-tighter bg-teal-50 px-2 py-0.5 rounded-md">18000101</span>
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#f8fdfc]/50 border border-teal-100 rounded-[1.25rem] px-5 py-4 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                placeholder="NIM Mahasiswa"
                required
              />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2 relative"
            >
              <div className="flex justify-between items-center px-2">
                <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">Password</label>
                <span className="text-[9px] text-teal-800/50 font-mono tracking-tighter bg-teal-50 px-2 py-0.5 rounded-md">mhs123</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#f8fdfc]/50 border border-teal-100 rounded-[1.25rem] px-5 py-4 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                  placeholder="Sandi Rahasia"
                  required
                />
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-rose-50/80 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold shadow-[0_4px_12px_rgba(225,29,72,0.05)]">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              type="submit"
              disabled={loading}
              className="w-full bg-teal-950 hover:bg-teal-500 text-white font-black text-xs uppercase tracking-[0.2em] py-5 px-6 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 group mt-4 relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              {loading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> MENGOTENTIKASI...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> MASUK KE PORTAL
                </>
              )}
            </motion.button>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 space-y-4"
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-teal-100/50"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-teal-800/40 font-black tracking-widest">ATAU</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-teal-100 hover:bg-teal-50 text-teal-950 font-black text-xs tracking-widest py-4 px-6 rounded-[1.25rem] transition-all duration-300 shadow-sm flex items-center justify-center gap-3 overflow-hidden"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              LOGIN SSO EMAIL UNESA
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="pt-8 mt-6 border-t border-teal-50 text-center"
          >
            <p className="text-[8px] font-black text-teal-800/30 uppercase tracking-[0.4em]">Integrated Academic System • 2026</p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ user: initialUser, token, onProfileUpdate }: { user: any; token: string; onProfileUpdate: (s: any) => void }) => {
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarActive, setIsWarActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [inviteNim, setInviteNim] = useState("");
  const [invitations, setInvitations] = useState<any[]>([]);
  const [teamNameForm, setTeamNameForm] = useState("");
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [confirmingDosen, setConfirmingDosen] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    nama: "",
    kontak: "",
    peminatan: "",
    bio: "",
    foto: ""
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      const auth = { headers: { "Authorization": `Bearer ${token}` } };
      const [meRes, invRes] = await Promise.all([
        fetch("/api/me", auth),
        fetch("/api/invitations", auth)
      ]);
      const data = await meRes.json();
      const invData = await invRes.json();
      if (meRes.ok) {
        setStudentData(data);
        onProfileUpdate(data);
        setProfileForm({
          nama: data.nama || "",
          kontak: data.kontak || "",
          peminatan: data.peminatan || "",
          bio: data.bio || "",
          foto: data.foto || ""
        });
      }
      if (invRes.ok) setInvitations(invData);
    } catch (err) {
      console.error("Failed to fetch student data", err);
    }
  };

  const handleAcceptInvite = async (id: string) => {
    setGroupLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/invitations/${id}/accept`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menerima undangan.");
      }
      setMessage({ type: 'success', text: "BERHASIL BERGABUNG KE KELOMPOK!" });
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setGroupLoading(false);
    }
  };

  const handleRejectInvite = async (id: string) => {
    setGroupLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/invitations/${id}/reject`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal menolak undangan.");
      }
      setMessage({ type: 'success', text: "UNDANGAN BERHASIL DIHAPUS." });
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setGroupLoading(false);
    }
  };

  const handleCancelDosen = async () => {
    setLoading(true);
    setMessage(null);
    try {
      console.log("Cancelling lecturer selection...");
      const res = await fetch("/api/war/cancel", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan pemilihan.");
      
      setMessage({ type: 'success', text: "PEMILIHAN DOSEN BERHASIL DIBATALKAN." });
      await Promise.all([fetchStudentData(), fetchDosen()]);
    } catch (err: any) {
      console.error("Cancel Error:", err);
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  const fetchDosen = async () => {
    const res = await fetch("/api/dosen");
    const data = await res.json();
    setDosenList(data);
  };

  const fetchConfig = async () => {
    const res = await fetch("/api/war-config");
    const data = await res.json();
    setConfig(data);
  };

  useEffect(() => {
    fetchDosen();
    fetchConfig();
    fetchStudentData();

    socket.on("quota_update", (updatedList) => {
      setDosenList(updatedList);
    });

    return () => {
      socket.off("quota_update");
    };
  }, []);

  useEffect(() => {
    if (!config) return;

    const timer = setInterval(() => {
      const start = new Date(config.startTime).getTime();
      const end = new Date(config.endTime).getTime();
      const now = new Date().getTime();

      if (now < start) {
        setTimeLeft(start - now);
        setIsWarActive(false);
      } else if (now < end) {
        setTimeLeft(0);
        setIsWarActive(true);
      } else {
        setTimeLeft(-1);
        setIsWarActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  const handleCreateGroup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!teamNameForm) {
      setMessage({ type: 'error', text: "NAMA KELOMPOK WAJIB DIISI!" });
      return;
    }
    setGroupLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/groups/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nama: teamNameForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat kelompok.");
      
      setMessage({ type: 'success', text: "KELOMPOK BERHASIL DIBUAT! SEKARANG ANDA ADALAH KETUA." });
      setTeamNameForm("");
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setGroupLoading(false);
    }
  };

  const handleRenameGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamNameForm) return;
    setGroupLoading(true);
    try {
      const res = await fetch("/api/groups/rename", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nama: teamNameForm })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengganti nama.");
      
      setMessage({ type: 'success', text: "NAMA KELOMPOK BERHASIL DIUBAH!" });
      setIsEditingTeam(false);
      setTeamNameForm("");
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setGroupLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteNim) return;
    setGroupLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/groups/invite", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ targetNim: inviteNim })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengundang mahasiswa.");
      
      setMessage({ type: 'success', text: `UNDANGAN BERHASIL DIKIRIM KE NIM ${inviteNim}.` });
      setInviteNim("");
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setGroupLoading(false);
    }
  };

  const handlePickDosen = async (dosenId: string) => {
    setConfirmingDosen(null);
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/war/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ dosenId }),
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memilih dosen.");
      }
      
      setMessage({ type: 'success', text: `BERHASIL! ANDA MENDAPATKAN ${data.lecturerName}.` });
      fetchDosen();
      fetchStudentData();
    } catch (err: any) {
      const errorMsg = err.name === "TypeError" ? "Koneksi terputus. Coba lagi." : err.message;
      setMessage({ type: 'error', text: errorMsg.toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      if (!res.ok) throw new Error("Gagal memperbarui profil.");
      setMessage({ type: 'success', text: "PROFIL BERHASIL DIPERBARUI!" });
      setIsProfileModalOpen(false);
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message.toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB Limit
        setMessage({ type: 'error', text: "UKURAN FOTO TERLALU BESAR (MAKS 1MB)" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm({ ...profileForm, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F0FAF8] pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Student Profile & Quick Stats Card */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-stretch">
          {/* Main User Card */}
          <div className="xl:col-span-1 bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-teal-950">
               <Users className="w-32 h-32" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="relative mb-4 group">
                <div className="w-24 h-24 rounded-[2rem] bg-teal-50 border-4 border-white shadow-xl overflow-hidden ring-1 ring-teal-100">
                  <img 
                    src={studentData?.foto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop" || undefined} 
                    className="w-full h-full object-cover"
                    alt={studentData?.nama}
                  />
                </div>
                <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="absolute -bottom-1 -right-1 p-2 bg-teal-500 text-white rounded-xl shadow-lg hover:bg-teal-950 transition-all"
                >
                  <Edit className="w-3 h-3" />
                </button>
              </div>
            <h2 className="text-xl font-black text-teal-950 tracking-tighter uppercase leading-tight mb-2">{studentData?.nama || "Mahasiswa"}</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-teal-50">
              <div className="text-center">
                <p className="text-[8px] font-black text-teal-800/50 uppercase tracking-widest mb-1">NOMOR INDUK MHS</p>
                <p className="text-xl font-mono font-black text-teal-950">{studentData?.nim || "-----"}</p>
              </div>
            </div>
          </div>

          {/* Main Info */}
          <div className="xl:col-span-2 bg-white border border-teal-50 rounded-[2.5rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-orange-400 to-teal-500"></div>
            
            <div className="space-y-1 relative z-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 mb-2 flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                 Live War System
              </h2>
              <h1 className="text-5xl font-black text-teal-950 tracking-tighter leading-none mb-2">
                Dosen <span className="text-teal-500 italic">War</span>
              </h1>
              <p className="text-teal-800/60 text-sm font-medium pr-12">Portal resmi perebutan kuota pembimbing skripsi. Pastikan tim Anda sudah lengkap sebelum masa pemilihan dibuka.</p>
            </div>
            
            <div className="h-20 w-px bg-teal-50 hidden md:block"></div>
            
            <div className="text-center md:text-right relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-teal-800/50 mb-2 font-black">Server Countdown</p>
              <span className={cn(
                "text-5xl font-mono font-black tabular-nums tracking-tighter block leading-none",
                !isWarActive && timeLeft > 0 ? "text-teal-500" : "text-emerald-500"
              )}>
                {timeLeft === -1 ? "OVER" : isWarActive ? "LIVE" : formatCountdown(timeLeft)}
              </span>
              <div className="flex items-center gap-2 justify-center md:justify-end mt-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-bold text-emerald-600 font-mono tracking-widest uppercase">System Online</span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 bg-teal-500 rounded-[2.5rem] p-8 shadow-xl shadow-teal-100 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 opacity-10">
                <Info className="w-32 h-32" />
             </div>
             <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-teal-200">Panduan Cepat</h4>
                <div className="space-y-4">
                   <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">1</div>
                      <p className="text-xs font-bold leading-tight">Bentuk kelompok (Maks. 3 orang) untuk membuka akses pemilihan.</p>
                   </div>
                   <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">2</div>
                      <p className="text-xs font-bold leading-tight">Pilih dosen saat status server berubah menjadi "LIVE".</p>
                   </div>
                </div>
             </div>
             <button 
               onClick={() => setIsProfileModalOpen(true)}
               className="w-full mt-6 py-3 bg-white text-teal-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
             >
               Profile Settings
             </button>
          </div>
        </div>

          {/* Group Status Feature */}
          <div className="lg:col-span-1">
            {studentData?.kelompok ? (
              <div className="bg-teal-950 rounded-[2.5rem] p-8 shadow-xl text-white h-full flex flex-col justify-between border border-teal-900">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-teal-400 mb-1">Group Details</h3>
                    {isEditingTeam ? (
                      <form onSubmit={handleRenameGroup} className="flex items-center gap-2 mt-1">
                        <input 
                          autoFocus
                          value={teamNameForm}
                          onChange={e => setTeamNameForm(e.target.value)}
                          placeholder="Nama Kelompok..."
                          className="bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-teal-500 w-32"
                        />
                        <button type="submit" className="p-1 bg-teal-500 rounded-lg"><CheckCircle2 className="w-4 h-4" /></button>
                        <button type="button" onClick={() => { setIsEditingTeam(false); setTeamNameForm(""); }} className="p-1 bg-teal-800 rounded-lg"><XCircle className="w-4 h-4" /></button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 group/title">
                        <p className="text-xl font-bold italic truncate max-w-[150px]">
                          {studentData.kelompok.nama || `Group #${studentData.kelompok.id.substring(0,5)}`}
                        </p>
                        {studentData.isLeader && (
                          <button 
                            onClick={() => { setIsEditingTeam(true); setTeamNameForm(studentData.kelompok.nama || ""); }}
                            className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1 hover:text-teal-400"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-teal-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-teal-500/20">
                    {studentData.isLeader ? "Leader" : "Member"}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {studentData.kelompok.mahasiswa.map((m: any) => (
                      <div key={m.id} className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2 rounded-2xl relative group">
                        <div className="relative">
                           <div className="w-10 h-10 rounded-xl bg-teal-900 border border-white/10 overflow-hidden">
                              <img 
                                src={m.foto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop" || undefined} 
                                alt={m.nama} 
                                className="w-full h-full object-cover"
                              />
                           </div>
                           <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-teal-950", m.isLeader ? "bg-teal-400" : "bg-teal-700")} />
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-white/90 truncate max-w-[80px]">{m.nama?.split(' ')[0] || "Student"}</span>
                           <span className="text-[8px] font-bold font-mono text-white/40">{m.nim}</span>
                        </div>
                      </div>
                    ))}
                    {studentData.kelompok.mahasiswa.length < 3 && studentData.isLeader && (
                      <form onSubmit={handleInvite} className="flex-1 min-w-[120px]">
                        <input 
                          value={inviteNim}
                          onChange={e => setInviteNim(e.target.value)}
                          placeholder="Invite NIM..."
                          className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-[10px] font-bold placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </form>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-black uppercase text-teal-800/60 mb-2">Selected Prof</p>
                    {studentData.kelompok.dosen ? (
                       <div className="space-y-2">
                         <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-2xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-emerald-400">{studentData.kelompok.dosen.nama}</span>
                         </div>
                         {isWarActive && studentData.isLeader && (
                           <button 
                            type="button"
                            onClick={handleCancelDosen}
                            disabled={loading}
                            className={cn(
                               "w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 text-rose-500 hover:text-white text-[10px] font-black uppercase rounded-xl transition-all cursor-pointer shadow-sm relative z-10",
                               loading && "opacity-50 cursor-wait"
                            )}
                           >
                             <RefreshCcw className={cn("w-3 h-3", loading && "animate-spin")} /> 
                             {loading ? "MEMBATALKAN..." : "Batalkan Pilihan"}
                           </button>
                         )}
                       </div>
                    ) : (
                       <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                          <span className="text-xs font-bold text-rose-400 italic">Belum Memilih Dosen</span>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border-2 border-dashed border-teal-100 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-16 h-16 bg-teal-50 rounded-3xl flex items-center justify-center text-teal-200">
                    <Users className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-teal-950 uppercase tracking-tighter">Kelompok Belum Siap</h3>
                    <p className="text-xs text-teal-800/50 font-medium px-4 mb-4">Pilih nama tim yang keren dan mulai perebutan dosen!</p>
                    <form onSubmit={handleCreateGroup} className="space-y-4 px-4">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black uppercase text-teal-800/50 ml-1">Nama Kelompok</label>
                        <input 
                          value={teamNameForm}
                          onChange={e => setTeamNameForm(e.target.value)}
                          placeholder="Contoh: Tim Sukses Skripsi"
                          className="w-full p-3 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-2 focus:ring-teal-500/20"
                          required
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={groupLoading}
                        className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-100 hover:bg-teal-950 transition-all flex items-center justify-center gap-2"
                      >
                        {groupLoading ? "PROSES..." : <><Plus className="w-4 h-4" /> Create Named Team</>}
                      </button>
                    </form>
                  </div>
                </div>

                {invitations.length > 0 && (
                  <div className="bg-white border border-teal-100 rounded-[2.5rem] p-8 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                      <div className="px-2 py-1 bg-amber-100 text-amber-700 text-[8px] font-black uppercase rounded-lg animate-bounce">
                        PENDING
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black uppercase text-teal-500 tracking-widest flex items-center gap-2">
                       <UserPlus className="w-3 h-3" /> Undangan Masuk ({invitations.length})
                    </h4>
                    <div className="space-y-3">
                       {invitations.map(inv => (
                         <div key={inv.id} className="flex items-center justify-between p-4 bg-[#F0FAF8] rounded-2xl border border-teal-50 group hover:border-teal-200 transition-all">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-teal-500 border shadow-sm group-hover:bg-teal-500 group-hover:text-white transition-all">
                                {inv.from.nama[0]}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-teal-950">{inv.from.nama}</p>
                                <p className="text-[9px] font-mono text-teal-800/50">NIM: {inv.from.nim}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <button 
                               onClick={() => handleRejectInvite(inv.id)}
                               disabled={groupLoading}
                               className="p-2.5 bg-white border border-teal-50 text-teal-800/40 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                               title="Tolak Undangan"
                             >
                               <XCircle className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleAcceptInvite(inv.id)}
                               disabled={groupLoading}
                               className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-950 transition-all shadow-md shadow-emerald-100"
                             >
                               Terima
                             </button>
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm shadow-sm",
              message.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message.text}
          </motion.div>
        )}

        {/* Content Section Divider */}
        <div className="flex items-center gap-4 py-4">
           <div className="h-px bg-teal-100 flex-1"></div>
           <span className="text-[10px] font-black uppercase text-teal-800/50 tracking-[0.5em]">List Database Dosen</span>
           <div className="h-px bg-teal-100 flex-1"></div>
        </div>

        {/* Lecturers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dosenList.map((dosen) => (
            <motion.div
              key={dosen.id}
              whileHover={{ scale: 1.02 }}
              className="bg-white border border-teal-50 rounded-[2.5rem] p-7 flex flex-col shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
            >
              {/* Ticket Notch Effects */}
              <div className="absolute top-1/2 -left-3 w-6 h-6 bg-[#F0FAF8] rounded-full border border-teal-50"></div>
              <div className="absolute top-1/2 -right-3 w-6 h-6 bg-[#F0FAF8] rounded-full border border-teal-50"></div>

              <div className="flex items-start gap-5 mb-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex-shrink-0 border border-teal-100 flex items-center justify-center overflow-hidden shadow-inner">
                  {dosen.foto ? (
                    <img src={dosen.foto || undefined} alt={dosen.nama} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                  ) : (
                    <Users className="w-8 h-8 text-teal-200" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-extrabold text-lg leading-tight text-teal-950 group-hover:text-teal-500 transition-colors uppercase tracking-tighter">{dosen.nama}</h3>
                  <div className="mt-1.5 inline-block px-2.5 py-1 bg-teal-50 rounded-lg">
                    <p className="text-[9px] text-teal-500 uppercase tracking-widest font-black">NIP. {dosen.nip}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 flex-1 relative">
                <div className="p-5 bg-teal-50/50 rounded-3xl border border-dashed border-teal-100 group-hover:bg-teal-50/80 transition-colors">
                  <p className="text-[9px] text-teal-800/50 uppercase mb-2 tracking-widest font-black">Informasi Akademik</p>
                  <p className="text-xs leading-relaxed font-bold text-teal-950">
                    Dosen Pembimbing Akademik dengan Nomor Induk Pegawai {dosen.nip}.
                  </p>
                </div>

                <div className="space-y-3 px-1">
                  <div className="flex justify-between text-[10px] uppercase font-black text-teal-800/50 tracking-wider">
                    <span>Availability Quota</span>
                    <span className={cn(
                      "font-mono text-sm",
                      (dosen.kuotaMax - dosen._count.kelompok) > 0 ? "text-teal-950" : "text-orange-500"
                    )}>
                      {dosen.kuotaMax - dosen._count.kelompok} <span className="text-[10px] text-teal-800/30">LEFT</span>
                    </span>
                  </div>
                  <div className="w-full h-3 bg-teal-50 rounded-full overflow-hidden shadow-inner p-0.5">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000 rounded-full shadow-sm",
                        (dosen.kuotaMax - dosen._count.kelompok) > 0 ? "bg-gradient-to-r from-teal-500 to-yellow-500" : "bg-orange-400"
                      )}
                      style={{ width: `${(dosen._count.kelompok / dosen.kuotaMax) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setConfirmingDosen(dosen)}
                disabled={!isWarActive || (dosen.kuotaMax - dosen._count.kelompok) <= 0 || loading || !studentData?.kelompok || (!studentData.isLeader)}
                className={cn(
                  "w-full mt-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg",
                  isWarActive && (dosen.kuotaMax - dosen._count.kelompok) > 0 && studentData?.isLeader && !studentData.kelompok.dosenId
                    ? "bg-teal-500 text-white hover:bg-teal-950 shadow-teal-100 hover:shadow-teal-200 translate-y-0 active:translate-y-1"
                    : "bg-[#f8fdfc] text-teal-800/30 cursor-not-allowed shadow-none"
                )}
              >
                {loading ? "PROCESSING..." : 
                 !studentData?.kelompok ? "BUAT KELOMPOK DULU" :
                 !studentData.isLeader ? "HANYA KETUA" :
                 studentData.kelompok.dosenId ? "SUDAH MEMILIH" :
                 !isWarActive ? "WAITING FOR WAR" : 
                 (dosen.kuotaMax - dosen._count.kelompok) <= 0 ? "SOLD OUT" : "TAKE SLOTS"}
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {confirmingDosen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmingDosen(null)}
              className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-teal-950">
                <GraduationCap className="w-32 h-32" />
              </div>

              <div className="relative space-y-6">
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 mb-6">
                  <Info className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">Konfirmasi Pemilihan</h3>
                  <h2 className="text-2xl font-black text-teal-950 leading-tight">
                    Pilih {confirmingDosen.nama} sebagai Pembimbing?
                  </h2>
                </div>

                <p className="text-sm text-teal-800/60 font-medium leading-relaxed">
                  Tindakan ini akan mengunci kuota dosen tersebut untuk kelompok Anda. Pastikan pilihan Anda sudah tepat sebelum melanjutkan.
                </p>

                <div className="flex flex-col gap-3 pt-4">
                  <button
                    onClick={() => handlePickDosen(confirmingDosen.id)}
                    className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-100 hover:bg-teal-950 transition-all flex items-center justify-center gap-2"
                  >
                    YA, SAYA YAKIN
                  </button>
                  <button
                    onClick={() => setConfirmingDosen(null)}
                    className="w-full py-4 bg-[#f8fdfc] text-teal-800/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-50 transition-all"
                  >
                    BATALKAN
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="relative space-y-8">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">Account Settings</h3>
                    <h2 className="text-2xl font-black text-teal-950 tracking-tighter">Kustomisasi Profil</h2>
                  </div>
                  <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-teal-50 rounded-xl transition-all">
                    <XCircle className="w-6 h-6 text-teal-200" />
                  </button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center gap-4 py-4 bg-teal-50/50 border border-dashed border-teal-100 rounded-[2rem]">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-3xl bg-white border-2 border-teal-50 overflow-hidden shadow-inner">
                        <img 
                          src={profileForm.foto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop" || undefined} 
                          className="w-full h-full object-cover"
                          alt="Preview"
                        />
                      </div>
                      <label 
                        htmlFor="photo-upload" 
                        className="absolute inset-0 flex items-center justify-center bg-teal-950/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl"
                      >
                        <Camera className="w-6 h-6 text-white" />
                      </label>
                      <input 
                        id="photo-upload"
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase text-teal-500 tracking-widest">Upload Profile Photo</p>
                      <p className="text-[8px] text-teal-800/40 font-bold italic mt-1">JPEG/PNG, Maks 1MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Nama Lengkap</label>
                      <input 
                        value={profileForm.nama}
                        onChange={e => setProfileForm({...profileForm, nama: e.target.value})}
                        className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Link / Nomor Kontak</label>
                      <input 
                        value={profileForm.kontak}
                        onChange={e => setProfileForm({...profileForm, kontak: e.target.value})}
                        className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                        placeholder="WhatsApp / Telegram / Email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">URL Foto Profil (Optional)</label>
                    <input 
                      value={profileForm.foto.startsWith('data:') ? 'Image Uploaded' : profileForm.foto}
                      onChange={e => setProfileForm({...profileForm, foto: e.target.value})}
                      disabled={profileForm.foto.startsWith('data:')}
                      className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none disabled:opacity-50"
                      placeholder="https://images.unsplash.com/..."
                    />
                    {profileForm.foto.startsWith('data:') && (
                      <button 
                        type="button"
                        onClick={() => setProfileForm({...profileForm, foto: ""})}
                        className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-1 hover:underline"
                      >
                        Reset to URL/Default
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Bio Singkat</label>
                    <textarea 
                      value={profileForm.bio}
                      onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                      className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none min-h-[100px]"
                      placeholder="Ceritakan sedikit tentang ketertarikan riset Anda..."
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
                  >
                    {loading ? "MENYIMPAN..." : <><Save className="w-4 h-4" /> Simpan Perubahan</>}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminDashboard = ({ token, currentUser, onUserUpdate }: { token: string, currentUser: any, onUserUpdate: (user: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'dosen' | 'students' | 'settings' | 'admin_profile'>('monitoring');
  const [reports, setReports] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Forms State
  const [dosenForm, setDosenForm] = useState({ id: '', nama: '', nip: '', kuotaMax: 3, foto: '' });
  const [studentForm, setStudentForm] = useState({ id: '', nim: '', nama: '', kontak: '', password: '' });
  const [configForm, setConfigForm] = useState({ startTime: '', endTime: '' });
  const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
  const [deleteData, setDeleteData] = useState<{ type: 'dosen' | 'mahasiswa', id: string, name: string } | null>(null);

  const fetchData = async () => {
    try {
      const auth = { headers: { "Authorization": `Bearer ${token}` } };
      
      const [repRes, stuRes, confRes] = await Promise.all([
        fetch("/api/admin/reports", auth),
        fetch("/api/admin/mahasiswa", auth),
        fetch("/api/war-config")
      ]);
      
      const repData = await repRes.json();
      const stuData = await stuRes.json();
      const confData = await confRes.json();
      
      if (repRes.ok) setReports(repData);
      if (stuRes.ok) setStudents(stuData);
      if (confRes.ok && confData) {
        setConfig(confData);
        setConfigForm({
          startTime: new Date(confData.startTime).toISOString().slice(0, 16),
          endTime: new Date(confData.endTime).toISOString().slice(0, 16)
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    socket.on("quota_update", () => fetchData());
    return () => { socket.off("quota_update"); };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setMessage(null);

    try {
      // Compress image before upload using Canvas to avoid Nginx 1MB limits
      const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 800;
             const MAX_HEIGHT = 800;
             let width = img.width;
             let height = img.height;
             
             if (width > height) {
               if (width > MAX_WIDTH) {
                 height *= MAX_WIDTH / width;
                 width = MAX_WIDTH;
               }
             } else {
               if (height > MAX_HEIGHT) {
                 width *= MAX_HEIGHT / height;
                 height = MAX_HEIGHT;
               }
             }
             
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             ctx?.drawImage(img, 0, 0, width, height);
             canvas.toBlob((blob) => {
               if (blob) resolve(blob);
               else reject(new Error("Gagal kompresi"));
             }, 'image/jpeg', 0.8);
          };
          img.onerror = () => reject(new Error("File tidak dapat dibaca"));
        });
      };

      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(res.status === 413 ? "Ukuran file terlalu besar." : "Terjadi kesalahan pada server saat mengunggah foto.");
      }
      
      if (!res.ok) throw new Error(data?.error || "Gagal mengupload foto.");
      
      setDosenForm({ ...dosenForm, foto: data.url });
      setMessage({ type: 'success', text: "Foto berhasil diupload!" });
    } catch (err: any) {
      if (err.message.includes("Failed to fetch")) {
        setMessage({ type: 'error', text: "Koneksi terputus. Server mungkin sibuk." });
      } else {
        setMessage({ type: 'error', text: err.message });
      }
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDosenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const isEdit = !!dosenForm.id;
      const url = isEdit ? `/api/admin/dosen/${dosenForm.id}` : "/api/admin/dosen";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(dosenForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data dosen.");
      
      setMessage({ type: 'success', text: "Data dosen berhasil disimpan!" });
      setDosenForm({ id: '', nama: '', nip: '', kuotaMax: 3, foto: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const isEdit = !!studentForm.id;
      const url = isEdit ? `/api/admin/mahasiswa/${studentForm.id}` : "/api/admin/mahasiswa";
      
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(studentForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isEdit ? "Gagal mengubah mahasiswa." : "Gagal mendaftarkan mahasiswa."));

      setMessage({ type: 'success', text: isEdit ? "Data mahasiswa berhasil diubah!" : "Mahasiswa berhasil didaftarkan!" });
      setStudentForm({ id: '', nim: '', nama: '', kontak: '', password: '' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async () => {
    if (!deleteData) return;
    const { type, id } = deleteData;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus data.");

      setMessage({ type: 'success', text: `${type === 'dosen' ? 'Dosen' : 'Mahasiswa'} berhasil dihapus.` });
      setDeleteData(null);
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ["Nama Dosen", "NIP", "Kuota", "Okupansi", "NIM Ketua", "Nama Ketua"];
    const rows = reports.flatMap(dosen => {
      if (dosen.kelompok.length === 0) {
        return [[dosen.nama, dosen.nip, dosen.kuotaMax, 0, "-", "-"]];
      }
      return dosen.kelompok.map((k: any) => {
        const leader = k.mahasiswa.find((m: any) => m.isLeader);
        return [
          dosen.nama,
          dosen.nip,
          dosen.kuotaMax,
          dosen.kelompok.length,
          leader?.nim || "N/A",
          leader?.nama || "Unknown"
        ];
      });
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_WarDosen_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch("/api/admin/war-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(configForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui jadwal.");

      setMessage({ type: 'success', text: "Jadwal war berhasil diperbarui!" });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: "Password minimal 6 karakter." });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: "Konfirmasi password tidak cocok." });
      return;
    }
    
    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ newPassword: passwordForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengganti password.");
      
      setMessage({ type: 'success', text: "Password berhasil diganti!" });
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    setMessage(null);

    try {
      const compressImage = (file: File): Promise<Blob> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          img.onload = () => {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 400;
             const MAX_HEIGHT = 400;
             let width = img.width;
             let height = img.height;
             
             if (width > height) {
               if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
             } else {
               if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
             }
             
             canvas.width = width;
             canvas.height = height;
             const ctx = canvas.getContext('2d');
             ctx?.drawImage(img, 0, 0, width, height);
             canvas.toBlob((blob) => {
               if (blob) resolve(blob);
               else reject(new Error("Gagal kompresi"));
             }, 'image/jpeg', 0.8);
          };
          img.onerror = () => reject(new Error("File tidak dapat dibaca"));
        });
      };

      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append("photo", compressedBlob, file.name.replace(/\.[^/.]+$/, "") + ".jpg");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });
      
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(res.status === 413 ? "Ukuran file terlalu besar." : "Terjadi kesalahan server saat mengunggah foto.");
      }
      
      if (!res.ok) throw new Error(data?.error || "Gagal mengupload foto.");
      
      const profileRes = await fetch("/api/admin/profile-foto", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ foto: data.url })
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok) throw new Error(profileData.error || "Gagal memperbarui foto profil.");

      onUserUpdate({ foto: data.url });
      setMessage({ type: 'success', text: "Foto profil berhasil diperbarui!" });
    } catch (err: any) {
      if (err.message.includes("Failed to fetch")) {
        setMessage({ type: 'error', text: "Koneksi terputus. Server mungkin sibuk." });
      } else {
        setMessage({ type: 'error', text: err.message });
      }
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FAF8] pb-24 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50 to-transparent pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-6 pt-24">
        {/* Header Admin */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-teal-950 rounded-[3rem] p-10 shadow-2xl shadow-teal-500/10 text-white relative overflow-hidden border border-teal-900"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-400/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3" />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10 shrink-0">
             <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] shrink-0">
                <Settings className="w-8 h-8 text-white" />
             </div>
             <div>
                <h2 className="text-[10px] font-black uppercase tracking-[1em] text-teal-400 mb-2">Control Room</h2>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400 italic pr-2">Dashboard</span></h1>
             </div>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 p-2 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/5 relative z-10 w-full xl:w-auto">
             {[
               { id: 'monitoring', label: 'Monitor', icon: Timer },
               { id: 'dosen', label: 'Dosen', icon: Users },
               { id: 'students', label: 'Mahasiswa', icon: UserPlus },
               { id: 'settings', label: 'Jadwal', icon: Calendar },
               { id: 'admin_profile', label: 'Profil', icon: Settings }
             ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
                 className={cn(
                   "flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                   activeTab === tab.id ? "bg-white text-teal-950 shadow-lg scale-105" : "text-teal-400 hover:text-white hover:bg-white/5"
                 )}
               >
                 <tab.icon className="w-4 h-4" />
                 {tab.label}
               </button>
             ))}
          </div>
        </motion.div>

        {message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className={cn(
              "px-6 py-5 rounded-[2rem] flex items-center justify-center gap-3 font-bold text-sm shadow-sm border",
              message.type === 'success' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-rose-50 text-rose-700 border-rose-100"
            )}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            {message.text.toUpperCase()}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === 'monitoring' && (
            <motion.div key="monitoring" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
              <div className="bg-white border border-teal-50 rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="p-8 md:p-10 border-b border-teal-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#f8fdfc]">
                   <div>
                      <h3 className="text-2xl font-black text-teal-950 tracking-tight mb-2">Status Quota Real-time</h3>
                      <p className="text-sm text-teal-800/60 font-medium">Monitoring keterisian dospem oleh mahasiswa.</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <button 
                       onClick={exportToCSV}
                       className="flex items-center gap-2 px-5 py-3 bg-white border border-teal-100 rounded-2xl text-[10px] font-black text-teal-800 hover:bg-teal-50 hover:border-teal-200 transition-all uppercase tracking-widest shadow-sm group"
                     >
                       <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> Export CSV
                     </button>
                     <div className="flex items-center gap-2 text-teal-500 text-xs font-black bg-teal-50 px-5 py-3 rounded-2xl border border-teal-100 shadow-sm shadow-teal-100">
                        <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                        LIVE UPDATE
                     </div>
                   </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8fdfc] border-b border-teal-50">
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">Dosen</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-teal-800/40 tracking-widest text-center">Okupansi</th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">Kelompok</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-50">
                      {reports.map((dosen, i) => (
                        <tr key={dosen.id} className="hover:bg-[#f8fdfc] transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-teal-50 overflow-hidden border border-teal-100 shadow-inner group-hover:scale-110 transition-transform">
                                {dosen.foto ? (
                                  <img src={dosen.foto || undefined} className="w-full h-full object-cover" />
                                ) : (
                                  <GraduationCap className="w-6 h-6 text-teal-300 mx-auto mt-4" />
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-teal-950 text-lg block mb-1 group-hover:text-teal-500 transition-colors">{dosen.nama}</span>
                                <span className="text-[10px] font-black uppercase text-teal-800/60 tracking-widest bg-teal-50/50 px-2 py-0.5 rounded-md">NIP. {dosen.nip}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col items-center">
                               <span className="text-sm font-mono font-black mb-2 text-teal-800">{dosen.kelompok.length} / {dosen.kuotaMax}</span>
                               <div className="w-32 h-2.5 bg-teal-50 rounded-full overflow-hidden shadow-inner p-0.5">
                                 <div 
                                    className={cn(
                                       "h-full rounded-full transition-all duration-1000 ease-out",
                                       (dosen.kelompok.length / dosen.kuotaMax) >= 1 ? "bg-orange-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" : "bg-teal-500 shadow-[0_0_8px_rgba(79,70,229,0.4)]"
                                    )} 
                                    style={{ width: `${(dosen.kelompok.length / dosen.kuotaMax) * 100}%` }} 
                                 />
                               </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-2">
                              {dosen.kelompok.length > 0 ? (
                                dosen.kelompok.map((k: any) => {
                                  const leader = k.mahasiswa.find((m: any) => m.isLeader);
                                  return (
                                    <div 
                                      key={k.id} 
                                      className="flex flex-col px-4 py-2.5 bg-white border border-teal-100 rounded-xl shadow-sm hover:border-teal-200 hover:shadow-teal-100 transition-all cursor-default group/group"
                                    >
                                      <span className="text-[10px] font-black text-teal-800/40 uppercase tracking-widest mb-0.5">
                                        NIM: <span className="text-teal-800 text-xs">{leader?.nim || "N/A"}</span>
                                      </span>
                                      <span className="text-[11px] font-bold text-teal-600 truncate max-w-[120px] group-hover/group:text-teal-700">
                                        {leader?.nama || "Unknown"}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-[10px] font-black text-teal-800/30 uppercase tracking-widest px-4 py-2 border border-dashed border-teal-100 rounded-xl bg-teal-50/50">Belum Ada Kelompok</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'dosen' && (
            <motion.div key="dosen" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1">
                <div className="bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sticky top-28">
                   <h3 className="text-2xl font-black text-teal-950 mb-8 flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500">
                        {dosenForm.id ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                      {dosenForm.id ? "Edit Dosen" : "Tambah Dosen"}
                   </h3>
                   <form onSubmit={handleDosenSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Nama Lengkap</label>
                        <input value={dosenForm.nama} onChange={e => setDosenForm({...dosenForm, nama: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">NIP Dosen</label>
                        <input value={dosenForm.nip} onChange={e => setDosenForm({...dosenForm, nip: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Kapasitas (Kuota)</label>
                        <input type="number" value={dosenForm.kuotaMax || ''} onChange={e => setDosenForm({...dosenForm, kuotaMax: parseInt(e.target.value) || 0})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Foto Profil</label>
                        <div className="flex flex-col gap-4">
                          {dosenForm.foto && (
                            <div className="relative w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 border-teal-100 shadow-sm shadow-teal-100 group">
                              <img src={dosenForm.foto || undefined} className="w-full h-full object-cover" />
                              <button 
                                type="button" 
                                onClick={() => setDosenForm({ ...dosenForm, foto: '' })}
                                className="absolute inset-0 bg-rose-500/80 backdrop-blur-sm text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-[8px] font-black tracking-widest uppercase">Hapus</span>
                              </button>
                            </div>
                          )}
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleFileUpload} 
                              className="hidden" 
                              id="lecturer-photo-upload" 
                              disabled={uploadLoading}
                            />
                            <label 
                              htmlFor="lecturer-photo-upload"
                              className={cn(
                                "flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all",
                                uploadLoading ? "bg-teal-50/50 border-teal-100 text-teal-800/30" : "bg-teal-50/50 border-teal-200 text-teal-500 hover:bg-teal-100"
                              )}
                            >
                              {uploadLoading ? "MENGUPLOAD..." : <><Camera className="w-4 h-4" /> {dosenForm.foto ? "Ganti Foto" : "Pilih dari Perangkat"}</>}
                            </label>
                          </div>
                          <div className="flex items-center gap-3 px-2">
                             <div className="h-px flex-1 bg-teal-100" />
                             <span className="text-[9px] font-black text-teal-800/40 uppercase tracking-widest">Atau URL</span>
                             <div className="h-px flex-1 bg-teal-100" />
                          </div>
                          <input 
                            placeholder="https://..."
                            value={dosenForm.foto} 
                            onChange={e => setDosenForm({...dosenForm, foto: e.target.value})} 
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-[10px] font-mono focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" 
                          />
                        </div>
                      </div>
                      <button type="submit" className="w-full py-5 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/10 hover:bg-teal-950 transition-all flex items-center justify-center gap-2 mt-4 group">
                        <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> {dosenForm.id ? "SIMPAN PERUBAHAN" : "TAMBAH DOSEN"}
                      </button>
                      {dosenForm.id && (
                        <button type="button" onClick={() => setDosenForm({ id: '', nama: '', nip: '', kuotaMax: 3, foto: '' })} className="w-full text-[10px] font-black text-teal-800/40 hover:text-rose-500 tracking-widest uppercase transition-colors">Batal Edit</button>
                      )}
                   </form>
                </div>
              </div>
              <div className="xl:col-span-2">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reports.map((dosen, i) => (
                      <motion.div 
                        key={dosen.id} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white p-6 rounded-[2.5rem] border border-teal-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] hover:border-teal-100 transition-all flex items-center justify-between group"
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-teal-50 overflow-hidden border border-teal-100 shadow-inner group-hover:scale-110 transition-transform">
                               {dosen.foto ? (
                                 <img src={dosen.foto || undefined} className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center">
                                   <Users className="w-8 h-8 text-teal-200" />
                                 </div>
                               )}
                            </div>
                            <div>
                               <p className="font-extrabold text-teal-950 leading-tight text-lg mb-1">{dosen.nama}</p>
                               <span className="text-[9px] font-black uppercase text-teal-800/50 tracking-widest bg-teal-50/50 px-2 py-0.5 rounded-md">NIP. {dosen.nip}</span>
                            </div>
                         </div>
                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setDosenForm({ id: dosen.id, nama: dosen.nama, nip: dosen.nip, kuotaMax: dosen.kuotaMax, foto: dosen.foto || '' })} className="p-3 bg-[#f8fdfc] text-teal-800/40 hover:bg-teal-50 hover:text-teal-500 border border-transparent hover:border-teal-100 rounded-xl transition-all shadow-sm">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteData({ type: 'dosen', id: dosen.id, name: dosen.nama })} className="p-3 bg-[#f8fdfc] text-teal-800/40 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl transition-all shadow-sm">
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div key="students" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", stiffness: 200, damping: 25 }} className="space-y-8">
               <div className="bg-white border border-teal-50 rounded-[3rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-teal-50 rounded-[1.25rem] flex items-center justify-center text-teal-500">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-teal-950 tracking-tight">{studentForm.id ? "Edit Mahasiswa" : "Registrasi Mahasiswa Baru"}</h3>
                      <p className="text-sm text-teal-800/60 font-medium">{studentForm.id ? "Perbarui informasi mahasiswa." : "Buat akun untuk mahasiswa sebelum mereka bisa login."}</p>
                    </div>
                  </div>
                  <form onSubmit={handleStudentSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">NIM (Username)</label>
                        <input value={studentForm.nim} onChange={e => setStudentForm({...studentForm, nim: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" placeholder="18000101" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Nama Lengkap</label>
                        <input value={studentForm.nama} onChange={e => setStudentForm({...studentForm, nama: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" placeholder="Budi Santoso" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">No. HP Aktif</label>
                        <input value={studentForm.kontak} onChange={e => setStudentForm({...studentForm, kontak: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" placeholder="0812..." required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Password</label>
                        <input type="password" value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" placeholder="••••••••" required={!studentForm.id} />
                     </div>
                     <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-4">
                        {studentForm.id && (
                          <button type="button" onClick={() => setStudentForm({ id: '', nim: '', nama: '', kontak: '', password: '' })} className="px-8 py-4 bg-teal-50 text-teal-600 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all">
                             Batal
                          </button>
                        )}
                        <button type="submit" className="px-10 py-4 bg-teal-500 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/10 hover:bg-teal-950 transition-all group flex items-center gap-3">
                           <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" /> {studentForm.id ? "Simpan Perubahan" : "Daftarkan Mahasiswa"}
                        </button>
                     </div>
                  </form>
               </div>

               <div className="bg-white border border-teal-50 rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                  <div className="p-8 md:p-10 border-b border-teal-50 flex justify-between items-center bg-[#f8fdfc]">
                     <h4 className="font-extrabold text-teal-950 uppercase text-xs tracking-widest flex items-center gap-2">
                       <Users className="w-4 h-4 text-teal-500" /> Database Mahasiswa
                     </h4>
                     <span className="px-4 py-2 bg-teal-950 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                       {students.length} TERDAFTAR
                     </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f8fdfc] border-b border-teal-50 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">
                           <th className="px-10 py-6">Mahasiswa</th>
                           <th className="px-10 py-6">NIM</th>
                           <th className="px-10 py-6">Status Kelompok</th>
                           <th className="px-10 py-6 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-50">
                        {students.map((std, i) => (
                          <motion.tr 
                            key={std.id} 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.05 }}
                            className="hover:bg-[#f8fdfc] transition-colors group"
                          >
                             <td className="px-10 py-5 font-extrabold text-teal-950 text-sm group-hover:text-teal-500 transition-colors">{std.nama}</td>
                             <td className="px-10 py-5 text-xs text-teal-800/60 font-black font-mono tracking-tighter">
                               <span className="bg-teal-50 px-2 py-1 rounded-md">{std.nim}</span>
                             </td>
                             <td className="px-10 py-5">
                                {std.kelompokId 
                                  ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] uppercase font-black border border-emerald-100 shadow-sm"><CheckCircle2 className="w-3 h-3" /> Berkelompok</span> 
                                  : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800/40 rounded-lg text-[10px] uppercase font-black border border-dashed border-teal-100"><Timer className="w-3 h-3" /> Menunggu</span>
                                }
                             </td>
                             <td className="px-10 py-5 text-right space-x-2">
                                <button onClick={() => {
                                  setStudentForm({
                                    id: std.id,
                                    nim: std.nim,
                                    nama: std.nama,
                                    kontak: std.kontak || '',
                                    password: '' // Don't fetch password
                                  });
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }} className="p-3 text-teal-800/30 bg-white border border-teal-100 hover:border-teal-200 hover:text-teal-600 hover:bg-teal-50 rounded-[1rem] transition-all shadow-sm opacity-0 group-hover:opacity-100">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleteData({ type: 'mahasiswa', id: std.id, name: std.nama })} className="p-3 text-teal-800/30 bg-white border border-teal-100 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-[1rem] transition-all shadow-sm opacity-0 group-hover:opacity-100">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                             </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </motion.div>
          )}

           {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
               <div className="max-w-2xl mx-auto">
                 <div className="bg-white border border-teal-50 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                       <div className="w-20 h-20 bg-orange-50 rounded-[1.5rem] flex items-center justify-center border border-orange-100 shadow-inner">
                          <Timer className="w-8 h-8 text-orange-500" />
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-tight">Jadwal Pemilihan</h3>
                          <p className="text-sm text-teal-800/60 font-medium mt-1">Tentukan kapan sistem portal *"war dosen"* dibuka dan ditutup kembali.</p>
                       </div>
                    </div>
                    <form onSubmit={handleConfigSubmit} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Waktu Mulai (START)</label>
                            <input type="datetime-local" value={configForm.startTime} onChange={e => setConfigForm({...configForm, startTime: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" required />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Waktu Selesai (END)</label>
                            <input type="datetime-local" value={configForm.endTime} onChange={e => setConfigForm({...configForm, endTime: e.target.value})} className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" required />
                          </div>
                       </div>
                       
                       <div className="p-6 bg-orange-50/50 rounded-[1.5rem] border border-orange-100 text-left flex gap-5 shadow-sm">
                          <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-orange-800 leading-relaxed font-medium">
                            Mahasiswa hanya dapat memilih dosen dalam rentang waktu yang diatur. Countdown di dashboard mahasiswa akan menyesuaikan secara otomatis secara *real-time*.
                          </p>
                       </div>

                       <button type="submit" className="w-full py-6 bg-teal-500 text-white rounded-[2rem] shadow-2xl shadow-teal-500/20 font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all group flex items-center gap-3 justify-center">
                         <Calendar className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> AKTIFKAN JADWAL SEKARANG
                       </button>
                    </form>
                 </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'admin_profile' && (
            <motion.div key="admin_profile" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}>
               <div className="max-w-2xl mx-auto">
                 <div className="bg-white border border-teal-50 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                       <div className="relative w-24 h-24 shrink-0">
                         <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl opacity-50" />
                         <div className="relative w-full h-full rounded-full border-4 border-white bg-teal-50 overflow-hidden shadow-lg group">
                           {currentUser?.foto ? (
                             <img src={currentUser.foto || undefined} alt="Admin Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <Settings className="w-8 h-8 text-teal-300" />
                             </div>
                           )}
                           <label className="absolute inset-0 bg-teal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                             {uploadLoading ? (
                               <RefreshCcw className="w-6 h-6 text-white animate-spin" />
                             ) : (
                               <>
                                 <Upload className="w-6 h-6 text-white mb-1" />
                                 <span className="text-[9px] font-black tracking-wider text-white uppercase">Ubah</span>
                               </>
                             )}
                             <input type="file" className="hidden" accept="image/*" onChange={handleAdminPhotoUpload} disabled={uploadLoading} />
                           </label>
                         </div>
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-tight">Pengaturan Profil</h3>
                          <p className="text-sm text-teal-800/60 font-medium mt-1">Kelola foto pofil dan kata sandi administrator Anda.</p>
                       </div>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-8">
                       <div className="space-y-6 text-left">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Password Baru</label>
                            <input 
                              type="password" 
                              value={passwordForm.newPassword} 
                              onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} 
                              className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" 
                              required 
                              placeholder="Minimal 6 karakter"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Konfirmasi Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.confirmPassword} 
                              onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} 
                              className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner" 
                              required 
                              placeholder="Ulangi password baru"
                            />
                          </div>
                       </div>
                       
                       <button type="submit" className="w-full py-6 bg-teal-600 text-white rounded-[2rem] shadow-2xl shadow-teal-500/20 font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all group flex items-center gap-3 justify-center">
                         <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" /> SIMPAN PASSWORD
                       </button>
                    </form>
                 </div>
               </div>
            </motion.div>
          )}

          {deleteData && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 onClick={() => setDeleteData(null)}
                 className="absolute inset-0 bg-teal-950/40 backdrop-blur-sm"
               />
               <motion.div
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl space-y-8"
               >
                 <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                   <Trash2 className="w-8 h-8" />
                 </div>
                 
                 <div className="space-y-2">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Konfirmasi Hapus</h3>
                   <h2 className="text-2xl font-black text-teal-950 leading-tight">
                     Hapus {deleteData.type === 'dosen' ? 'Dosen' : 'Mahasiswa'}: {deleteData.name}?
                   </h2>
                   <p className="text-xs text-teal-800/50 font-medium">
                     Tindakan ini tidak dapat dibatalkan. Semua data terkait akan dihapus secara permanen dari sistem.
                   </p>
                 </div>

                 <div className="flex flex-col gap-3">
                   <button
                     onClick={handleDelete}
                     disabled={loading}
                     className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50"
                   >
                     {loading ? "MENGHAPUS..." : "YA, HAPUS PERMANEN"}
                   </button>
                   <button
                     onClick={() => setDeleteData(null)}
                     disabled={loading}
                     className="w-full py-4 bg-teal-50 text-teal-800/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all"
                   >
                     BATALKAN
                   </button>
                 </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ProfileForm = ({ user, token, onComplete }: { user: any; token: string; onComplete: (updatedStudent: any) => void }) => {
  const [formData, setFormData] = useState({
    nama: user.mahasiswa?.nama || "",
    ipk: user.mahasiswa?.ipk || "",
    kontak: user.mahasiswa?.kontak || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.ipk || !formData.kontak) {
      setError("Semua field wajib diisi.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          nama: formData.nama,
          ipk: parseFloat(formData.ipk.toString()),
          kontak: formData.kontak
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan profil.");
      
      onComplete(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0FAF8]">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg">
        <GlassCard className="bg-white p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-100">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-teal-950">Lengkapi Profil Anda</h1>
            <p className="text-teal-800/60 text-sm font-medium italic">Anda wajib melengkapi data berikut sebelum masuk ke Dashboard pemilihan.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">NIM (Auto)</label>
              <input value={user.username} disabled className="w-full p-4 bg-teal-50/50 border border-teal-100 rounded-2xl text-teal-800/60 font-mono text-sm cursor-not-allowed shadow-inner" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">Nama Lengkap</label>
              <input 
                value={formData.nama} 
                onChange={e => setFormData({...formData, nama: e.target.value})} 
                placeholder="Sesuaikan dengan KTP/KTM"
                className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold" 
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">IPK Terakhir</label>
                <input 
                  type="number" step="0.01" min="0" max="4"
                  value={formData.ipk} 
                  onChange={e => setFormData({...formData, ipk: e.target.value})} 
                  placeholder="3.85"
                  className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold" 
                  required 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">Kontak / No. HP</label>
                <input 
                  value={formData.kontak} 
                  onChange={e => setFormData({...formData, kontak: e.target.value})} 
                  placeholder="0812..."
                  className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold" 
                  required 
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error.toUpperCase()}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 bg-teal-500 text-white rounded-[2rem] shadow-xl shadow-teal-500/20 font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <><RefreshCcw className="w-4 h-4 animate-spin" /> MENYIMPAN...</>
               ) : "SIMPAN & LANJUT KE DASHBOARD"}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem("user") || "null"));

  const login = (newToken: string, newUser: any) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const updateProfile = (updatedStudent: any) => {
    const updatedUser = { ...user, mahasiswa: updatedStudent };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isProfileIncomplete = user?.role === 'STUDENT' && (!user.mahasiswa?.nama || !user.mahasiswa?.kontak);

  return (
    <BrowserRouter>
      <div className="bg-[#f8fdfc] min-h-screen font-sans antialiased text-teal-950/80">
        <Navbar user={user} onLogout={logout} />
        <Routes>
          <Route path="/" element={<LandingPage user={user} />} />
          <Route path="/login" element={!token ? <LoginPage onLogin={login} /> : user?.role === 'ADMIN' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            token && user?.role === 'STUDENT' ? (
              isProfileIncomplete ? (
                <ProfileForm user={user} token={token || ""} onComplete={updateProfile} />
              ) : (
                <Dashboard user={user} token={token || ""} onProfileUpdate={updateProfile} />
              )
            ) : <Navigate to="/login" />
          } />

          <Route path="/admin" element={token && user?.role === 'ADMIN' ? <AdminDashboard token={token} currentUser={user} onUserUpdate={(updated) => { const updatedUser = { ...user, ...updated }; localStorage.setItem("user", JSON.stringify(updatedUser)); setUser(updatedUser); }} /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
