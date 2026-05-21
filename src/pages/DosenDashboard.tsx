import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  RefreshCcw,
  Users,
  GraduationCap,
  Smartphone,
  CheckCircle2,
  XCircle,
  BookOpen,
  Plus,
  Trash2,
  Edit,
  Camera,
  Save,
  Lock,
  Search,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/lib/LanguageContext";
import LoadingOverlay from "@/src/components/LoadingOverlay";

const DosenDashboard = ({
  user,
  token,
  onProfileUpdate,
}: {
  user: any;
  token: string;
  onProfileUpdate?: (updatedDosen: any) => void;
}) => {
  const { t, lang } = useLanguage();
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
  const [managingStudentId, setManagingStudentId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    isDanger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  const [config, setConfig] = useState<any>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const fetchDosen = async (showLoadingOverlay = true) => {
    if (showLoadingOverlay) setLoading(true);
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
      if (showLoadingOverlay) setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/war-config");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("fetchConfig failed:", err);
    }
  };

  useEffect(() => {
    fetchDosen();
    fetchConfig();
  }, [token]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleApproveStudent = async (mahasiswaId: string) => {
    setManagingStudentId(mahasiswaId);
    try {
      const res = await fetch(`/api/dosen/approve-student/${mahasiswaId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: data.message });
      fetchDosen(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setManagingStudentId(null);
    }
  };

  const handleKickStudent = (mahasiswaId: string, nama: string) => {
    setConfirmModal({
      title: `${t("dash_dosen_kick")} ${nama}?`,
      message: lang === "id" 
        ? "Apakah Anda yakin ingin mengeluarkan mahasiswa ini dari bimbingan Anda?" 
        : "Are you sure you want to remove this student from your guidance?",
      confirmText: t("dash_dosen_kick"),
      cancelText: lang === "id" ? "Batal" : "Cancel",
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        setManagingStudentId(mahasiswaId);
        try {
          const res = await fetch(`/api/dosen/kick-student/${mahasiswaId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setMessage({ type: "success", text: data.message });
          fetchDosen(false);
        } catch (err: any) {
          setMessage({ type: "error", text: err.message });
        } finally {
          setManagingStudentId(null);
        }
      },
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmittingProfile(true);
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

      setMessage({ type: "success", text: t("toast_profile_updated_desc") });
      fetchDosen(false);
      if (onProfileUpdate) onProfileUpdate(data);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak cocok." });
      return;
    }
    setSubmittingPassword(true);
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

      setMessage({ type: "success", text: t("toast_password_changed") });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmittingPassword(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("photo", file);
    if (profileForm.foto) {
      formData.append("oldUrl", profileForm.foto);
    }
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
        const data = await res.json();
        setResearchJudul("");
        fetchDosen(false);
        setMessage({
          type: "success",
          text: `Projek penelitian "${data.judul}" berhasil ditambahkan dan telah aktif.`,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleResearch = async (id: string) => {
    setDosenData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        penelitian: prev.penelitian.map((p: any) =>
          p.id === id ? { ...p, isActive: !p.isActive } : p
        ),
      };
    });

    try {
      const res = await fetch(`/api/dosen/penelitian/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        fetchDosen(false);
        setMessage({
          type: "success",
          text: `Projek penelitian "${data.judul}" telah ${data.isActive ? "DIAKTIFKAN" : "DINONAKTIFKAN"}`,
        });
      } else {
        fetchDosen(false);
      }
    } catch (err) {
      console.error(err);
      fetchDosen(false);
    }
  };

  const handleDeleteResearch = (id: string) => {
    setConfirmModal({
      title: lang === "id" ? "Hapus Penelitian?" : "Delete Research?",
      message: t("confirm_delete_research"),
      confirmText: lang === "id" ? "Hapus" : "Delete",
      cancelText: lang === "id" ? "Batal" : "Cancel",
      isDanger: true,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await fetch(`/api/dosen/penelitian/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            fetchDosen(false);
            setMessage({
              type: "success",
              text: "Projek penelitian berhasil dihapus.",
            });
          }
        } catch (err) {
          console.error(err);
        }
      },
    });
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
        {t("error_load_dosen")}
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>
      <div className="min-h-screen bg-[#F0FAF8] pt-32 pb-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-2xl rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-10 items-center border border-white"
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
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-1000"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 relative z-10 text-center md:text-left space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 rounded-full border border-teal-100 mb-4">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-teal-600">
                  {t("dash_dosen_profile_badge")}
                </span>
              </div>
              {config?.category && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1 rounded-full border ml-2 mb-4 shadow-sm",
                  config.category === "MAGANG" ? "bg-indigo-50 border-indigo-100" :
                  config.category === "PLP" ? "bg-rose-50 border-rose-100" :
                  "bg-emerald-50 border-emerald-100"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full animate-ping",
                    config.category === "MAGANG" ? "bg-indigo-500" :
                    config.category === "PLP" ? "bg-rose-500" :
                    "bg-emerald-500"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    config.category === "MAGANG" ? "text-indigo-600" :
                    config.category === "PLP" ? "text-rose-600" :
                    "text-emerald-600"
                  )}>
                    {t(`cat_${config.category.toLowerCase()}`)}
                  </span>
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-teal-950 mb-2 leading-tight">
                {dosenData.nama}
              </h1>
              <p className="text-teal-800/60 font-bold text-lg">
                {dosenData.keahlian || t("dash_dosen_expert_default")}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="px-5 py-3 bg-white border border-teal-50 rounded-2xl text-xs font-black text-teal-800 shadow-sm flex items-center gap-3">
                <Users className="w-4 h-4 text-teal-500" /> NIP. {dosenData.nip}
              </div>
              <div className="px-5 py-3 bg-white border border-teal-50 rounded-2xl text-xs font-black text-teal-800 shadow-sm flex items-center gap-3">
                <GraduationCap className="w-4 h-4 text-teal-500" /> {t("dash_dosen_quota")}{" "}
                {dosenData.kuotaMax} {t("dash_dosen_students")}
              </div>
            </div>
          </div>

          <div className="bg-teal-950 p-8 rounded-[2.5rem] relative z-10 flex flex-col items-center justify-center text-center w-full md:w-auto shrink-0 shadow-2xl border border-teal-900 group/quota">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover/quota:opacity-100 transition-opacity duration-500" />
            <span className="text-5xl font-black font-mono tracking-tighter text-white mb-1 relative z-10">
              {dosenData.mahasiswa?.length || 0}
            </span>
            <span className="text-[10px] uppercase font-black text-teal-400 mt-1 tracking-widest relative z-10">
              {t("dash_dosen_registered_students")}
            </span>
            <div className="w-12 h-1 bg-teal-800 my-4 rounded-full relative z-10" />
            <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest relative z-10">
              {t("dash_dosen_max")} {dosenData.kuotaMax} {t("dash_dosen_students_short")}
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
            {t("dash_dosen_tab_overview")}
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
            {t("dash_dosen_tab_projects")}
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
            {t("dash_dosen_tab_profile")}
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
            {t("dash_dosen_tab_security")}
          </button>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="fixed bottom-6 right-6 z-[999] max-w-sm w-full bg-white/70 backdrop-blur-xl border border-white/50 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex items-start gap-4"
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner",
                message.type === "success" 
                  ? "bg-teal-50 text-teal-600 border border-teal-100" 
                  : "bg-rose-50 text-rose-600 border border-rose-100"
              )}>
                {message.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
                ) : (
                  <XCircle className="w-5 h-5 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-950 mb-1">
                  {message.type === "success" ? "Sukses" : "Pemberitahuan"}
                </h4>
                <p className="text-xs text-teal-900/70 font-semibold leading-relaxed">
                  {message.text}
                </p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-teal-400 hover:text-teal-950 transition-colors p-1"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {confirmModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#F0FAF8]/30 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
                className="bg-white/75 backdrop-blur-2xl border border-white border-opacity-40 rounded-[2.5rem] p-8 max-w-md w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] relative overflow-hidden"
              >
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 text-center">
                  {/* Warning/Alert Icon */}
                  <div className={cn(
                    "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border",
                    confirmModal.isDanger 
                      ? "bg-rose-50 text-rose-500 border-rose-100/50" 
                      : "bg-amber-50 text-amber-500 border-amber-100/50"
                  )}>
                    <XCircle className="w-8 h-8 animate-pulse" />
                  </div>

                  <h3 className="text-xl font-black text-teal-950 tracking-tight mb-2">
                    {confirmModal.title}
                  </h3>
                  <p className="text-xs text-teal-800/60 font-semibold leading-relaxed mb-8 px-4">
                    {confirmModal.message}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="flex-1 py-4 px-6 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-inner active:scale-98 cursor-pointer"
                    >
                      {confirmModal.cancelText}
                    </button>
                    <button
                      onClick={confirmModal.onConfirm}
                      className={cn(
                        "flex-1 py-4 px-6 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-98 cursor-pointer",
                        confirmModal.isDanger
                          ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
                          : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                      )}
                    >
                      {confirmModal.confirmText}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  {t("dash_dosen_list_student")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {dosenData.mahasiswa?.length > 0 ? (
                    dosenData.mahasiswa.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex flex-col bg-slate-50 p-5 rounded-[2rem] border border-slate-200 hover:shadow-md hover:border-teal-200 transition-all group"
                      >
                        {/* Card Header */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm shrink-0">
                            <img
                              src={m.foto || undefined}
                              className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-mono text-teal-600 font-black tracking-widest">{m.nim}</span>
                            <p className="text-sm font-black text-slate-800 truncate">{m.nama}</p>
                            {/* Status Badge */}
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block",
                              (m.statusBimbingan === "APPROVED" || m.dosenId)
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            )}>
                              {(m.statusBimbingan === "APPROVED" || m.dosenId) ? t("dash_dosen_status_registered") : t("dash_dosen_status_waiting")}
                            </span>
                          </div>
                        </div>

                        {/* Rencana Judul */}
                        {m.rencanaJudul && (
                          <div className="mb-4 px-4 py-3 bg-white rounded-2xl border border-teal-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-teal-800/40 mb-1">
                              {config?.category === "MAGANG" ? t("dash_dosen_title_magang") :
                               config?.category === "PLP" ? t("dash_dosen_title_plp") :
                               t("dash_dosen_title_plan")}
                            </p>
                            <p className="text-xs font-bold text-teal-950 leading-relaxed">{m.rencanaJudul}</p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-auto pt-3 border-t border-slate-100">
                          {m.kontak && (
                            <a
                              href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-2 text-[9px] font-black text-emerald-600 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-colors bg-emerald-50 rounded-xl hover:bg-emerald-100"
                            >
                              <Smartphone className="w-3 h-3" /> {t("dash_dosen_contact")}
                            </a>
                          )}
                          {/* Approval is now automatic, button removed */}
                          <button
                            onClick={() => handleKickStudent(m.id, m.nama)}
                            disabled={managingStudentId === m.id}
                            className="py-2 px-3 text-[9px] font-black text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3 h-3" /> {t("dash_dosen_kick")}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-teal-100 rounded-[2rem] bg-teal-50/50">
                      <Search className="w-8 h-8 text-teal-300 mx-auto mb-4" />
                      <h3 className="text-lg font-black text-teal-950 mb-1">
                        {t("dash_dosen_no_student")}
                      </h3>
                      <p className="text-sm font-medium text-teal-800/60">
                        {t("dash_dosen_no_student_desc")}
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
                    {t("dash_dosen_project_management")}
                  </h2>
                </div>

                <form onSubmit={handleAddResearch} className="flex gap-4 mb-10">
                  <input
                    value={researchJudul}
                    onChange={(e) => setResearchJudul(e.target.value)}
                    placeholder={t("dash_dosen_project_placeholder")}
                    className="flex-1 p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:ring-4 focus:ring-teal-500/10 transition-all outline-none"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {t("dash_dosen_project_add")}
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
                            : "bg-slate-50 border-slate-200/80 shadow-sm",
                        )}
                      >
                        <div className="flex-1">
                          <h4 className="font-bold text-teal-900 leading-relaxed">
                            {p.judul}
                          </h4>
                          <p className="text-[9px] font-black uppercase tracking-widest text-teal-800/30 mt-2">
                            {t("dash_dosen_created_at")}{" "}
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleResearch(p.id)}
                            className={cn(
                              "px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-3 border shadow-md hover:scale-[1.03] active:scale-95 cursor-pointer",
                              p.isActive
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600 shadow-emerald-500/20"
                                : "bg-white hover:bg-slate-50 text-slate-500 border-slate-200 hover:text-slate-800 shadow-sm"
                            )}
                          >
                            <span className="font-extrabold">
                              {p.isActive ? t("dash_dosen_active") : t("dash_dosen_inactive")}
                            </span>
                            <div className={cn(
                              "w-9 h-5 rounded-full p-0.5 transition-colors duration-300 relative flex items-center shrink-0",
                              p.isActive ? "bg-white/30" : "bg-slate-200"
                            )}>
                              <div className={cn(
                                "w-4 h-4 rounded-full shadow-md transition-transform duration-300 transform",
                                p.isActive 
                                  ? "bg-white translate-x-4" 
                                  : "bg-slate-400 translate-x-0"
                              )} />
                            </div>
                          </button>
                          <button
                            onClick={() => handleDeleteResearch(p.id)}
                            className="p-3.5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100 shadow-sm hover:scale-[1.03] active:scale-95 cursor-pointer"
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
                        {t("dash_dosen_no_project")}
                      </h3>
                      <p className="text-sm font-medium text-teal-800/60">
                        {t("dash_dosen_no_project_desc")}
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
                  {t("dash_dosen_profile_settings")}
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
                            className="w-full h-full object-cover object-top"
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
                        {t("dash_dosen_click_photo")}
                      </p>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                          {t("dash_dosen_fullname")}
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
                          {t("dash_dosen_expertise")}
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
                          {t("dash_dosen_contact_number")}
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
                      {t("dash_dosen_short_bio")}
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
                    disabled={submittingProfile}
                    className="w-full py-5 bg-teal-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submittingProfile ? (
                      <RefreshCcw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {submittingProfile ? "MENYIMPAN..." : t("dash_dosen_save_profile")}
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
                  {t("dash_dosen_account_security")}
                </h2>
                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                      {t("dash_dosen_current_password")}
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
                      {t("dash_dosen_new_password")}
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
                      {t("dash_dosen_confirm_password")}
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
                    disabled={submittingPassword}
                    className="w-full py-5 bg-teal-950 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCcw className={cn("w-4 h-4", submittingPassword && "animate-spin")} />
                    {submittingPassword ? "MEMPROSES..." : t("dash_dosen_update_password")}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default DosenDashboard;
