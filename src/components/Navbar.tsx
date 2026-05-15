import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Globe,
  Star,
  Users,
  Calendar,
  Settings,
  GraduationCap,
  XCircle,
  Menu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const Navbar = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
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
        setIsProfileMenuOpen(false); // Close profile menu if open
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
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-10 h-10 rounded-2xl overflow-hidden border border-teal-100 shadow-sm hover:ring-2 hover:ring-teal-500 transition-all duration-300"
                  title="Profile Menu"
                >
                  <img
                    src={user.foto || (user.role === 'DOSEN' ? "https://images.unsplash.com/photo-1544717297-fa154da09f9b?w=400&h=400&fit=crop" : "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop")}
                    className="w-full h-full object-cover object-top"
                    alt="Profile"
                  />
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-48 bg-white/95 backdrop-blur-xl border border-white/50 rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(20,184,166,0.15)] overflow-hidden z-[120] py-2 flex flex-col"
                    >
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (user.role === 'ADMIN') navigate('/admin');
                          else if (user.role === 'DOSEN') navigate('/dosen-dashboard');
                          else navigate('/dashboard');
                        }}
                        className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-teal-800 hover:bg-teal-50 flex items-center gap-3 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-teal-500" />
                        Pengaturan
                      </button>
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Keluar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

export default Navbar;
