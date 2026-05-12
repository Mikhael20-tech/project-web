import React, { useState, useEffect, ReactNode, FormEvent } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LogIn,
  Users,
  Timer,
  GraduationCap,
  Lock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit,
  Save,
  Settings,
  Calendar,
  UserPlus,
  Info,
  Download,
  XCircle,
  RefreshCcw,
  Camera,
  Upload,
  TrendingUp,
  Smartphone,
  Globe,
  Award,
  Search,
  Menu,
  ArrowRight,
  ChevronRight,
  Play,
  BookOpen,
  Star,
  Zap,
} from "lucide-react";
import { socket } from "@/src/lib/socket";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- COMPONENTS ---

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-white/70 backdrop-blur-md border border-white border-opacity-40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300",
      className,
    )}
  >
    {children}
  </div>
);

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Scrolled state for styling
      setScrolled(currentScrollY > 20);

      // Smart Hide logic
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past threshold
        setVisible(false);
        setIsMobileMenuOpen(false); // Close mobile menu if open
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { name: "Beranda", path: "/", icon: <Globe className="w-4 h-4" /> },
    {
      name: "Portfolio",
      path: "/portfolio",
      icon: <Star className="w-4 h-4" />,
    },
    {
      name: "Bimbingan",
      path: "/dashboard",
      icon: <Users className="w-4 h-4" />,
      role: "STUDENT",
    },
    {
      name: "Panel Dosen",
      path: "/dosen-dashboard",
      icon: <Calendar className="w-4 h-4" />,
      role: "DOSEN",
    },
    {
      name: "Admin",
      path: "/admin",
      icon: <Settings className="w-4 h-4" />,
      role: "ADMIN",
    },
  ];

  const filteredLinks = navLinks.filter(
    (link) => !link.role || (user && user.role === link.role),
  );

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-8",
        scrolled ? "py-4" : "py-6",
        visible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0",
      )}
    >
      <div
        className={cn(
          "max-w-7xl mx-auto rounded-[2rem] transition-all duration-500 border border-white/20 shadow-2xl flex items-center justify-between px-6 md:px-10 py-3 md:py-4",
          scrolled
            ? "bg-white/70 backdrop-blur-2xl shadow-teal-900/5"
            : "bg-white/40 backdrop-blur-xl",
        )}
      >
        {/* Logo Section */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:rotate-6 transition-all duration-500">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black tracking-tighter text-teal-950 leading-none">
              WAR<span className="text-orange-500">DOSEN</span>
            </h1>
            <p className="text-[8px] font-black text-teal-800/40 uppercase tracking-widest">
              PTI Unesa Ecosystem
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-2">
          {filteredLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 flex items-center gap-2 relative group",
                location.pathname === link.path
                  ? "bg-teal-950 text-white shadow-xl shadow-teal-950/20"
                  : "text-teal-800/60 hover:text-teal-950 hover:bg-teal-50",
              )}
            >
              {link.icon}
              {link.name}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute inset-0 bg-white/10 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* User Section / Auth Button */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-[10px] font-black text-teal-950 leading-none uppercase tracking-widest">
                  {user.username}
                </p>
                <p className="text-[8px] font-bold text-orange-500 uppercase mt-1 tracking-tighter">
                  {user.role}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="w-10 h-10 bg-white border border-teal-100 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-sm"
                title="Keluar"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 bg-teal-950 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-teal-950/20 hover:bg-teal-600 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Login Portal
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden w-10 h-10 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-900"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <XCircle className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-full left-4 right-4 mt-4 bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-2xl p-6 z-[110]"
          >
            <div className="flex flex-col gap-3">
              {filteredLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-4 transition-all",
                    location.pathname === link.path
                      ? "bg-teal-950 text-white"
                      : "text-teal-800/60 hover:bg-teal-50",
                  )}
                >
                  {link.icon}
                  {link.name}
                </button>
              ))}
              {user && (
                <button
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-4 text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <XCircle className="w-5 h-5" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

const LandingPage = ({ user }: { user: any }) => {
  const navigate = useNavigate();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F0FAF8]">
      {/* Hero Section */}
      <section className="relative pt-40 pb-28 px-6 overflow-hidden">
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
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-teal-100 shadow-sm rounded-full mb-10 overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-teal-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
              <span className="relative text-[10px] font-black uppercase tracking-widest text-teal-600">
                Pendaftaran TA Semester Genap 2024 Dibuka
              </span>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="text-6xl md:text-8xl font-black text-teal-950 tracking-tighter leading-[0.9] mb-8">
                Pilih Dosen.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500 italic px-2">
                  Masa Depan
                </span>
                <br />
                Dimulai Sekarang.
              </h1>
            </motion.div>

            <motion.div variants={itemVariants}>
              <p className="max-w-2xl mx-auto text-teal-800/70 text-lg md:text-xl font-medium leading-relaxed mb-12">
                Platform ekosistem kampus modern. Dapatkan dosen pembimbing
                skripsi impian Anda secara adil, transparan, dan real-time.
              </p>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
            >
              {user ? (
                <button
                  onClick={() =>
                    navigate(
                      user.role === "ADMIN"
                        ? "/admin"
                        : user.role === "DOSEN"
                          ? "/dosen-dashboard"
                          : "/dashboard",
                    )
                  }
                  className="w-full sm:w-auto px-10 py-5 bg-teal-500 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-500/20 hover:bg-teal-600 hover:shadow-teal-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  Dashboard Saya{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full sm:w-auto px-10 py-5 bg-teal-950 text-white rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-950/20 hover:bg-teal-900 hover:shadow-teal-950/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 group"
                >
                  Mulai Pemilihan{" "}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="w-full sm:w-auto px-10 py-5 bg-white text-teal-950 border border-teal-100 rounded-[1.25rem] font-black text-sm uppercase tracking-widest hover:bg-teal-50 hover:border-teal-200 transition-all flex items-center justify-center gap-3"
              >
                <Play className="w-4 h-4 text-teal-500" /> Lihat Panduan
              </button>
            </motion.div>
          </motion.div>

          {/* Visi Misi Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl mt-32 grid grid-cols-1 md:grid-cols-2 gap-12 bg-white p-12 rounded-[3rem] border border-teal-50 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden text-left"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-orange-400 to-teal-500 opacity-30" />

            <div className="flex flex-col relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full w-fit mb-4">
                <Globe className="w-4 h-4 text-teal-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-800">
                  Visi 2025
                </span>
              </div>
              <h3 className="text-2xl lg:text-3xl font-black text-teal-950 tracking-tighter mb-4 leading-tight">
                Menjadi Program Studi bertaraf Nasional yang Tangguh, Adaptif,
                dan Inovatif.
              </h3>
              <p className="text-teal-800/60 font-medium text-sm leading-relaxed">
                “Pada tahun 2025, menjadi Program Studi Pendidikan Teknologi
                Informasi bertaraf Nasional yang Tangguh, Adaptif, dan Inovatif
                dalam Keilmuan bidang Multimedia, Teknik Komputer dan Jaringan,
                serta Rekayasa Perangkat Lunak Berorientasi Kewirausahaan.”
              </p>
            </div>

            <div className="hidden md:block absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-3/4 bg-teal-50" />

            <div className="flex flex-col relative z-10 md:pl-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full w-fit mb-4">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-800">
                  Misi Utama
                </span>
              </div>
              <ul className="space-y-4">
                {[
                  "Menyelenggarakan pendidikan yang tangguh, adaptif, dan inovatif berorientasi kewirausahaan.",
                  "Meningkatkan kualitas penelitian dalam keilmuan TI dan multimedia.",
                  "Menyelenggarakan pengabdian masyarakat dan menyebarluaskan inovasi teknologi.",
                  "Mewujudkan tata kelola berkelanjutan dan kolaborasi tridharma internasional.",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <span className="text-teal-800/70 font-medium text-sm leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
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
            <h2 className="text-4xl md:text-5xl font-black text-teal-950 tracking-tighter mb-6">
              Bagaimana Cara Kerjanya?
            </h2>
            <p className="text-teal-800/60 font-medium text-lg max-w-2xl mx-auto">
              Tiga langkah struktural untuk mengamankan dosen pembimbing pilihan Anda.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: UserPlus,
                title: "1. Lengkapi Profil",
                desc: "Daftar dan lengkapi data diri Anda (Nama & Kontak) untuk mendapatkan akses penuh ke sistem pemilihan dosen.",
              },
              {
                icon: Search,
                title: "2. Pantau Kuota",
                desc: "Periksa sisa kapasitas masing-masing dosen di dashboard secara live sebelum waktu pemilihan resmi dibuka.",
              },
              {
                icon: Award,
                title: "3. War Dosen",
                desc: "Pastikan Anda login tepat waktu. Pilih dosen dengan sistem 'first come, first served' demi transparansi absolut.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                  delay: i * 0.15,
                  type: "spring",
                  stiffness: 300,
                  damping: 24,
                }}
                className="bg-white p-10 rounded-[2.5rem] border border-teal-50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(20,184,166,0.15)] hover:border-teal-100 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50/50 rounded-full translate-x-12 -translate-y-12 group-hover:bg-yellow-50/50 transition-colors duration-500" />
                <div className="w-16 h-16 bg-teal-50/50 rounded-[1.25rem] flex items-center justify-center mb-8 group-hover:bg-teal-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 relative z-10 text-teal-700">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-black text-teal-950 mb-4 relative z-10">
                  {step.title}
                </h3>
                <p className="text-teal-800/60 font-medium text-sm leading-relaxed relative z-10">
                  {step.desc}
                </p>
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
              <h2 className="text-4xl md:text-5xl font-black text-teal-950 tracking-tighter mb-6">
                Pakar Pendidikan TI UNESA
              </h2>
              <p className="text-teal-800/60 font-medium text-lg">
                Pilih dari dosen-dosen pakar di bidang kependidikan dan
                teknologi informasi untuk membimbing riset skripsi Anda di PTI
                UNESA.
              </p>
            </div>
            <button
              onClick={() => navigate("/portfolio")}
              className="flex items-center gap-2 text-teal-500 font-black text-[10px] uppercase tracking-widest hover:text-teal-700 transition-colors group px-6 py-3 rounded-full hover:bg-teal-50"
            >
              Jelajahi Profil Dosen{" "}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Guru Pendidikan TI",
                count: "Pengajar IT Vokasi",
                icon: BookOpen,
                color:
                  "bg-yellow-50 text-yellow-500 border-yellow-100 hover:shadow-yellow-500/10",
              },
              {
                title: "Programmer Edukasi",
                count: "Kreator Modul IT",
                icon: Smartphone,
                color:
                  "bg-teal-50 text-teal-500 border-teal-100 hover:shadow-teal-500/10",
              },
              {
                title: "Edu-Media Preneur",
                count: "Wirausaha Sistem",
                icon: TrendingUp,
                color:
                  "bg-emerald-50 text-emerald-600 border-emerald-100 hover:shadow-emerald-500/10",
              },
              {
                title: "Pakar TKJ & RPL",
                count: "Jaringan & Software",
                icon: Award,
                color:
                  "bg-amber-50 text-amber-600 border-amber-100 hover:shadow-amber-500/10",
              },
            ].map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: i * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                }}
                className="p-8 rounded-[2rem] border border-slate-100 hover:border-transparent hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all cursor-pointer group bg-white"
              >
                <div
                  className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-transform group-hover:scale-110",
                    cat.color,
                  )}
                >
                  <cat.icon className="w-7 h-7" />
                </div>
                <h4 className="font-black text-slate-900 mb-2 group-hover:text-teal-500 transition-colors">
                  {cat.title}
                </h4>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {cat.count}
                </p>
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
                Siap Melangkah Ke Tahap{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400">
                  Berikutnya?
                </span>
              </h2>
              <p className="text-teal-100/70 text-lg md:text-xl font-medium mb-12 max-w-2xl">
                Amankan posisi Anda secepatnya. Gabung sekarang, lengkapi
                profil, dan bersiaplah untuk War Dosen.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="px-12 py-6 bg-white text-teal-950 rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-500 hover:text-white hover:scale-105 transition-all shadow-xl flex items-center gap-3 group"
              >
                PAPAN DASHBOARD{" "}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-white border-t border-teal-50 px-6 text-teal-950">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                <GraduationCap className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-teal-950 tracking-tighter">
                WarDosen<span className="text-teal-500">.</span>
              </span>
            </div>
            <p className="text-teal-800/70 text-sm font-bold">
              Prodi S1 Pend. Teknologi Informasi
              <br />
              Fakultas Teknik
              <br />
              Universitas Negeri Surabaya
            </p>
            <p className="text-teal-800/60 text-xs font-medium leading-relaxed">
              Kampus Unesa Ketintang
              <br />
              Gedung A10 Surabaya 60231
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-4">
              Tautan Penting
            </h4>
            <div className="flex flex-col gap-3 text-xs font-bold text-teal-800/70">
              <a
                href="https://unesa.ac.id/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-500 transition-colors flex items-center justify-center md:justify-start gap-2"
              >
                <Globe className="w-4 h-4" /> Website UNESA
              </a>
              <a
                href="https://ft.unesa.ac.id/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-500 transition-colors flex items-center justify-center md:justify-start gap-2"
              >
                <Globe className="w-4 h-4" /> Fakultas Teknik
              </a>
              <a
                href="http://ti.ft.unesa.ac.id"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-500 transition-colors flex items-center justify-center md:justify-start gap-2"
              >
                <Globe className="w-4 h-4" /> Teknik Informatika
              </a>
              <a
                href="https://si.ft.unesa.ac.id/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-teal-500 transition-colors flex items-center justify-center md:justify-start gap-2"
              >
                <Globe className="w-4 h-4" /> Sistem Informasi
              </a>
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-teal-500 mb-4">
              Sosial Media
            </h4>
            <div className="flex flex-col gap-3 text-xs font-bold text-teal-800/70">
              <a
                href="https://www.instagram.com/hmppti.unesa"
                target="_blank"
                rel="noreferrer"
                className="hover:text-orange-500 transition-colors flex items-center justify-center md:justify-start gap-2"
              >
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram @hmppti.unesa
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-teal-50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-teal-800/40">
            Copyright © 2026 Pendidikan Teknologi Informasi | Universitas Negeri
            Surabaya.
          </p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-teal-800/30">
            <span>Supported By PPTI UNESA</span>
          </div>
        </div>
      </footer>

      {/* Video Tutorial Modal */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute inset-0 bg-teal-950/90 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(20,184,166,0.2)] z-10 border border-white/10"
            >
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/40 hover:bg-rose-500 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-20 group border border-white/20"
              >
                <XCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Panduan Penggunaan Aplikasi"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LoginPage = ({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void;
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [isDosenLogin, setIsDosenLogin] = useState(false);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }
      if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
        onLogin(event.data.token, event.data.user);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    try {
      const parentOrigin = encodeURIComponent(window.location.origin);
      const response = await fetch(
        `/api/auth/google/url?origin=${parentOrigin}`,
      );
      if (!response.ok) {
        throw new Error("Gagal mendapatkan URL otentikasi Google");
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        "oauth_popup",
        "width=600,height=700",
      );
      if (!authWindow) {
        alert(
          "Tolong izinkan pop-up untuk situs ini agar bisa login dengan SSO.",
        );
      }
    } catch (err: any) {
      console.error("OAuth error:", err);
      setError(err.message || "Gagal membuka SSO Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        const url = isDosenLogin ? "/api/register-dosen" : "/api/register";
        const body = isDosenLogin
          ? { nip: username, nama, password }
          : { nim: username, nama, password };
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Terjadi kesalahan saat registrasi.");
        }

        alert(
          "Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat.",
        );
        setIsRegister(false);
      } else {
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
      }
    } catch (err: any) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      } else {
        setError(
          err.message ||
            (isRegister ? "Gagal mendaftar." : "Username atau password salah."),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[130vh] flex flex-col items-center justify-start pt-32 pb-40 px-4 md:p-10 bg-[#F0FAF8] relative overflow-x-hidden transition-all duration-1000 scroll-smooth">
      {/* Deep Background Decorations for scrollable feel */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <div
          className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-teal-200/40 to-orange-200/40 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200/40 to-teal-200/40 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ animationDuration: "8s", animationDelay: "1s" }}
        />

        {/* Extra elements further down to reward scrolling */}
        <div className="absolute top-[100vh] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-teal-100/30 blur-[150px] rounded-full" />
        <div className="absolute top-[110vh] right-0 w-64 h-64 bg-orange-100/20 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-[3rem] p-10 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.7)] group hover:shadow-[0_40px_80px_-20px_rgba(20,184,166,0.12)] transition-all duration-700">
          <div className="text-center space-y-4 mb-8">
            <motion.div
              key={isDosenLogin ? "dosen-icon" : "student-icon"}
              initial={{ rotate: -180, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-20 h-20 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-teal-500/30 mx-auto mb-6 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <Lock className="w-10 h-10 text-white relative z-10" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isDosenLogin ? "dosen-title" : "student-title"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-5xl font-black text-teal-950 tracking-tighter leading-none mb-3">
                  {isDosenLogin ? "DOSEN" : "STUDENT"} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500 italic">
                    PORTAL
                  </span>
                </h1>
                <p className="text-teal-800/40 text-[10px] uppercase font-black tracking-[0.4em]">
                  War Dosen Pembimbing v2.0
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* New Tab Switcher at the top */}
          <div className="flex p-1 bg-teal-50/50 rounded-2xl mb-8 border border-teal-100/30 relative z-10">
            <button
              type="button"
              onClick={() => {
                setIsDosenLogin(false);
                setIsRegister(false);
                setError("");
              }}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden",
                !isDosenLogin
                  ? "bg-white text-teal-600 shadow-lg shadow-teal-500/10"
                  : "text-teal-800/40 hover:text-teal-600",
              )}
            >
              Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => {
                setIsDosenLogin(true);
                setIsRegister(false);
                setError("");
              }}
              className={cn(
                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden",
                isDosenLogin
                  ? "bg-white text-teal-600 shadow-lg shadow-teal-500/10"
                  : "text-teal-800/40 hover:text-teal-600",
              )}
            >
              Dosen
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isDosenLogin ? "dosen-fields" : "student-fields"}
                initial={{ opacity: 0, x: isDosenLogin ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isDosenLogin ? -20 : 20 }}
                transition={{ duration: 0.4, ease: "circOut" }}
                className="space-y-6"
              >
                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                      {isDosenLogin ? "NIP DOSEN" : "NIM MAHASISWA"}
                    </label>
                    <span className="text-[9px] text-teal-800/50 font-mono tracking-tighter bg-teal-50/50 px-2 py-0.5 rounded-md border border-teal-100/30">
                      {isDosenLogin ? "19800101" : "18000101"}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                    placeholder={
                      isDosenLogin
                        ? "Nomor Induk Pegawai"
                        : "Nomor Induk Mahasiswa"
                    }
                    required
                  />
                </div>

                {isRegister && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                        Nama Lengkap
                      </label>
                    </div>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                      placeholder="Masukkan nama lengkap"
                      required={isRegister}
                    />
                  </motion.div>
                )}

                <div className="space-y-2 relative">
                  <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                      Password
                    </label>
                    <span className="text-[9px] text-teal-800/50 font-mono tracking-tighter bg-teal-50/50 px-2 py-0.5 rounded-md border border-teal-100/30">
                      mhs123
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                      placeholder="Ketuk sandi rahasia"
                      required
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4 text-rose-600 text-xs font-bold shadow-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" /> {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-teal-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-teal-950/30 hover:bg-teal-600 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              {loading ? (
                <RefreshCcw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 group-hover:rotate-12 transition-transform" />{" "}
                  {isRegister ? "DAFTAR SEKARANG" : "MASUK KE PORTAL"}
                </>
              )}
            </button>
          </form>

          <div className="mt-10 space-y-6">
            {!isDosenLogin && !isRegister && (
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-teal-100/30" />
                </div>
                <span className="relative px-4 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black text-teal-800/30 uppercase tracking-[0.4em]">
                  Otentikasi SSO
                </span>
              </div>
            )}

            {!isDosenLogin && !isRegister && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-5 bg-white border border-teal-100/50 rounded-[1.5rem] flex items-center justify-center gap-4 text-teal-950 font-black text-[10px] uppercase tracking-widest hover:bg-teal-50 hover:border-teal-400 transition-all group"
              >
                <Globe className="w-4 h-4 text-teal-500 group-hover:rotate-12 transition-transform" />{" "}
                Lanjut dengan Email Unesa
              </button>
            )}

            <div className="text-center space-y-4 pt-4 border-t border-teal-50/50">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                }}
                className="text-[10px] font-black text-teal-600 hover:text-orange-500 uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 mx-auto group"
              >
                {isRegister
                  ? "Sudah Punya Akun? Login"
                  : "Belum Punya Akun? Daftar Disini"}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle footer indicator for scroll feedback */}
        <div className="mt-20 text-center">
          <p className="text-[9px] font-black text-teal-800/10 uppercase tracking-[0.5em]">
            Scroll ke bawah untuk informasi lebih lanjut
          </p>
        </div>
      </motion.div>

      {/* Decorative footer elements at the bottom of the long page */}
      <div className="mt-[40vh] relative z-10 text-center opacity-20 hover:opacity-50 transition-opacity duration-1000">
        <GraduationCap className="w-16 h-16 text-teal-500 mx-auto mb-4" />
        <p className="text-[10px] font-black text-teal-950 uppercase tracking-[1em] ml-[1em]">
          PTI UNESA
        </p>
      </div>
    </div>
  );
};

const Dashboard = ({
  user: initialUser,
  token,
  onProfileUpdate,
}: {
  user: any;
  token: string;
  onProfileUpdate: (s: any) => void;
}) => {
  const navigate = useNavigate();
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarActive, setIsWarActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [confirmingDosen, setConfirmingDosen] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    nama: "",
    kontak: "",
    peminatan: "",
    bio: "",
    foto: "",
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const fetchStudentData = async () => {
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [meRes] = await Promise.all([
        fetch("/api/me", auth),
      ]);
      if (!meRes.ok) {
        throw new Error(`Server unreachable (status: ${meRes.status})`);
      }
      const data = meRes.ok ? await meRes.json() : null;
      if (data) {
        setStudentData(data);
        onProfileUpdate(data);
        setProfileForm({
          nama: data.nama || "",
          kontak: data.kontak || "",
          peminatan: data.peminatan || "",
          bio: data.bio || "",
          foto: data.foto || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch student data", err);
    }
  };


  const handleCancelDosen = async () => {
    setLoading(true);
    setMessage(null);
    try {
      console.log("Cancelling lecturer selection...");
      const res = await fetch("/api/war/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Gagal membatalkan pemilihan.");

      setMessage({
        type: "success",
        text: "PEMILIHAN DOSEN BERHASIL DIBATALKAN.",
      });
      await Promise.all([fetchStudentData(), fetchDosen()]);
    } catch (err: any) {
      console.error("Cancel Error:", err);
      setMessage({ type: "error", text: err.message.toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  const fetchDosen = async () => {
    try {
      const res = await fetch("/api/dosen");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setDosenList(data);
    } catch (err) {
      console.error("fetchDosen failed:", err);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/war-config");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setConfig(data);
    } catch (err) {
      console.error("fetchConfig failed:", err);
    }
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


  const handlePickDosen = async (dosenId: string) => {
    setConfirmingDosen(null);
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/war/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dosenId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memilih dosen.");
      }

      setMessage({
        type: "success",
        text: `BERHASIL! ANDA MENDAPATKAN ${data.lecturerName}.`,
      });
      fetchDosen();
      fetchStudentData();
    } catch (err: any) {
      const errorMsg =
        err.name === "TypeError" ? "Koneksi terputus. Coba lagi." : err.message;
      setMessage({ type: "error", text: errorMsg.toUpperCase() });
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      if (!res.ok) throw new Error("Gagal memperbarui profil.");
      setMessage({ type: "success", text: "PROFIL BERHASIL DIPERBARUI!" });
      setIsProfileModalOpen(false);
      fetchStudentData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message.toUpperCase() });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      // 2MB Limit matching server
      setMessage({
        type: "error",
        text: "UKURAN FOTO TERLALU BESAR (MAKS 2MB)",
      });
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("photo", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload foto.");
      setProfileForm({ ...profileForm, foto: data.url });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message.toUpperCase() });
    } finally {
      setUploadLoading(false);
    }
  };
  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#F0FAF8] pt-32 pb-12 px-6">
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
                    src={
                      studentData?.foto ||
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop" ||
                      undefined
                    }
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
              <h2 className="text-xl font-black text-teal-950 tracking-tighter uppercase leading-tight mb-2">
                {studentData?.nama || "Mahasiswa"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-teal-50">
              <div className="text-center">
                <p className="text-[8px] font-black text-teal-800/50 uppercase tracking-widest mb-1">
                  NOMOR INDUK MHS
                </p>
                <p className="text-xl font-mono font-black text-teal-950">
                  {studentData?.nim || "-----"}
                </p>
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
              <p className="text-teal-800/60 text-sm font-medium pr-12">
                Portal resmi perebutan kuota pembimbing skripsi. Pastikan profil
                Anda sudah lengkap sebelum masa pemilihan dibuka.
              </p>
              <div className="flex items-center gap-2 mt-4 text-[9px] font-black text-teal-400 uppercase tracking-widest bg-teal-50/50 w-fit px-3 py-1.5 rounded-full border border-teal-100">
                <Zap className="w-3 h-3 fill-teal-400" />
                Scale-Ready Architecture
              </div>
            </div>

            <div className="h-20 w-px bg-teal-50 hidden md:block"></div>

            <div className="text-center md:text-right relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-teal-800/50 mb-2 font-black">
                Server Countdown
              </p>
              <span
                className={cn(
                  "text-5xl font-mono font-black tabular-nums tracking-tighter block leading-none",
                  !isWarActive && timeLeft > 0
                    ? "text-teal-500"
                    : "text-emerald-500",
                )}
              >
                {timeLeft === -1
                  ? "OVER"
                  : isWarActive
                    ? "LIVE"
                    : formatCountdown(timeLeft)}
              </span>
              <div className="flex items-center gap-2 justify-center md:justify-end mt-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-bold text-emerald-600 font-mono tracking-widest uppercase">
                  System Online
                </span>
              </div>
            </div>
          </div>

          <div className="xl:col-span-1 bg-teal-500 rounded-[2.5rem] p-8 shadow-xl shadow-teal-100 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 opacity-10">
              <Info className="w-32 h-32" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-teal-200">
                Panduan Cepat
              </h4>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                    1
                  </div>
                  <p className="text-xs font-bold leading-tight">
                    Lengkapi profil Anda (Nama & Kontak) untuk membuka akses pemilihan.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                    2
                  </div>
                  <p className="text-xs font-bold leading-tight">
                    Pilih dosen saat status server berubah menjadi "LIVE".
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-full mt-6 py-3 bg-white text-teal-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
            >
              Profile Settings
            </button>
            <button
              onClick={() => navigate("/portfolio")}
              className="w-full mt-3 py-3 bg-teal-600 text-white border border-teal-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:border-slate-900 transition-all shadow-lg"
            >
              Portofolio Dosen
            </button>
          </div>
        </div>

        {/* Selected Lecturer Status (Purely Individual) */}
        <div className="lg:col-span-1">
          {studentData?.dosen && (
            <div className="bg-gradient-to-br from-teal-900 to-[#022c22] rounded-[2.5rem] p-8 shadow-2xl shadow-teal-900/20 text-white h-full flex flex-col justify-between border border-teal-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300">Status Pemilihan</h3>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl mb-8">
                  <p className="text-[10px] font-black uppercase text-teal-400/60 mb-4 tracking-widest">Dosen Pembimbing Pilihan</p>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-emerald-400/70 tracking-widest">TERPILIH</span>
                      <span className="text-sm font-black text-emerald-50 leading-tight">{studentData.dosen.nama}</span>
                    </div>
                  </div>
                </div>

                {isWarActive && (
                  <button
                    type="button"
                    onClick={handleCancelDosen}
                    disabled={loading}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-4 px-4 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer group",
                      loading && "opacity-50 cursor-wait"
                    )}
                  >
                    <RefreshCcw className={cn("w-4 h-4 group-hover:-rotate-180 transition-transform duration-500", loading && "animate-spin")} />
                    {loading ? "MEMBATALKAN..." : "Batalkan Pilihan"}
                  </button>
                )}
              </div>
            </div>
          )}

          {!studentData?.dosen && (
             <div className="bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-200">
                   <Users className="w-8 h-8" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-teal-950 uppercase tracking-tight">Belum Memilih Dosen</h3>
                   <p className="text-[10px] text-teal-800/40 font-bold uppercase tracking-widest mt-1">Silakan pilih dosen dari daftar di bawah</p>
                </div>
             </div>
          )}
        </div>

        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "px-6 py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm shadow-sm",
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100",
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {message.text}
          </motion.div>
        )}

        {/* Content Section Divider */}
        <div className="flex items-center gap-4 py-4">
          <div className="h-px bg-teal-100 flex-1"></div>
          <span className="text-[10px] font-black uppercase text-teal-800/50 tracking-[0.5em]">
            {studentData?.dosen
              ? "Hasil War Dosen Pembimbing"
              : "List Database Dosen"}
          </span>
          <div className="h-px bg-teal-100 flex-1"></div>
        </div>

        {studentData?.dosen ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 border border-emerald-400"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-900/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/3" />
            <div className="w-40 h-40 rounded-[2rem] bg-white/20 border-4 border-white/40 overflow-hidden shrink-0 shadow-2xl relative z-10 flex items-center justify-center">
              {studentData.dosen.foto ? (
                <img
                  src={studentData.dosen.foto}
                  alt={studentData.dosen.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Award className="w-16 h-16 text-white" />
              )}
            </div>
            <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/30 backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4" /> SELAMAT! DOSEN PEMBIMBING
                TERPILIH
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter drop-shadow-md">
                {studentData.dosen.nama}
              </h2>
              <p className="text-emerald-100 font-bold text-lg">
                NIP: {studentData.dosen.nip}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6 pt-4">
                {studentData.dosen.kontak ? (
                  <a
                    href={`https://wa.me/${studentData.dosen.kontak.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-white text-emerald-600 px-6 py-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
                  >
                    <Smartphone className="w-5 h-5" /> Hubungi via WhatsApp
                  </a>
                ) : (
                  <div className="bg-white/10 text-white border border-white/20 px-6 py-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                    <AlertCircle className="w-5 h-5" /> Kontak Belum Tersedia
                  </div>
                )}
                <button
                  onClick={() => navigate("/portfolio")}
                  className="bg-transparent border-2 border-white/30 text-white px-6 py-4 rounded-[1.25rem] font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <BookOpen className="w-5 h-5" /> Lihat Profil Dosen
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Lecturers Grid */}
            {dosenList.map((dosen, index) => (
              <motion.div
                key={dosen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(20,184,166,0.2)] hover:border-teal-200 hover:-translate-y-3 transition-all duration-700 flex flex-col relative overflow-hidden"
              >
                {/* Decorative Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/10 blur-[60px] group-hover:bg-teal-400/20 transition-all duration-700" />

                <div className="flex flex-col items-center text-center mb-10 relative">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-to-tr from-teal-400 to-orange-400 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                    <div className="w-28 h-28 rounded-[2.25rem] bg-white p-1 relative z-10 shadow-xl border border-teal-50 overflow-hidden">
                      <img
                        src={
                          dosen.foto ||
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"
                        }
                        alt={dosen.nama}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                      />
                    </div>
                    <div
                      className={cn(
                        "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-lg z-20",
                        dosen.kuotaMax - dosen._count.mahasiswa > 0
                          ? "bg-teal-500"
                          : "bg-rose-500",
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50/50 rounded-full border border-teal-100/50">
                      <p className="text-[8px] text-teal-600 uppercase tracking-[0.2em] font-black">
                        NIP. {dosen.nip}
                      </p>
                    </div>
                    <h3 className="font-black text-2xl text-teal-950 group-hover:text-teal-600 transition-colors tracking-tighter leading-tight">
                      {dosen.nama}
                    </h3>
                    <p className="text-[10px] font-bold text-teal-800/40 uppercase tracking-widest">
                      {dosen.keahlian || "Pendidikan Teknologi Informasi"}
                    </p>
                  </div>
                </div>

                <div className="space-y-8 flex-1 relative">
                  <div className="p-8 bg-white/60 rounded-[2.5rem] border border-white/50 shadow-inner space-y-4">
                    {/* Research Projects */}
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase tracking-widest text-teal-800/40">
                        Projek Penelitian
                      </p>
                      <div className="space-y-1.5">
                        {dosen.penelitian
                          ?.filter((p: any) => p.isActive)
                          .slice(0, 2)
                          .map((p: any) => (
                            <div
                              key={p.id}
                              className="flex items-center gap-2 p-2 bg-white rounded-xl border border-teal-50 text-[10px] font-bold text-teal-900 group-hover:border-teal-100 transition-all"
                            >
                              <Plus className="w-3 h-3 text-teal-500 shrink-0" />
                              <span className="line-clamp-1">{p.judul}</span>
                            </div>
                          ))}
                        {(!dosen.penelitian ||
                          dosen.penelitian.filter((p: any) => p.isActive)
                            .length === 0) && (
                          <p className="text-[10px] text-teal-800/40 italic">
                            Belum ada projek aktif.
                          </p>
                        )}
                        {dosen.penelitian?.filter((p: any) => p.isActive)
                          .length > 2 && (
                          <p className="text-[9px] font-black text-teal-500 uppercase tracking-widest pt-1">
                            +
                            {dosen.penelitian.filter((p: any) => p.isActive)
                              .length - 2}{" "}
                            Judul Lainnya
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[9px] uppercase font-black text-teal-800/30 tracking-widest mb-1">
                          Ketersediaan
                        </p>
                        <p
                          className={cn(
                            "text-3xl font-black font-mono tracking-tighter",
                            dosen.kuotaMax - dosen._count.mahasiswa > 0
                              ? "text-teal-950"
                              : "text-rose-500",
                          )}
                        >
                          {dosen.kuotaMax - dosen._count.mahasiswa}{" "}
                          <span className="text-[10px] text-teal-800/30">
                            SLOT
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase font-black text-teal-800/30 tracking-widest mb-1">
                          Kapasitas
                        </p>
                        <p className="text-xs font-black text-teal-800/60">
                          {dosen._count.mahasiswa} / {dosen.kuotaMax}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full h-2.5 bg-teal-50 rounded-full overflow-hidden p-0.5 border border-teal-100/50">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{
                            width: `${(dosen._count.mahasiswa / dosen.kuotaMax) * 100}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={cn(
                            "h-full rounded-full shadow-sm relative overflow-hidden",
                            dosen.kuotaMax - dosen._count.mahasiswa > 0
                              ? "bg-gradient-to-r from-teal-400 to-teal-600"
                              : "bg-rose-500",
                          )}
                        />
                      </div>
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-teal-800/20">
                        <span>Mulai</span>
                        <span>Penuh</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setConfirmingDosen(dosen)}
                    disabled={
                      !isWarActive ||
                      dosen.kuotaMax - dosen._count.mahasiswa <= 0 ||
                      loading ||
                      studentData?.dosenId
                    }
                    className={cn(
                      "w-full py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl group/btn overflow-hidden relative",
                      isWarActive &&
                        dosen.kuotaMax - dosen._count.mahasiswa > 0 &&
                        !studentData?.dosenId
                        ? "bg-teal-950 text-white hover:bg-teal-500 shadow-teal-950/20 hover:shadow-teal-500/30 hover:-translate-y-2"
                        : "bg-teal-50 text-teal-800/20 cursor-not-allowed border border-teal-100",
                    )}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          {loading ? (
                            "PROCESSING..."
                          ) : studentData?.dosenId ? (
                            "SUDAH TERDAFTAR"
                          ) : !isWarActive ? (
                            "MENUNGGU WAR"
                          ) : dosen.kuotaMax - dosen._count.mahasiswa <= 0 ? (
                            "KUOTA PENUH"
                          ) : (
                            <>
                              PILIH PEMBIMBING{" "}
                              <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </>
                          )}
                        </>
                      )}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
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
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">
                      Konfirmasi Pemilihan
                    </h3>
                    <h2 className="text-2xl font-black text-teal-950 leading-tight">
                      Pilih {confirmingDosen.nama} sebagai Pembimbing?
                    </h2>
                  </div>

                  <p className="text-sm text-teal-800/60 font-medium leading-relaxed">
                    Tindakan ini akan mengunci kuota dosen tersebut untuk Anda.
                    Pastikan pilihan Anda sudah tepat sebelum melanjutkan.
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
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">
                        Account Settings
                      </h3>
                      <h2 className="text-2xl font-black text-teal-950 tracking-tighter">
                        Kustomisasi Profil
                      </h2>
                    </div>
                    <button
                      onClick={() => setIsProfileModalOpen(false)}
                      className="p-2 hover:bg-teal-50 rounded-xl transition-all"
                    >
                      <XCircle className="w-6 h-6 text-teal-200" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Photo Upload Section */}
                    <div className="flex flex-col items-center gap-4 py-4 bg-teal-50/50 border border-dashed border-teal-100 rounded-[2rem]">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-3xl bg-white border-2 border-teal-50 overflow-hidden shadow-inner">
                          <img
                            src={
                              profileForm.foto ||
                              "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop" ||
                              undefined
                            }
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
                        <p className="text-[10px] font-black uppercase text-teal-500 tracking-widest">
                          Upload Profile Photo
                        </p>
                        <p className="text-[8px] text-teal-800/40 font-bold italic mt-1">
                          JPEG/PNG, Maks 1MB
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Nama Lengkap
                        </label>
                        <input
                          value={profileForm.nama}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              nama: e.target.value,
                            })
                          }
                          className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Link / Nomor Kontak
                        </label>
                        <input
                          value={profileForm.kontak}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              kontak: e.target.value,
                            })
                          }
                          className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none"
                          placeholder="WhatsApp / Telegram / Email"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        URL Foto Profil (Optional)
                      </label>
                      <input
                        value={
                          profileForm.foto.startsWith("data:")
                            ? "Image Uploaded"
                            : profileForm.foto
                        }
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            foto: e.target.value,
                          })
                        }
                        disabled={profileForm.foto.startsWith("data:")}
                        className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none disabled:opacity-50"
                        placeholder="https://images.unsplash.com/..."
                      />
                      {profileForm.foto.startsWith("data:") && (
                        <button
                          type="button"
                          onClick={() =>
                            setProfileForm({ ...profileForm, foto: "" })
                          }
                          className="text-[8px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-1 hover:underline"
                        >
                          Reset to URL/Default
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Bio Singkat
                      </label>
                      <textarea
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            bio: e.target.value,
                          })
                        }
                        className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-2 focus:ring-teal-500/20 focus:outline-none min-h-[100px]"
                        placeholder="Ceritakan sedikit tentang ketertarikan riset Anda..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg shadow-teal-100 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        "MENYIMPAN..."
                      ) : (
                        <>
                          <Save className="w-4 h-4" /> Simpan Perubahan
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AdminDashboard = ({
  token,
  currentUser,
  onUserUpdate,
}: {
  token: string;
  currentUser: any;
  onUserUpdate: (user: any) => void;
}) => {
  const [activeTab, setActiveTab] = useState<
    "monitoring" | "dosen" | "students" | "settings" | "admin_profile"
  >("monitoring");
  const [reports, setReports] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Forms State
  const [dosenForm, setDosenForm] = useState({
    id: "",
    nama: "",
    nip: "",
    kuotaMax: 3,
    foto: "",
    keahlian: "",
    bio: "",
    kontak: "",
    password: "",
  });
  const [studentForm, setStudentForm] = useState({
    id: "",
    nim: "",
    nama: "",
    kontak: "",
    password: "",
  });
  const [configForm, setConfigForm] = useState({ startTime: "", endTime: "" });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteData, setDeleteData] = useState<{
    type: "dosen" | "mahasiswa";
    id: string;
    name: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };

      const [repRes, stuRes, confRes] = await Promise.all([
        fetch("/api/admin/reports", auth),
        fetch("/api/admin/mahasiswa", auth),
        fetch("/api/war-config"),
      ]);

      if (repRes.ok) {
        const repData = await repRes.json();
        setReports(repData);
      }
      if (stuRes.ok) {
        const stuData = await stuRes.json();
        setStudents(stuData);
      }
      if (confRes.ok) {
        const confData = await confRes.json();
        if (confData) {
          setConfig(confData);
          setConfigForm({
            startTime: new Date(confData.startTime).toISOString().slice(0, 16),
            endTime: new Date(confData.endTime).toISOString().slice(0, 16),
          });
        }
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
    return () => {
      socket.off("quota_update");
    };
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
            const canvas = document.createElement("canvas");
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
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Gagal kompresi"));
              },
              "image/jpeg",
              0.8,
            );
          };
          img.onerror = () => reject(new Error("File tidak dapat dibaca"));
        });
      };

      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append(
        "photo",
        compressedBlob,
        file.name.replace(/\.[^/.]+$/, "") + ".jpg",
      );

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(
          res.status === 413
            ? "Ukuran file terlalu besar."
            : "Terjadi kesalahan pada server saat mengunggah foto.",
        );
      }

      if (!res.ok) throw new Error(data?.error || "Gagal mengupload foto.");

      setDosenForm({ ...dosenForm, foto: data.url });
      setMessage({ type: "success", text: "Foto berhasil diupload!" });
    } catch (err: any) {
      if (err.message.includes("Failed to fetch")) {
        setMessage({
          type: "error",
          text: "Koneksi terputus. Server mungkin sibuk.",
        });
      } else {
        setMessage({ type: "error", text: err.message });
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
      const url = isEdit
        ? `/api/admin/dosen/${dosenForm.id}`
        : "/api/admin/dosen";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dosenForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan data dosen.");

      setMessage({ type: "success", text: "Data dosen berhasil disimpan!" });
      setDosenForm({
        id: "",
        nama: "",
        nip: "",
        kuotaMax: 3,
        foto: "",
        keahlian: "",
        bio: "",
        kontak: "",
        password: "",
      });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const isEdit = !!studentForm.id;
      const url = isEdit
        ? `/api/admin/mahasiswa/${studentForm.id}`
        : "/api/admin/mahasiswa";

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(studentForm),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.error ||
            (isEdit
              ? "Gagal mengubah mahasiswa."
              : "Gagal mendaftarkan mahasiswa."),
        );

      setMessage({
        type: "success",
        text: isEdit
          ? "Data mahasiswa berhasil diubah!"
          : "Mahasiswa berhasil didaftarkan!",
      });
      setStudentForm({ id: "", nim: "", nama: "", kontak: "", password: "" });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus data.");

      setMessage({
        type: "success",
        text: `${type === "dosen" ? "Dosen" : "Mahasiswa"} berhasil dihapus.`,
      });
      setDeleteData(null);
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Nama Dosen",
      "NIP",
      "Kuota Maksimal",
      "Terisi",
      "NIM Mahasiswa",
      "Nama Mahasiswa",
    ];

    const rows = reports.flatMap((dosen) => {
      if (dosen.mahasiswa.length === 0) {
        return [[dosen.nama, `'${dosen.nip}`, dosen.kuotaMax, 0, "-", "-"]];
      }
      return dosen.mahasiswa.map((m: any) => {
        return [
          dosen.nama,
          `'${dosen.nip}`,
          dosen.kuotaMax,
          dosen.mahasiswa.length,
          `'${m.nim}`,
          m.nama,
        ];
      });
    });

    const BOM = "\uFEFF";
    const csvContent =
      BOM +
      [
        headers.join(";"),
        ...rows.map((e) =>
          e.map((item) => `"${String(item).replace(/"/g, '""')}"`).join(";"),
        ),
      ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `Laporan_WarDosen_PTI_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui jadwal.");

      setMessage({ type: "success", text: "Jadwal war berhasil diperbarui!" });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: "error", text: "Password minimal 6 karakter." });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }

    try {
      const res = await fetch("/api/admin/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: passwordForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengganti password.");

      setMessage({ type: "success", text: "Password berhasil diganti!" });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleAdminPhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 400;
            const MAX_HEIGHT = 400;
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
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Gagal kompresi"));
              },
              "image/jpeg",
              0.8,
            );
          };
          img.onerror = () => reject(new Error("File tidak dapat dibaca"));
        });
      };

      const compressedBlob = await compressImage(file);
      const formData = new FormData();
      formData.append(
        "photo",
        compressedBlob,
        file.name.replace(/\.[^/.]+$/, "") + ".jpg",
      );

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        throw new Error(
          res.status === 413
            ? "Ukuran file terlalu besar."
            : "Terjadi kesalahan server saat mengunggah foto.",
        );
      }

      if (!res.ok) throw new Error(data?.error || "Gagal mengupload foto.");

      const profileRes = await fetch("/api/admin/profile-foto", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ foto: data.url }),
      });
      const profileData = await profileRes.json();
      if (!profileRes.ok)
        throw new Error(profileData.error || "Gagal memperbarui foto profil.");

      onUserUpdate({ foto: data.url });
      setMessage({ type: "success", text: "Foto profil berhasil diperbarui!" });
    } catch (err: any) {
      if (err.message.includes("Failed to fetch")) {
        setMessage({
          type: "error",
          text: "Koneksi terputus. Server mungkin sibuk.",
        });
      } else {
        setMessage({ type: "error", text: err.message });
      }
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0FAF8] pb-24 pt-28 relative overflow-hidden">
      {/* Background decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-50 to-transparent pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 px-6 pt-24">
        {/* Header Admin */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-teal-950 rounded-[3rem] p-10 shadow-2xl shadow-teal-500/10 text-white relative overflow-hidden border border-teal-900"
        >
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-400/20 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10 shrink-0">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] shrink-0">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[1em] text-teal-400 mb-2">
                Control Room
              </h2>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
                Admin{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400 italic pr-2">
                  Dashboard
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 p-2 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/5 relative z-10 w-full xl:w-auto">
            {[
              { id: "monitoring", label: "Monitor", icon: Timer },
              { id: "dosen", label: "Dosen", icon: Users },
              { id: "students", label: "Mahasiswa", icon: UserPlus },
              { id: "settings", label: "Jadwal", icon: Calendar },
              { id: "admin_profile", label: "Profil", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setMessage(null);
                }}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id
                    ? "bg-white text-teal-950 shadow-lg scale-105"
                    : "text-teal-400 hover:text-white hover:bg-white/5",
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
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                : "bg-rose-50 text-rose-700 border-rose-100",
            )}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            {message.text.toUpperCase()}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "monitoring" && (
            <motion.div
              key="monitoring"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="bg-white border border-teal-50 rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="p-8 md:p-10 border-b border-teal-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-[#f8fdfc]">
                  <div>
                    <h3 className="text-2xl font-black text-teal-950 tracking-tight mb-2">
                      Status Quota Real-time
                    </h3>
                    <p className="text-sm text-teal-800/60 font-medium">
                      Monitoring keterisian dospem oleh mahasiswa.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-5 py-3 bg-white border border-teal-100 rounded-2xl text-[10px] font-black text-teal-800 hover:bg-teal-50 hover:border-teal-200 transition-all uppercase tracking-widest shadow-sm group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      Export CSV
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
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">
                          Dosen
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-teal-800/40 tracking-widest text-center">
                          Okupansi
                        </th>
                        <th className="px-10 py-6 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">
                          Mahasiswa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-teal-50">
                      {reports.map((dosen, i) => (
                        <tr
                          key={dosen.id}
                          className="hover:bg-[#f8fdfc] transition-colors group"
                        >
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-teal-50 overflow-hidden border border-teal-100 shadow-inner group-hover:scale-110 transition-transform">
                                {dosen.foto ? (
                                  <img
                                    src={dosen.foto || undefined}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <GraduationCap className="w-6 h-6 text-teal-300 mx-auto mt-4" />
                                )}
                              </div>
                              <div>
                                <span className="font-extrabold text-teal-950 text-lg block mb-1 group-hover:text-teal-500 transition-colors">
                                  {dosen.nama}
                                </span>
                                <span className="text-[10px] font-black uppercase text-teal-800/60 tracking-widest bg-teal-50/50 px-2 py-0.5 rounded-md">
                                  NIP. {dosen.nip}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-mono font-black mb-2 text-teal-800">
                                {dosen.mahasiswa.length} / {dosen.kuotaMax}
                              </span>
                              <div className="w-32 h-2.5 bg-teal-50 rounded-full overflow-hidden shadow-inner p-0.5">
                                <div
                                  className={cn(
                                    "h-full rounded-full transition-all duration-1000 ease-out",
                                    dosen.mahasiswa.length / dosen.kuotaMax >= 1
                                      ? "bg-rose-500"
                                      : "bg-teal-500",
                                  )}
                                  style={{
                                    width: `${Math.min((dosen.mahasiswa.length / dosen.kuotaMax) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <div className="flex flex-wrap gap-2">
                              {dosen.mahasiswa.length > 0 ? (
                                dosen.mahasiswa.map((m: any) => (
                                  <div
                                    key={m.id}
                                    className="flex flex-col px-4 py-2.5 bg-white border border-teal-100 rounded-xl shadow-sm hover:border-teal-200 hover:shadow-teal-100 transition-all cursor-default group/group"
                                  >
                                    <span className="text-[10px] font-black text-teal-800/40 uppercase tracking-widest mb-0.5">
                                      NIM:{" "}
                                      <span className="text-teal-800 text-xs">
                                        {m.nim}
                                      </span>
                                    </span>
                                    <span className="text-[11px] font-bold text-teal-600 truncate max-w-[120px] group-hover/group:text-teal-700">
                                      {m.nama}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] font-black text-teal-800/30 uppercase tracking-widest px-4 py-2 border border-dashed border-teal-100 rounded-xl bg-teal-50/50">
                                  Belum Ada Mahasiswa
                                </span>
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

          {activeTab === "dosen" && (
            <motion.div
              key="dosen"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-8"
            >
              <div className="xl:col-span-1">
                <div className="bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sticky top-28">
                  <h3 className="text-2xl font-black text-teal-950 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500">
                      {dosenForm.id ? (
                        <Edit className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </div>
                    {dosenForm.id ? "Edit Dosen" : "Tambah Dosen"}
                  </h3>
                  <form onSubmit={handleDosenSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Nama Lengkap
                      </label>
                      <input
                        value={dosenForm.nama}
                        onChange={(e) =>
                          setDosenForm({ ...dosenForm, nama: e.target.value })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        NIP Dosen
                      </label>
                      <input
                        value={dosenForm.nip}
                        onChange={(e) =>
                          setDosenForm({ ...dosenForm, nip: e.target.value })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Kapasitas (Kuota)
                      </label>
                      <input
                        type="number"
                        value={dosenForm.kuotaMax || ""}
                        onChange={(e) =>
                          setDosenForm({
                            ...dosenForm,
                            kuotaMax: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Foto Profil
                      </label>
                      <div className="flex flex-col gap-4">
                        {dosenForm.foto && (
                          <div className="relative w-24 h-24 rounded-[1.5rem] overflow-hidden border-2 border-teal-100 shadow-sm shadow-teal-100 group">
                            <img
                              src={dosenForm.foto || undefined}
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setDosenForm({ ...dosenForm, foto: "" })
                              }
                              className="absolute inset-0 bg-rose-500/80 backdrop-blur-sm text-white flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-5 h-5" />
                              <span className="text-[8px] font-black tracking-widest uppercase">
                                Hapus
                              </span>
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
                              uploadLoading
                                ? "bg-teal-50/50 border-teal-100 text-teal-800/30"
                                : "bg-teal-50/50 border-teal-200 text-teal-500 hover:bg-teal-100",
                            )}
                          >
                            {uploadLoading ? (
                              "MENGUPLOAD..."
                            ) : (
                              <>
                                <Camera className="w-4 h-4" />{" "}
                                {dosenForm.foto
                                  ? "Ganti Foto"
                                  : "Pilih dari Perangkat"}
                              </>
                            )}
                          </label>
                        </div>
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-px flex-1 bg-teal-100" />
                          <span className="text-[9px] font-black text-teal-800/40 uppercase tracking-widest">
                            Atau URL
                          </span>
                          <div className="h-px flex-1 bg-teal-100" />
                        </div>
                        <input
                          placeholder="https://..."
                          value={dosenForm.foto}
                          onChange={(e) =>
                            setDosenForm({ ...dosenForm, foto: e.target.value })
                          }
                          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-[10px] font-mono focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Keahlian Utama
                      </label>
                      <input
                        value={dosenForm.keahlian || ""}
                        onChange={(e) =>
                          setDosenForm({
                            ...dosenForm,
                            keahlian: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        placeholder="Misal: Kecerdasan Buatan"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Bio Singkat
                      </label>
                      <textarea
                        value={dosenForm.bio || ""}
                        onChange={(e) =>
                          setDosenForm({ ...dosenForm, bio: e.target.value })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner min-h-[80px]"
                        placeholder="Deskripsi singkat..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Nomor HP / Kontak
                      </label>
                      <input
                        value={dosenForm.kontak || ""}
                        onChange={(e) =>
                          setDosenForm({ ...dosenForm, kontak: e.target.value })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        placeholder="08123xxxx (Dapat diakses mahasiswa setelah war)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        Password {dosenForm.id && "(Kosongi jika tidak diubah)"}
                      </label>
                      <input
                        type="password"
                        value={dosenForm.password || ""}
                        onChange={(e) =>
                          setDosenForm({
                            ...dosenForm,
                            password: e.target.value,
                          })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        placeholder={
                          dosenForm.id
                            ? "Ketik password baru..."
                            : "Password akun dosen..."
                        }
                        required={!dosenForm.id}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/10 hover:bg-teal-950 transition-all flex items-center justify-center gap-2 mt-4 group"
                    >
                      <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      {dosenForm.id ? "SIMPAN PERUBAHAN" : "TAMBAH DOSEN"}
                    </button>
                    {dosenForm.id && (
                      <button
                        type="button"
                        onClick={() =>
                          setDosenForm({
                            id: "",
                            nama: "",
                            nip: "",
                            kuotaMax: 3,
                            foto: "",
                            keahlian: "",
                            bio: "",
                            kontak: "",
                            password: "",
                          })
                        }
                        className="w-full text-[10px] font-black text-teal-800/40 hover:text-rose-500 tracking-widest uppercase transition-colors"
                      >
                        Batal Edit
                      </button>
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
                            <img
                              src={dosen.foto || undefined}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Users className="w-8 h-8 text-teal-200" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-extrabold text-teal-950 leading-tight text-lg mb-1">
                            {dosen.nama}
                          </p>
                          <span className="text-[9px] font-black uppercase text-teal-800/50 tracking-widest bg-teal-50/50 px-2 py-0.5 rounded-md">
                            NIP. {dosen.nip}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            setDosenForm({
                              id: dosen.id,
                              nama: dosen.nama,
                              nip: dosen.nip,
                              kuotaMax: dosen.kuotaMax,
                              foto: dosen.foto || "",
                              keahlian: dosen.keahlian || "",
                              bio: dosen.bio || "",
                              kontak: dosen.kontak || "",
                              password: "",
                            })
                          }
                          className="p-3 bg-[#f8fdfc] text-teal-800/40 hover:bg-teal-50 hover:text-teal-500 border border-transparent hover:border-teal-100 rounded-xl transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteData({
                              type: "dosen",
                              id: dosen.id,
                              name: dosen.nama,
                            })
                          }
                          className="p-3 bg-[#f8fdfc] text-teal-800/40 hover:bg-rose-50 hover:text-rose-600 border border-transparent hover:border-rose-100 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "students" && (
            <motion.div
              key="students"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="space-y-8"
            >
              <div className="bg-white border border-teal-50 rounded-[3rem] p-10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-teal-50 rounded-[1.25rem] flex items-center justify-center text-teal-500">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-teal-950 tracking-tight">
                      {studentForm.id
                        ? "Edit Mahasiswa"
                        : "Registrasi Mahasiswa Baru"}
                    </h3>
                    <p className="text-sm text-teal-800/60 font-medium">
                      {studentForm.id
                        ? "Perbarui informasi mahasiswa."
                        : "Buat akun untuk mahasiswa sebelum mereka bisa login."}
                    </p>
                  </div>
                </div>
                <form
                  onSubmit={handleStudentSubmit}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                      NIM (Username)
                    </label>
                    <input
                      value={studentForm.nim}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, nim: e.target.value })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                      placeholder="18000101"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                      Nama Lengkap
                    </label>
                    <input
                      value={studentForm.nama}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, nama: e.target.value })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                      placeholder="Budi Santoso"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                      No. HP Aktif
                    </label>
                    <input
                      value={studentForm.kontak}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          kontak: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                      placeholder="0812..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={studentForm.password}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                      placeholder="••••••••"
                      required={!studentForm.id}
                    />
                  </div>
                  <div className="md:col-span-2 lg:col-span-4 flex justify-end gap-3 mt-4">
                    {studentForm.id && (
                      <button
                        type="button"
                        onClick={() =>
                          setStudentForm({
                            id: "",
                            nim: "",
                            nama: "",
                            kontak: "",
                            password: "",
                          })
                        }
                        className="px-8 py-4 bg-teal-50 text-teal-600 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all"
                      >
                        Batal
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-10 py-4 bg-teal-500 text-white rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/10 hover:bg-teal-950 transition-all group flex items-center gap-3"
                    >
                      <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      {studentForm.id
                        ? "Simpan Perubahan"
                        : "Daftarkan Mahasiswa"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="bg-white border border-teal-50 rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="p-8 md:p-10 border-b border-teal-50 flex justify-between items-center bg-[#f8fdfc]">
                  <h4 className="font-extrabold text-teal-950 uppercase text-xs tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-500" /> Database
                    Mahasiswa
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
                        <th className="px-10 py-6">Dosen Terpilih</th>
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
                          <td className="px-10 py-5 font-extrabold text-teal-950 text-sm group-hover:text-teal-500 transition-colors">
                            {std.nama}
                          </td>
                          <td className="px-10 py-5 text-xs text-teal-800/60 font-black font-mono tracking-tighter">
                            <span className="bg-teal-50 px-2 py-1 rounded-md">
                              {std.nim}
                            </span>
                          </td>
                          <td className="px-10 py-5">
                            {std.dosen ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] uppercase font-black border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" /> {std.dosen.nama}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-800/40 rounded-lg text-[10px] uppercase font-black border border-dashed border-teal-100">
                                <Timer className="w-3 h-3" /> Belum Memilih
                              </span>
                            )}
                          </td>
                          <td className="px-10 py-5 text-right space-x-2">
                            <button
                              onClick={() => {
                                setStudentForm({
                                  id: std.id,
                                  nim: std.nim,
                                  nama: std.nama,
                                  kontak: std.kontak || "",
                                  password: "", // Don't fetch password
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="p-3 text-teal-800/30 bg-white border border-teal-100 hover:border-teal-200 hover:text-teal-600 hover:bg-teal-50 rounded-[1rem] transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteData({
                                  type: "mahasiswa",
                                  id: std.id,
                                  name: std.nama,
                                })
                              }
                              className="p-3 text-teal-800/30 bg-white border border-teal-100 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-[1rem] transition-all shadow-sm opacity-0 group-hover:opacity-100"
                            >
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

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="bg-white border border-teal-50 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                    <div className="w-20 h-20 bg-orange-50 rounded-[1.5rem] flex items-center justify-center border border-orange-100 shadow-inner">
                      <Timer className="w-8 h-8 text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-tight">
                        Jadwal Pemilihan
                      </h3>
                      <p className="text-sm text-teal-800/60 font-medium mt-1">
                        Tentukan kapan sistem portal *"war dosen"* dibuka dan
                        ditutup kembali.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleConfigSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Waktu Mulai (START)
                        </label>
                        <input
                          type="datetime-local"
                          value={configForm.startTime}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              startTime: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Waktu Selesai (END)
                        </label>
                        <input
                          type="datetime-local"
                          value={configForm.endTime}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              endTime: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-orange-50/50 rounded-[1.5rem] border border-orange-100 text-left flex gap-5 shadow-sm">
                      <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-800 leading-relaxed font-medium">
                        Mahasiswa hanya dapat memilih dosen dalam rentang waktu
                        yang diatur. Countdown di dashboard mahasiswa akan
                        menyesuaikan secara otomatis secara *real-time*.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-6 bg-teal-500 text-white rounded-[2rem] shadow-2xl shadow-teal-500/20 font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all group flex items-center gap-3 justify-center"
                    >
                      <Calendar className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      AKTIFKAN JADWAL SEKARANG
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "admin_profile" && (
            <motion.div
              key="admin_profile"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="max-w-2xl mx-auto">
                <div className="bg-white border border-teal-50 rounded-[3rem] p-10 md:p-14 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-6 mb-12">
                    <div className="relative w-24 h-24 shrink-0">
                      <div className="absolute inset-0 bg-teal-100 rounded-full blur-xl opacity-50" />
                      <div className="relative w-full h-full rounded-full border-4 border-white bg-teal-50 overflow-hidden shadow-lg group">
                        {currentUser?.foto ? (
                          <img
                            alt="Admin Profile"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            src={
                              currentUser.foto ||
                              "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop"
                            }
                          />
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
                              <span className="text-[9px] font-black tracking-wider text-white uppercase">
                                Ubah
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleAdminPhotoUpload}
                            disabled={uploadLoading}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-tight">
                        Pengaturan Profil
                      </h3>
                      <p className="text-sm text-teal-800/60 font-medium mt-1">
                        Kelola foto pofil dan kata sandi administrator Anda.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handlePasswordSubmit} className="space-y-8">
                    <div className="space-y-6 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Password Baru
                        </label>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                          required
                          placeholder="Minimal 6 karakter"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Konfirmasi Password
                        </label>
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({
                              ...passwordForm,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                          required
                          placeholder="Ulangi password baru"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-6 bg-teal-600 text-white rounded-[2rem] shadow-2xl shadow-teal-500/20 font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all group flex items-center gap-3 justify-center"
                    >
                      <Save className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      SIMPAN PASSWORD
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
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">
                    Konfirmasi Hapus
                  </h3>
                  <h2 className="text-2xl font-black text-teal-950 leading-tight">
                    Hapus {deleteData.type === "dosen" ? "Dosen" : "Mahasiswa"}:{" "}
                    {deleteData.name}?
                  </h2>
                  <p className="text-xs text-teal-800/50 font-medium">
                    Tindakan ini tidak dapat dibatalkan. Semua data terkait akan
                    dihapus secara permanen dari sistem.
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

const ProfileForm = ({
  user,
  token,
  onComplete,
}: {
  user: any;
  token: string;
  onComplete: (updatedStudent: any) => void;
}) => {
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: formData.nama,
          ipk: parseFloat(formData.ipk.toString()),
          kontak: formData.kontak,
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="bg-white p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-100">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-teal-950">
              Lengkapi Profil Anda
            </h1>
            <p className="text-teal-800/60 text-sm font-medium italic">
              Anda wajib melengkapi data berikut sebelum masuk ke Dashboard
              pemilihan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                NIM (Auto)
              </label>
              <input
                value={user.username}
                disabled
                className="w-full p-4 bg-teal-50/50 border border-teal-100 rounded-2xl text-teal-800/60 font-mono text-sm cursor-not-allowed shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                Nama Lengkap
              </label>
              <input
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Sesuaikan dengan KTP/KTM"
                className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                  IPK Terakhir
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={formData.ipk}
                  onChange={(e) =>
                    setFormData({ ...formData, ipk: e.target.value })
                  }
                  placeholder="3.85"
                  className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                  Kontak / No. HP
                </label>
                <input
                  value={formData.kontak}
                  onChange={(e) =>
                    setFormData({ ...formData, kontak: e.target.value })
                  }
                  placeholder="0812..."
                  className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{" "}
                {error.toUpperCase()}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-teal-500 text-white rounded-[2rem] shadow-xl shadow-teal-500/20 font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> MENYIMPAN...
                </>
              ) : (
                "SIMPAN & LANJUT KE DASHBOARD"
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

const PortfolioPage = () => {
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDosen, setSelectedDosen] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/dosen")
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setDosenList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredDosen = dosenList.filter(
    (d) =>
      d.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.nip.includes(searchQuery),
  );

  return (
    <div className="min-h-screen bg-[#F0FAF8] relative overflow-hidden pb-24">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-teal-200/40 blur-[120px] rounded-full mix-blend-multiply pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-orange-200/30 blur-[100px] rounded-full mix-blend-multiply pointer-events-none" />

      {/* Hero Section */}
      <div className="pt-32 pb-16 px-6 relative z-10 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-md border border-teal-100 rounded-full mb-6 shadow-sm"
        >
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-teal-800">
            Direktori Pakar Akademik
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-black text-teal-950 tracking-tighter leading-tight mb-6"
        >
          Eksplorasi{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-400 italic pr-2 pb-1">
            Portofolio
          </span>
          <br />
          Dosen Ahli.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-teal-800/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10"
        >
          Temukan pembimbing skripsi yang paling tepat untuk riset Anda. Lihat
          profil, spesialisasi, dan ketersediaan kuota secara real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md relative"
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-teal-400" />
          </div>
          <input
            type="text"
            placeholder="Cari nama atau NIP dosen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-xl border border-teal-100 rounded-[2rem] text-teal-950 font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all placeholder:text-teal-800/30"
          />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-teal-600 hover:text-teal-800 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm border border-teal-100 w-fit group"
        >
          <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />{" "}
          Kembali
        </button>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center gap-4">
              <RefreshCcw className="w-8 h-8 text-teal-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                Memuat Data Server...
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredDosen.map((dosen, index) => {
                const kuotaTerpakai = dosen._count?.mahasiswa || 0;
                const isFull = kuotaTerpakai >= dosen.kuotaMax;

                return (
                  <motion.div
                    layout
                    key={dosen.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 25,
                    }}
                    className="relative aspect-[3/4] group cursor-pointer rounded-[2.5rem] overflow-hidden shadow-2xl hover:shadow-teal-500/20 transition-all duration-700"
                    onClick={() => setSelectedDosen(dosen)}
                  >
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0">
                      <img
                        src={
                          dosen.foto ||
                          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop"
                        }
                        alt={dosen.nama}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                    </div>

                    {/* Glowing Border (only on hover) */}
                    <div className="absolute inset-0 border-2 border-teal-400/0 group-hover:border-teal-400/40 rounded-[2.5rem] z-20 transition-all duration-500 pointer-events-none" />

                    {/* Top Content: Badges */}
                    <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-start">
                      <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[8px] font-black uppercase tracking-widest text-white/80">
                        {dosen.nip}
                      </div>
                      {isFull ? (
                        <div className="bg-rose-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{" "}
                          Penuh
                        </div>
                      ) : (
                        <div className="bg-teal-500/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-lg">
                          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />{" "}
                          Tersedia
                        </div>
                      )}
                    </div>

                    {/* Bottom Content: Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="mb-3 flex flex-wrap gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="px-2 py-0.5 bg-teal-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                          Dosen Ahli
                        </span>
                        <span className="px-2 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase tracking-widest rounded-md">
                          {dosen.kuotaMax - kuotaTerpakai} Slot Sisa
                        </span>
                      </div>
                      <h3 className="font-black text-2xl md:text-3xl text-white leading-none tracking-tighter mb-2 group-hover:text-teal-300 transition-colors duration-300">
                        {dosen.nama}
                      </h3>
                      <p className="text-white/60 text-xs font-bold line-clamp-1 group-hover:text-white/90 transition-colors">
                        {dosen.keahlian || "Pendidikan Teknologi Informasi"}
                      </p>

                      <div className="mt-6 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                        <div className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{
                              width: `${(kuotaTerpakai / dosen.kuotaMax) * 100}%`,
                            }}
                            className="h-full bg-teal-400"
                          />
                        </div>
                        <span className="text-[10px] font-black text-white/50">
                          {kuotaTerpakai}/{dosen.kuotaMax}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredDosen.length === 0 && !loading && (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-teal-300" />
                </div>
                <h3 className="text-xl font-black text-teal-950 mb-2">
                  Dosen Tidak Ditemukan
                </h3>
                <p className="text-teal-800/60 font-medium text-sm">
                  Coba sesuaikan kata kunci pencarian Anda.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedDosen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDosen(null)}
              className="absolute inset-0 bg-teal-950/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh]"
            >
              {/* Left Side: Photo (Desktop) / Top Section (Mobile) */}
              <div className="w-full md:w-[40%] relative bg-teal-900 overflow-hidden shrink-0 min-h-[350px] md:min-h-0">
                <div className="absolute inset-0 z-0">
                  <img
                    src={
                      selectedDosen.foto ||
                      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1200&fit=crop"
                    }
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-[2000ms]"
                    alt={selectedDosen.nama}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-teal-950 via-teal-950/40 to-transparent" />
                </div>

                <button
                  onClick={() => setSelectedDosen(null)}
                  className="absolute top-8 left-8 z-20 w-12 h-12 bg-white/10 hover:bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all border border-white/20 group shadow-2xl"
                >
                  <ArrowRight className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="absolute bottom-12 left-10 right-10 z-10">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-500 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full mb-5 border border-white/20 shadow-lg"
                  >
                    <Users className="w-3.5 h-3.5" /> Pakar Akademik
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-4xl md:text-5xl font-black text-white leading-[1.1] tracking-tighter drop-shadow-2xl mb-3"
                  >
                    {selectedDosen.nama}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-teal-200/80 font-bold text-sm tracking-wide flex items-center gap-2"
                  >
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    NIP. {selectedDosen.nip}
                  </motion.p>
                </div>
              </div>

              {/* Right Side: Content */}
              <div className="flex-1 bg-[#F8FEFD] overflow-y-auto relative scroll-smooth custom-scrollbar">
                <div className="p-10 md:p-14 space-y-12">
                  {/* Bio Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-[1rem] bg-white shadow-md flex items-center justify-center text-teal-600 border border-teal-50">
                        <Info className="w-5 h-5" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-800/30">
                        Profil Profesional
                      </h3>
                    </div>
                    <p className="text-teal-950 text-lg leading-relaxed font-semibold italic opacity-90 border-l-4 border-teal-100 pl-6">
                      "
                      {selectedDosen.bio ||
                        "Pakar Pendidikan Teknologi Informasi dengan fokus pada pengembangan sistem cerdas dan metodologi pembelajaran digital berbasis industri."}
                      "
                    </p>
                  </motion.section>

                  {/* Projek Dosen Section */}
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[1rem] bg-white shadow-md flex items-center justify-center text-teal-600 border border-teal-50">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-800/30">
                        Projek Dosen (Penelitian)
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {selectedDosen.penelitian?.filter((p: any) => p.isActive)
                        .length > 0 ? (
                        selectedDosen.penelitian
                          .filter((p: any) => p.isActive)
                          .map((p: any) => (
                            <div
                              key={p.id}
                              className="p-6 bg-white border border-teal-50 rounded-3xl shadow-sm hover:shadow-md transition-all flex items-center gap-6 group/item"
                            >
                              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 shrink-0 group-hover/item:bg-teal-500 group-hover/item:text-white transition-colors">
                                <Plus className="w-5 h-5" />
                              </div>
                              <p className="font-bold text-teal-900 leading-relaxed">
                                {p.judul}
                              </p>
                            </div>
                          ))
                      ) : (
                        <div className="p-8 bg-teal-50/50 border border-dashed border-teal-100 rounded-3xl text-center">
                          <p className="text-sm font-medium text-teal-800/60">
                            Belum ada projek penelitian yang aktif.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.section>

                  {/* Footer Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="pt-12 border-t border-teal-100 flex flex-col sm:flex-row gap-8 items-center justify-between"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center text-orange-500 shadow-xl border border-orange-50 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-orange-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Star className="w-8 h-8 relative z-10 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-800/30 mb-1">
                          Status Ketersediaan
                        </p>
                        <p className="text-teal-950 font-black text-2xl tracking-tighter">
                          Sisa{" "}
                          {selectedDosen.kuotaMax -
                            (selectedDosen._count?.mahasiswa || 0)}{" "}
                          Slot
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedDosen(null)}
                      className="w-full sm:w-auto px-10 py-5 bg-teal-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange-500 hover:-translate-y-2 transition-all shadow-2xl shadow-teal-900/20 hover:shadow-orange-500/40"
                    >
                      Tutup Profil
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DosenDashboard = ({
  user,
  token,
  onProfileUpdate,
}: {
  user: any;
  token: string;
  onProfileUpdate?: (updatedDosen: any) => void;
}) => {
  const [dosenData, setDosenData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "research" | "profile" | "security"
  >("overview");
  const [profileForm, setProfileForm] = useState({
    nama: "",
    keahlian: "",
    bio: "",
    kontak: "",
    foto: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [researchJudul, setResearchJudul] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const fetchDosen = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/me-dosen", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDosenData(data);
        setProfileForm({
          nama: data.nama || "",
          keahlian: data.keahlian || "",
          bio: data.bio || "",
          kontak: data.kontak || "",
          foto: data.foto || "",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDosen();
  }, [token]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/dosen/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui profil.");

      setMessage({ type: "success", text: "Profil berhasil diperbarui!" });
      fetchDosen();
      if (onProfileUpdate) onProfileUpdate(data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/dosen/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengubah password.");

      setMessage({ type: "success", text: "Password berhasil diubah!" });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("photo", file);
    try {
      const res = await fetch("/api/upload", {
        // Reuse admin upload for now
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal upload foto.");
      setProfileForm({ ...profileForm, foto: data.url });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleAddResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!researchJudul.trim()) return;
    try {
      const res = await fetch("/api/dosen/penelitian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ judul: researchJudul }),
      });
      if (res.ok) {
        setResearchJudul("");
        fetchDosen();
        setMessage({
          type: "success",
          text: "Penelitian berhasil ditambahkan!",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleResearch = async (id: string) => {
    try {
      const res = await fetch(`/api/dosen/penelitian/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchDosen();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResearch = async (id: string) => {
    if (!confirm("Hapus judul penelitian ini?")) return;
    try {
      const res = await fetch(`/api/dosen/penelitian/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchDosen();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FAF8]">
        <RefreshCcw className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  if (!dosenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FAF8]">
        Gagal memuat data dosen.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0FAF8] pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] relative overflow-hidden flex flex-col md:flex-row gap-10 items-center border border-white"
        >
          {/* Animated background accent */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-orange-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-1 relative z-10 shadow-2xl border border-teal-50">
              <div className="w-full h-full rounded-[2.2rem] overflow-hidden bg-teal-50 flex items-center justify-center">
                <img
                  src={
                    dosenData.foto ||
                    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop"
                  }
                  alt={dosenData.nama}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 relative z-10 text-center md:text-left space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full border border-teal-100 mb-4">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  Lecturer Profile
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-teal-950 mb-2 leading-tight">
                {dosenData.nama}
              </h1>
              <p className="text-teal-800/60 font-bold text-lg">
                {dosenData.keahlian || "Pakar Pendidikan Teknologi Informasi"}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="px-5 py-3 bg-white border border-teal-50 rounded-2xl text-xs font-black text-teal-800 shadow-sm flex items-center gap-3">
                <Users className="w-4 h-4 text-teal-500" /> NIP. {dosenData.nip}
              </div>
              <div className="px-5 py-3 bg-white border border-teal-50 rounded-2xl text-xs font-black text-teal-800 shadow-sm flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-teal-500" /> Kuota:{" "}
                {dosenData.kuotaMax} Mahasiswa
              </div>
            </div>
          </div>

          <div className="bg-teal-950 p-8 rounded-[2.5rem] relative z-10 flex flex-col items-center justify-center text-center w-full md:w-auto shrink-0 shadow-2xl border border-teal-900 group/quota">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover/quota:opacity-100 transition-opacity duration-500" />
            <span className="text-5xl font-black font-mono tracking-tighter text-white mb-1 relative z-10">
              {dosenData.mahasiswa?.length || 0}
            </span>
            <span className="text-[10px] uppercase font-black text-teal-400 mt-1 tracking-widest relative z-10">
              Mhs Terdaftar
            </span>
            <div className="w-12 h-1 bg-teal-800 my-4 rounded-full relative z-10" />
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest relative z-10">
              Maks {dosenData.kuotaMax} Mhs
            </span>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 p-2 bg-white/50 backdrop-blur-md border border-teal-100 rounded-[2rem] w-fit mx-auto md:mx-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "overview"
                ? "bg-teal-500 text-white shadow-lg"
                : "text-teal-800/50 hover:bg-teal-50",
            )}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("research")}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "research"
                ? "bg-teal-500 text-white shadow-lg"
                : "text-teal-800/50 hover:bg-teal-50",
            )}
          >
            Projek Dosen
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "profile"
                ? "bg-teal-500 text-white shadow-lg"
                : "text-teal-800/50 hover:bg-teal-50",
            )}
          >
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === "security"
                ? "bg-teal-500 text-white shadow-lg"
                : "text-teal-800/50 hover:bg-teal-50",
            )}
          >
            Security
          </button>
        </div>

        {message && (
          <div
            className={cn(
              "p-4 rounded-2xl text-center font-bold text-sm shadow-sm",
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                : "bg-rose-50 text-rose-700 border border-rose-100",
            )}
          >
            {message.text}
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-[2.5rem] p-10 border border-teal-50 shadow-sm relative overflow-hidden">
                <h2 className="text-xl font-black text-teal-950 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  Daftar Mahasiswa Bimbingan
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {dosenData.mahasiswa?.length > 0 ? (
                    dosenData.mahasiswa.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-200 hover:shadow-md hover:border-teal-200 transition-all hover:-translate-y-1 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm relative shrink-0">
                          <img
                            src={m.foto || undefined}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-teal-600 font-black tracking-widest mb-0.5">
                            {m.nim}
                          </span>
                          <span className="text-sm font-black text-slate-800 truncate">
                            {m.nama}
                          </span>
                          {m.kontak && (
                            <a
                              href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[9px] font-black text-emerald-600 hover:text-emerald-800 mt-1.5 flex items-center gap-1.5 transition-colors"
                            >
                              <Smartphone className="w-3 h-3" /> HUBUNGI
                            </a>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-teal-100 rounded-[2rem] bg-teal-50/50">
                      <Search className="w-8 h-8 text-teal-300 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-teal-950 mb-1">
                        Belum Ada Mahasiswa
                      </h3>
                      <p className="text-sm font-medium text-teal-800/60">
                        Mahasiswa akan muncul di sini setelah mereka memilih
                        Anda.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "research" && (
            <motion.div
              key="research"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-[2.5rem] p-10 border border-teal-50 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <h2 className="text-xl font-black text-teal-950 uppercase tracking-tighter flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 shadow-inner">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    Manajemen Projek Dosen (Penelitian)
                  </h2>
                </div>

                <form onSubmit={handleAddResearch} className="flex gap-4 mb-10">
                  <input
                    value={researchJudul}
                    onChange={(e) => setResearchJudul(e.target.value)}
                    placeholder="Masukkan judul penelitian yang ditawarkan..."
                    className="flex-1 p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Tambah
                  </button>
                </form>

                <div className="space-y-4">
                  {dosenData.penelitian?.length > 0 ? (
                    dosenData.penelitian.map((p: any) => (
                      <div
                        key={p.id}
                        className={cn(
                          "p-6 rounded-[2rem] border transition-all flex items-center justify-between gap-6",
                          p.isActive
                            ? "bg-white border-teal-100 shadow-sm"
                            : "bg-slate-50 border-slate-100 opacity-60",
                        )}
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-teal-900 leading-relaxed">
                            {p.judul}
                          </h4>
                          <p className="text-[9px] font-black uppercase tracking-widest text-teal-800/30 mt-2">
                            Dibuat pada{" "}
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleResearch(p.id)}
                            className={cn(
                              "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border",
                              p.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-100 text-slate-400 border-slate-200",
                            )}
                          >
                            {p.isActive ? "Aktif" : "Non-aktif"}
                          </button>
                          <button
                            onClick={() => handleDeleteResearch(p.id)}
                            className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center border-2 border-dashed border-teal-100 rounded-[2rem] bg-teal-50/50">
                      <BookOpen className="w-8 h-8 text-teal-300 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-teal-950 mb-1">
                        Belum Ada Projek Penelitian
                      </h3>
                      <p className="text-sm font-medium text-teal-800/60">
                        Tambahkan judul penelitian untuk menarik minat mahasiswa
                        bimbingan.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white rounded-[2.5rem] p-10 border border-teal-50 shadow-sm">
                <h2 className="text-xl font-black text-teal-950 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 shadow-inner">
                    <Edit className="w-5 h-5" />
                  </div>
                  Pengaturan Profil Dosen
                </h2>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3 flex flex-col items-center gap-4">
                      <div className="relative group w-48 h-48">
                        <div className="w-full h-full rounded-[2.5rem] bg-teal-50 border-4 border-white shadow-xl overflow-hidden ring-1 ring-teal-100">
                          <img
                            src={
                              profileForm.foto ||
                              "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"
                            }
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="absolute inset-0 bg-teal-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer rounded-[2.5rem]">
                          {uploadLoading ? (
                            <RefreshCcw className="w-8 h-8 text-white animate-spin" />
                          ) : (
                            <Camera className="w-8 h-8 text-white" />
                          )}
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            disabled={uploadLoading}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] font-black uppercase text-teal-800/40 text-center tracking-widest">
                        Klik foto untuk mengganti
                      </p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                          Nama Lengkap
                        </label>
                        <input
                          value={profileForm.nama}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              nama: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                          Keahlian / Fokus Riset
                        </label>
                        <input
                          value={profileForm.keahlian}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              keahlian: e.target.value,
                            })
                          }
                          placeholder="Multimedia, RPL, Jaringan..."
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                          Nomor HP / WA
                        </label>
                        <input
                          value={profileForm.kontak}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              kontak: e.target.value,
                            })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                      Bio Singkat
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, bio: e.target.value })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none min-h-[120px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-teal-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> SIMPAN PERUBAHAN PROFIL
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] p-10 border border-teal-50 shadow-sm">
                <h2 className="text-xl font-black text-teal-950 uppercase tracking-tighter mb-8 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500 shadow-inner">
                    <Lock className="w-5 h-5" />
                  </div>
                  Keamanan Akun
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                      Password Saat Ini
                    </label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-5 bg-teal-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <RefreshCcw className="w-4 h-4" /> PERBARUI PASSWORD
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const AppContent = ({
  user,
  setUser,
  token,
  login,
  logout,
  updateProfile,
}: any) => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isProfileIncomplete =
    user?.role === "STUDENT" &&
    (!user.mahasiswa?.nama || !user.mahasiswa?.kontak);

  return (
    <div className="bg-[#f8fdfc] min-h-screen font-sans antialiased text-teal-950/80">
      {!isLoginPage && <Navbar user={user} onLogout={logout} />}
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route
          path="/login"
          element={
            !token ? (
              <LoginPage onLogin={login} />
            ) : user?.role === "ADMIN" ? (
              <Navigate to="/admin" />
            ) : user?.role === "DOSEN" ? (
              <Navigate to="/dosen-dashboard" />
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            token && user?.role === "STUDENT" ? (
              isProfileIncomplete ? (
                <ProfileForm
                  user={user}
                  token={token || ""}
                  onComplete={updateProfile}
                />
              ) : (
                <Dashboard
                  user={user}
                  token={token || ""}
                  onProfileUpdate={updateProfile}
                />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/dosen-dashboard"
          element={
            token && user?.role === "DOSEN" ? (
              <DosenDashboard
                user={user}
                token={token || ""}
                onProfileUpdate={updateProfile}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/portfolio"
          element={token ? <PortfolioPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={
            token && user?.role === "ADMIN" ? (
              <AdminDashboard
                token={token}
                currentUser={user}
                onUserUpdate={(updated) => {
                  const updatedUser = { ...user, ...updated };
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  setUser(updatedUser);
                }}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState<any>(
    JSON.parse(localStorage.getItem("user") || "null"),
  );

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

  const updateProfile = (updatedData: any) => {
    let updatedUser;
    if (user.role === "DOSEN") {
      updatedUser = { ...user, dosen: updatedData, foto: updatedData.foto };
    } else {
      updatedUser = { ...user, mahasiswa: updatedData, foto: updatedData.foto };
    }
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <BrowserRouter>
      <AppContent
        user={user}
        setUser={setUser}
        token={token}
        login={login}
        logout={logout}
        updateProfile={updateProfile}
      />
    </BrowserRouter>
  );
}
