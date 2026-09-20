import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCcw,
  LogIn,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/lib/LanguageContext";
import { LogoIcon } from "@/src/components/Logo";
import { Alert, Input, Button } from "@heroui/react";

const LoginPage = ({
  onLogin,
}: {
  onLogin: (token: string, user: any) => void;
}) => {
  const { t } = useLanguage();
  const [isRegister, setIsRegister] = useState(false);
  const [isDosenLogin, setIsDosenLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
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

        setSuccess(
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F0FAF8] relative overflow-hidden font-sans p-4">
      {/* Floating gradient blur shapes, for premium feel */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute top-1/3 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-teal-200/35 to-orange-200/25 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/3 right-10 w-[300px] h-[300px] bg-gradient-to-br from-orange-200/20 to-teal-200/30 blur-[100px] rounded-full translate-x-1/3 translate-y-1/3 animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/80 backdrop-blur-3xl border border-white/50 rounded-2xl p-6 sm:p-7 shadow-[0_30px_70px_-20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.7)] group hover:shadow-[0_40px_80px_-20px_rgba(20,184,166,0.12)] transition-all duration-700">
          <div className="text-center space-y-1 mb-4">
            <motion.div
              key={isDosenLogin ? "dosen-icon" : "student-icon"}
              initial={{ rotate: -180, scale: 0, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md shadow-teal-500/5 mx-auto mb-2 border border-slate-50 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-teal-50/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <LogoIcon className="w-8 h-8 relative z-10" />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={isDosenLogin ? "dosen-title" : "student-title"}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-xl sm:text-2xl font-black text-teal-950 tracking-tighter leading-none mb-0.5">
                  {isDosenLogin ? t("login_dosen").split(" ")[0].toUpperCase() : t("login_student").split(" ")[0].toUpperCase()}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-orange-500 italic">
                    PORTAL
                  </span>
                </h1>
                <p className="text-teal-800/40 text-[8px] uppercase font-black tracking-[0.4em]">
                  {t("login_welcome")} v2.0
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* New Tab Switcher at the top */}
          <div className="flex p-0.5 bg-teal-50/50 rounded-lg mb-4 border border-teal-100/30 relative z-10">
            <button
              type="button"
              onClick={() => {
                setIsDosenLogin(false);
                setIsRegister(false);
                setError("");
              }}
              className={cn(
                "flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden",
                !isDosenLogin
                  ? "bg-white text-teal-600 shadow-sm"
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
                "flex-1 py-1.5 rounded-md text-[8px] font-black uppercase tracking-[0.2em] transition-all duration-500 relative overflow-hidden",
                isDosenLogin
                  ? "bg-white text-teal-600 shadow-sm"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Field: NIM */}
                  <div className="space-y-1 relative">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_nim")}
                      </label>
                      <span className="text-[7px] text-teal-800/50 font-mono tracking-tighter bg-teal-50/50 px-1 py-0.5 rounded border border-teal-100/30">
                        24050974086
                      </span>
                    </div>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t("login_nim_email_placeholder")}
                      required
                      variant="primary"
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 hover:border-teal-400 focus:border-teal-400 focus:outline-none focus:ring-0 rounded-lg h-10 px-3 shadow-inner transition-all font-bold text-xs text-teal-950"
                    />
                  </div>

                  {/* Field: Nama Lengkap (only if registering) */}
                  {isRegister && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black text-teal-800/60 uppercase tracking-widest">
                          {t("login_fullname")}
                        </label>
                      </div>
                      <Input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder={t("login_fullname_placeholder")}
                        required={isRegister}
                        variant="primary"
                        className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 hover:border-teal-400 focus:border-teal-400 focus:outline-none focus:ring-0 rounded-lg h-10 px-3 shadow-inner transition-all font-bold text-xs text-teal-950"
                      />
                    </motion.div>
                  )}

                  {/* Field: Password */}
                  <div className="space-y-1 relative">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_password")}
                      </label>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("login_password_placeholder")}
                      required
                      variant="primary"
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 hover:border-teal-400 focus:border-teal-400 focus:outline-none focus:ring-0 rounded-lg h-10 px-3 shadow-inner transition-all font-bold text-xs text-teal-950"
                    />
                  </div>

                  {success && (
                    <Alert status="success" className="py-1 px-2.5">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title className="text-[10px]">{success}</Alert.Title>
                      </Alert.Content>
                    </Alert>
                  )}

                  {error && (
                    <Alert status="danger" className="py-1 px-2.5">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title className="text-[10px]">{error}</Alert.Title>
                      </Alert.Content>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    isDisabled={loading}
                    className="w-full h-10 bg-teal-950 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.3em] shadow-md shadow-teal-950/20 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5 group relative overflow-hidden"
                  >
                    {loading ? (
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <LogIn className="w-3 h-3 group-hover:rotate-12 transition-transform" />{" "}
                        {isRegister ? t("login_btn_register") : t("login_btn_enter")}
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key={isRegister ? "dosen-register" : "dosen-login"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3.5"
              >
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Field: NIP */}
                  <div className="space-y-1 relative">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_nip")}
                      </label>
                      <span className="text-[7px] text-teal-800/50 font-mono tracking-tighter bg-teal-50/50 px-1 py-0.5 rounded border border-teal-100/30">
                        19800101
                      </span>
                    </div>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={t("login_nip")}
                      required
                      variant="primary"
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 hover:border-teal-400 focus:border-teal-400 focus:outline-none focus:ring-0 rounded-lg h-10 px-3 shadow-inner transition-all font-bold text-xs text-teal-950"
                    />
                  </div>

                  {/* Field: Nama Lengkap (only if registering) */}
                  {isRegister && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-1 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center px-1">
                        <label className="text-[9px] font-black text-teal-800/60 uppercase tracking-widest">
                          {t("login_fullname")}
                        </label>
                      </div>
                      <Input
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder={t("login_fullname_placeholder")}
                        required={isRegister}
                        variant="primary"
                        className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 hover:border-teal-400 focus:border-teal-400 focus:outline-none focus:ring-0 rounded-lg h-10 px-3 shadow-inner transition-all font-bold text-xs text-teal-950"
                      />
                    </motion.div>
                  )}

                  {/* Field: Password */}
                  <div className="space-y-1 relative">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-teal-800/60 uppercase tracking-widest">
                        {t("login_password")}
                      </label>
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("login_password_placeholder")}
                      required
                      variant="primary"
                      className="w-full bg-[#f8fdfc]/50 border border-teal-100/50 hover:border-teal-400 focus:border-teal-400 focus:outline-none focus:ring-0 rounded-lg h-10 px-3 shadow-inner transition-all font-bold text-xs text-teal-950"
                    />
                  </div>

                  {success && (
                    <Alert status="success" className="py-1 px-2.5">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title className="text-[10px]">{success}</Alert.Title>
                      </Alert.Content>
                    </Alert>
                  )}

                  {error && (
                    <Alert status="danger" className="py-1 px-2.5">
                      <Alert.Indicator />
                      <Alert.Content>
                        <Alert.Title className="text-[10px]">{error}</Alert.Title>
                      </Alert.Content>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    isDisabled={loading}
                    className="w-full h-10 bg-teal-950 text-white rounded-lg font-black text-[9px] uppercase tracking-[0.3em] shadow-md shadow-teal-950/20 hover:bg-teal-600 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-1.5 group relative overflow-hidden"
                  >
                    {loading ? (
                      <RefreshCcw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <>
                        <LogIn className="w-3 h-3 group-hover:rotate-12 transition-transform" />{" "}
                        {isRegister ? t("login_btn_register") : t("login_btn_enter")}
                      </>
                    )}
                  </Button>
                </form>

                {/* Account status switch disabled for production war */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Small footer under the form */}
        <div className="relative mt-4 z-10 text-center opacity-30">
          <div className="flex items-center justify-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-teal-500" />
            <span className="text-[8px] font-black text-teal-950 uppercase tracking-[0.3em]">
              PTI UNESA
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
