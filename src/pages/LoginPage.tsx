import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  AlertCircle,
  RefreshCcw,
  LogIn,
  Globe,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/lib/LanguageContext";

const LoginPage = ({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void;
}) => {
  const { t } = useLanguage();
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
        throw new Error(t("toast_google_auth_failed"));
      }
      const { url } = await response.json();

      const authWindow = window.open(
        url,
        "oauth_popup",
        "width=600,height=700",
      );
      if (!authWindow) {
        alert(
          t("alert_popup_blocked"),
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
          throw new Error(data.error || t("toast_register_failed"));
        }

        alert(
          t("toast_register_success"),
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
                  {isDosenLogin ? t("login_dosen").split(" ")[0].toUpperCase() : t("login_student").split(" ")[0].toUpperCase()} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500 italic">
                    PORTAL
                  </span>
                </h1>
                <p className="text-teal-800/40 text-[10px] uppercase font-black tracking-[0.4em]">
                  {t("login_welcome")} v2.0
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
              {t("login_student").split(" ")[0]}
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
              {t("login_dosen").split(" ")[0]}
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
                      {isDosenLogin ? t("login_nip") : t("login_nim")}
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
                        ? t("login_nip")
                        : t("login_nim")
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
                        {t("login_fullname")}
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
                      {t("login_password")}
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
                  {isRegister ? t("login_btn_register") : t("login_btn_enter")}
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
                  {t("login_or_sso")}
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
                  ? t("login_has_account")
                  : t("login_no_account")}
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

export default LoginPage;
