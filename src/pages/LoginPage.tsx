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
import { LogoIcon } from "@/src/components/Logo";
import { Alert } from "@heroui/react";

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
      if (!origin.endsWith(".run.app") && !origin.includes("localhost") && !origin.endsWith(".up.railway.app")) {
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
              className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-teal-500/10 mx-auto mb-6 border border-slate-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-teal-50/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <LogoIcon className="w-14 h-14 relative z-10" />
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
              {t("type_student")}
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
              {t("type_dosen")}
            </button>
          </div>
          <AnimatePresence mode="wait">
            {!isDosenLogin ? (
              <motion.div
                key={isRegister ? "student-register" : "student-login"}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Field: NIM / Email */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                        NIM / Email Unesa
                      </label>
                      <span className="text-[9px] text-teal-800/50 font-mono tracking-tighter bg-teal-50/50 px-2 py-0.5 rounded-md border border-teal-100/30">
                        24050974086
                      </span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                      placeholder="NIM atau Email UNESA"
                      required
                    />
                  </div>

                  {/* Field: Nama Lengkap (only if registering) */}
                  {isRegister && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
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

                  {/* Field: Password */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_password")}
                      </label>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                      placeholder="Ketuk sandi rahasia"
                      required
                    />
                  </div>

                  {error && (
                    <Alert status="danger">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>{error}</Alert.Title>
                      </Alert.Content>
                    </Alert>
                  )}

                  {/* Submit Button */}
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
                        {isRegister ? "Daftar Akun" : t("login_btn_enter")}
                      </>
                    )}
                  </button>
                </form>

                {/* SSO Google separator and button */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-teal-100/30" />
                  </div>
                  <span className="relative px-4 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black text-teal-800/30 uppercase tracking-[0.4em]">
                    ATAU
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-5 bg-white border-2 border-teal-100/80 hover:border-teal-400 text-teal-950 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all duration-300 hover:bg-teal-50/30 hover:-translate-y-1 active:scale-95 shadow-xl shadow-teal-950/5 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-teal-50/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="relative z-10 font-black tracking-[0.1em]">
                    {isRegister ? "Daftar lewat Google UNESA" : "Login lewat Google UNESA"}
                  </span>
                </button>

                {/* Account status switch */}
                <div className="text-center pt-4 border-t border-teal-50/50">
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
              </motion.div>
            ) : (
              <motion.div
                key={isRegister ? "dosen-register" : "dosen-login"}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Field: NIP */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_nip")}
                      </label>
                      <span className="text-[9px] text-teal-800/50 font-mono tracking-tighter bg-teal-50/50 px-2 py-0.5 rounded-md border border-teal-100/30">
                        19800101
                      </span>
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                      placeholder={t("login_nip")}
                      required
                    />
                  </div>

                  {/* Field: Nama Lengkap (only if registering) */}
                  {isRegister && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
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

                  {/* Field: Password */}
                  <div className="space-y-2 relative">
                    <div className="flex justify-between items-center px-2">
                      <label className="text-[10px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_password")}
                      </label>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 rounded-[1.5rem] px-6 py-5 text-teal-950 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all placeholder:text-teal-800/30 shadow-inner"
                      placeholder="Ketuk sandi rahasia"
                      required
                    />
                  </div>

                  {error && (
                    <Alert status="danger">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title>{error}</Alert.Title>
                      </Alert.Content>
                    </Alert>
                  )}

                  {/* Submit Button */}
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
                        {isRegister ? "Daftar Akun Dosen" : t("login_btn_enter")}
                      </>
                    )}
                  </button>
                </form>

                {/* SSO Google separator and button */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-teal-100/30" />
                  </div>
                  <span className="relative px-4 bg-white/80 backdrop-blur-md rounded-full text-[9px] font-black text-teal-800/30 uppercase tracking-[0.4em]">
                    ATAU
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-5 bg-white border-2 border-teal-100/80 hover:border-teal-400 text-teal-950 rounded-[1.5rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all duration-300 hover:bg-teal-50/30 hover:-translate-y-1 active:scale-95 shadow-xl shadow-teal-950/5 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-teal-50/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.77c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="relative z-10 font-black tracking-[0.1em]">
                    {isRegister ? "Daftar lewat Google UNESA" : "Login lewat Google UNESA"}
                  </span>
                </button>

                {/* Account status switch */}
                <div className="text-center pt-4 border-t border-teal-50/50">
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
              </motion.div>
            )}
          </AnimatePresence>
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
