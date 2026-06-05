import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  Edit,
  Zap,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  BookOpen,
  Search,
  X,
  Plus,
  ChevronRight,
  GraduationCap,
  Info,
  RefreshCcw,
  XCircle,
  Camera,
  Save,
} from "lucide-react";
import { socket } from "@/src/lib/socket";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/components/ToastProvider";
import { useLanguage } from "@/src/lib/LanguageContext";
import LoadingOverlay from "@/src/components/LoadingOverlay";
import DosenCardSkeleton from "@/src/components/DosenCardSkeleton";
import confetti from "canvas-confetti";
import { Alert, Input, Button, ProgressBar } from "@heroui/react";


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
  const { toast } = useToast();
  const { t } = useLanguage();
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isWarActive, setIsWarActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [confirmingDosen, setConfirmingDosen] = useState<{dosen: any, title: string} | null>(null);
  const [profileForm, setProfileForm] = useState({
    nim: "",
    nama: "",
    kontak: "",
    peminatan: "",
    bio: "",
    foto: "",
    rencanaJudul: "",
    magangPosisi: "",
    magangTempat: "",
    plpLokasi: "",
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [searchDosen, setSearchDosen] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isProfileIncomplete = !studentData?.kontak || !studentData?.foto || studentData?.foto.includes("unsplash.com");

  const fetchStudentData = async () => {
    try {
      const auth = { headers: { Authorization: `Bearer ${token}` } };
      const [meRes] = await Promise.all([fetch("/api/me", auth)]);
      if (!meRes.ok) {
        throw new Error(`Server unreachable (status: ${meRes.status})`);
      }
      const data = meRes.ok ? await meRes.json() : null;
      if (data) {
        setStudentData(data);
        onProfileUpdate(data);
        setProfileForm({
          nim: data.nim || "",
          nama: data.nama || "",
          kontak: data.kontak || "",
          peminatan: data.peminatan || "",
          bio: data.bio || "",
          foto: data.foto || "",
          rencanaJudul: data.rencanaJudul || "",
          magangPosisi: data.magangPosisi || "",
          magangTempat: data.magangTempat || "",
          plpLokasi: data.plpLokasi || "",
        });

        const isIncomplete = !data.kontak || !data.foto || data.foto.includes("unsplash.com");
        if (isIncomplete) {
          setIsProfileModalOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch student data", err);
    }
  };

  // Note: Student cannot cancel their own selection.
  // Only Dosen (via kick) or Admin (via admin panel) can remove a student's assignment.
  // handleCancelDosen removed to reflect correct server-side behavior.

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

  const studentDataRef = React.useRef(studentData);
  useEffect(() => {
    studentDataRef.current = studentData;
  }, [studentData]);

  useEffect(() => {
    const init = async () => {
      setInitialLoading(true);
      await Promise.all([fetchDosen(), fetchConfig(), fetchStudentData()]);
      setInitialLoading(false);
    };
    init();

    // Fix #9: Use a named handler so socket.off removes only this specific listener,
    // preventing duplication if the component remounts (e.g. React Strict Mode, logout/login)
    const handleQuotaUpdate = (updatedList: any[]) => {
      setDosenList(updatedList);
    };

    const handleConfigUpdate = (newConfig: any) => {
      setConfig(newConfig);
    };

    const handleStudentUpdate = (data: any) => {
      const currentStudent = studentDataRef.current;
      if (
        (currentStudent && (data.id === currentStudent.id || data.userId === currentStudent.userId || data.nim === currentStudent.nim)) ||
        (data.angkatan && currentStudent && data.angkatan === currentStudent.angkatan)
      ) {
        fetchStudentData();
      }
    };

    socket.on("quota_update", handleQuotaUpdate);
    socket.on("config_update", handleConfigUpdate);
    socket.on("student_update", handleStudentUpdate);

    return () => {
      socket.off("quota_update", handleQuotaUpdate);
      socket.off("config_update", handleConfigUpdate);
      socket.off("student_update", handleStudentUpdate);
    };
  }, []);

  useEffect(() => {
    if (!config) return;

    const timer = setInterval(() => {
      if (!config) return;
      const start = new Date(config.startTime).getTime();
      const end = new Date(config.endTime).getTime();
      const now = new Date().getTime();

      if (now < start) {
        setTimeLeft(start - now);
        setIsWarActive(false);
      } else if (now < end) {
        setTimeLeft(end - now);
        setIsWarActive(true);
      } else {
        setTimeLeft(-1);
        setIsWarActive(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  const isBatchAllowed = () => {
    if (!config?.targetAngkatan || config.targetAngkatan === "All") return true;
    const allowed = config.targetAngkatan.split(",").map((a: string) => a.trim());
    return studentData?.angkatan && allowed.includes(studentData.angkatan);
  };

  const handlePickDosen = async (dosenId: string, rencanaJudul: string) => {
    setConfirmingDosen(null);
    setLoading(true);
    try {
      const res = await fetch("/api/war/select", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dosenId, rencanaJudul }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memilih dosen.");
      }

      toast({
        title: t("toast_success_title"),
        description: `${t("dash_student_selected_desc")} ${data.lecturerName}.`,
        variant: "success",
      });
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0d9488", "#34d399", "#fb923c"]
      });

      fetchDosen();
      fetchStudentData();
    } catch (err: any) {
      const errorMsg =
        err.name === "TypeError" ? "Koneksi terputus. Coba lagi." : err.message;
      toast({
        title: "ERROR",
        description: errorMsg.toUpperCase(),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (config?.category === "MAGANG") {
      if (!profileForm.magangPosisi?.trim() || !profileForm.magangTempat?.trim()) {
        toast({
          title: "DATA MAGANG WAJIB",
          description: "Silakan isi posisi dan tempat magang Anda.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
    } else if (config?.category === "PLP") {
      if (!profileForm.plpLokasi?.trim()) {
        toast({
          title: "LOKASI PLP WAJIB",
          description: "Silakan isi lokasi & rencana PLP Anda.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
    } else {
      if (!profileForm.rencanaJudul?.trim()) {
        toast({
          title: "RENCANA JUDUL WAJIB",
          description: "Silakan isi rencana judul riset Anda.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
    }
    
    // Only send fields relevant to the active WAR category to avoid cross-contamination
    const basePayload = {
      nim: profileForm.nim,
      nama: profileForm.nama,
      kontak: profileForm.kontak,
      peminatan: profileForm.peminatan,
      bio: profileForm.bio,
      foto: profileForm.foto,
    };
    let payload: any;
    if (config?.category === "MAGANG") {
      payload = { ...basePayload, magangPosisi: profileForm.magangPosisi, magangTempat: profileForm.magangTempat };
    } else if (config?.category === "PLP") {
      payload = { ...basePayload, plpLokasi: profileForm.plpLokasi };
    } else {
      payload = { ...basePayload, rencanaJudul: profileForm.rencanaJudul };
    }

    if (isProfileIncomplete) {
      if (!profileForm.foto || profileForm.foto.includes("unsplash.com")) {
        toast({
          title: "FOTO PROFIL WAJIB",
          description: "Silakan unggah foto profil Anda terlebih dahulu.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
      if (!profileForm.kontak || !profileForm.kontak.trim()) {
        toast({
          title: "NOMOR WHATSAPP WAJIB",
          description: "Silakan isi nomor WhatsApp Anda terlebih dahulu.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
      if (!newPassword) {
        toast({
          title: "PASSWORD WAJIB",
          description: "Silakan atur password baru Anda terlebih dahulu.",
          variant: "error",
        });
        setLoading(false);
        return;
      }
    }

    try {
      if (newPassword) {
        if (newPassword.length < 6) {
          throw new Error("Password baru minimal 6 karakter.");
        }
        if (newPassword !== confirmPassword) {
          throw new Error("Konfirmasi password tidak cocok.");
        }
        const passRes = await fetch("/api/student/password", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newPassword }),
        });
        if (!passRes.ok) {
          const passData = await passRes.json();
          throw new Error(passData.error || "Gagal memperbarui password.");
        }
      }

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Gagal memperbarui profil.");
      toast({
        title: t("toast_profile_updated_title"),
        description: t("toast_profile_updated_desc"),
        variant: "success",
      });
      setNewPassword("");
      setConfirmPassword("");
      setIsProfileModalOpen(false);
      fetchStudentData();
    } catch (err: any) {
      toast({
        title: "ERROR",
        description: err.message.toUpperCase(),
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: t("toast_file_too_large_title"),
        description: t("toast_file_too_large_desc"),
        variant: "error",
      });
      return;
    }

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
      toast({
        title: t("toast_upload_success_title"),
        description: t("toast_upload_success_desc"),
        variant: "success",
      });
    } catch (err: any) {
      toast({
        title: "ERROR UPLOAD",
        description: err.message.toUpperCase(),
        variant: "error",
      });
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
  const profileStatus = (() => {
    const cat = config?.category || "SKRIPSI_ARTIKEL";
    if (cat === "MAGANG") {
      const hasData = !!(studentData?.magangPosisi && studentData?.magangTempat);
      return {
        completed: hasData,
        title: hasData ? `${studentData.magangPosisi} - ${studentData.magangTempat}` : "",
        errorMessage: "ISI DATA MAGANG TERLEBIH DAHULU"
      };
    } else if (cat === "PLP") {
      const hasData = !!studentData?.plpLokasi;
      return {
        completed: hasData,
        title: hasData ? studentData.plpLokasi : "",
        errorMessage: "ISI LOKASI PLP TERLEBIH DAHULU"
      };
    } else {
      const hasData = !!studentData?.rencanaJudul;
      return {
        completed: hasData,
        title: hasData ? studentData.rencanaJudul : "",
        errorMessage: "ISI RENCANA JUDUL TERLEBIH DAHULU"
      };
    }
  })();
  const labels = (() => {
    const cat = config?.category || "SKRIPSI_ARTIKEL";
    if (cat === "MAGANG") {
      return {
        dosenChoice: "Dosen Pembimbing Magang Pilihan",
        selected: "Dosen Magang Terpilih",
        timelineLabel: "Milestone Pemilihan Magang",
        step2Title: "Input Posisi & Mitra Magang",
        step2Desc: profileStatus.title || "Posisi dan lokasi magang belum diisi",
        step3Title: "Dosen Magang Dikunci",
        step3Desc: "Dosen Pembimbing Magang telah resmi dikunci dan disetujui",
        guidanceStatus: "Status Pembimbing Magang",
      };
    } else if (cat === "PLP") {
      return {
        dosenChoice: "Dosen Pembimbing PLP Pilihan",
        selected: "Dosen PLP Terpilih",
        timelineLabel: "Milestone Pemilihan PLP",
        step2Title: "Input Lokasi & Mitra PLP",
        step2Desc: profileStatus.title || "Lokasi PLP belum diisi",
        step3Title: "Dosen PLP Dikunci",
        step3Desc: "Dosen Pembimbing PLP telah resmi dikunci dan disetujui",
        guidanceStatus: "Status Pembimbing PLP",
      };
    } else {
      return {
        dosenChoice: t("dash_student_dosen_choice"),
        selected: t("dash_student_selected"),
        timelineLabel: t("dash_student_timeline_label") && !t("dash_student_timeline_label").includes("TIMELINE") ? t("dash_student_timeline_label") : "Milestone Pemilihan Skripsi",
        step2Title: "Input Rencana Judul",
        step2Desc: profileStatus.title || "Rencana judul skripsi belum diisi",
        step3Title: "Pilihan Dosen Dikunci",
        step3Desc: "Kandidat pembimbing skripsi berhasil dikunci dan terdaftar",
        guidanceStatus: t("dash_student_guidance_status"),
      };
    }
  })();

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>
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
                      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop"
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
                  {t("dash_student_nim_label")}
                </p>
                <p className="text-xl font-mono font-black text-teal-950">
                  {studentData?.nim || "-----"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Info */}
          <div className="xl:col-span-2 bg-white border border-teal-50 rounded-[2.5rem] p-10 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-orange-400 to-teal-500"></div>

            <div className="space-y-1 relative z-10">
              <h2 className={cn(
                "text-[10px] font-black uppercase tracking-[0.3em] mb-2 flex items-center gap-2",
                config?.category === "MAGANG" ? "text-indigo-500" :
                config?.category === "PLP" ? "text-rose-500" :
                "text-emerald-500"
              )}>
                <div className={cn(
                  "w-2 h-2 rounded-full animate-ping",
                  config?.category === "MAGANG" ? "bg-indigo-500" :
                  config?.category === "PLP" ? "bg-rose-500" :
                  "bg-emerald-500"
                )} />
                {config?.category ? t(`cat_${config.category.toLowerCase()}`) : "Live War System"}
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

        {/* Batch-specific Announcement Banner */}
        {config?.announcement && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{t("dash_student_info_important")}</Alert.Title>
                <Alert.Description>{config.announcement}</Alert.Description>
              </Alert.Content>
            </Alert>
          </motion.div>
        )}

        {/* Selected Lecturer Status */}
        {studentData?.dosen && (
          <div className="bg-gradient-to-br from-[#061814] via-[#0b2b24] to-[#04120f] rounded-[2.5rem] p-10 shadow-2xl shadow-teal-950/40 text-white border border-teal-500/20 relative overflow-hidden">
            {/* Glowing mesh gradient background accents */}
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-60 h-60 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-stretch gap-8">

              {/* LEFT — Dosen Card with photo */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">{t("dash_student_status")}</h3>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-inner flex-1 flex flex-col justify-center">
                  <p className="text-[9px] font-black uppercase text-teal-500/50 mb-5 tracking-[0.2em]">{labels.dosenChoice}</p>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Dosen Photo */}
                    <div className="relative shrink-0">
                      <div className="w-24 h-24 rounded-[1.75rem] overflow-hidden bg-teal-950 border border-teal-500/30 p-1 shadow-2xl ring-1 ring-white/10">
                        {studentData.dosen.foto ? (
                          <img src={studentData.dosen.foto} alt={studentData.dosen.nama} className="w-full h-full object-cover rounded-[1.5rem]" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-teal-900 rounded-[1.5rem]">
                            <GraduationCap className="w-10 h-10 text-teal-400" />
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border border-teal-950 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Dosen Info */}
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1 min-w-0">
                      <div className="inline-flex items-center px-2 py-0.5 bg-teal-500/10 text-teal-300 border border-teal-500/20 rounded-full text-[8px] font-black uppercase tracking-widest mb-1">
                        {labels.selected}
                      </div>
                      <span className="text-xl font-black text-white tracking-tight leading-tight mb-0.5">{studentData.dosen.nama}</span>
                      <span className="text-[11px] font-semibold text-teal-400/80 font-mono">NIP. {studentData.dosen.nip}</span>
                      {studentData.dosen.keahlian && (
                        <span className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mt-1">{studentData.dosen.keahlian}</span>
                      )}
                      
                      {studentData.dosen.kontak && (
                        <a
                          href={(() => {
                            let cleaned = studentData.dosen.kontak.replace(/\D/g, "");
                            if (cleaned.startsWith("0")) {
                              cleaned = "62" + cleaned.slice(1);
                            } else if (cleaned.startsWith("8")) {
                              cleaned = "62" + cleaned;
                            }
                            return `https://wa.me/${cleaned}`;
                          })()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 group cursor-pointer shadow-lg shadow-emerald-950/20"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                          <span>{studentData.dosen.kontak}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-4 w-full xl:w-auto xl:flex-col xl:h-auto xl:justify-center">
                <div className="h-px bg-gradient-to-r from-transparent via-teal-800 to-transparent flex-1 xl:w-px xl:h-20"></div>
                <span className="text-[9px] font-black uppercase text-teal-500/30 tracking-[0.6em] xl:rotate-90 py-2">STATUS</span>
                <div className="h-px bg-gradient-to-r from-transparent via-teal-800 to-transparent flex-1 xl:w-px xl:h-20"></div>
              </div>

              {/* RIGHT — Status & Milestone Timeline */}
              <div className="flex-1 w-full flex flex-col justify-between">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-[9px] font-black uppercase text-teal-500/50 tracking-[0.2em]">{labels.guidanceStatus}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border mt-1",
                      studentData.statusBimbingan === "APPROVED"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                        : "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]"
                    )}>
                      {(studentData.statusBimbingan === "APPROVED" || studentData.dosenId) ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3 animate-spin" />}
                      {(studentData.statusBimbingan === "APPROVED" || studentData.dosenId) ? t("status_registered") : t("status_pending")}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-teal-500/50 tracking-[0.2em]">{t("dash_student_angkatan")}</p>
                    <span className="inline-block mt-1 px-3 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-xs font-black text-teal-200 font-mono tracking-tight">
                      {studentData.periode || config?.periode || "-"}
                    </span>
                  </div>
                </div>

                {/* Milestone Stepper / Timeline - Fills the empty space beautifully */}
                <div className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-inner flex-1 flex flex-col justify-center gap-4">
                  <p className="text-[9px] font-black uppercase text-teal-500/50 tracking-[0.2em] mb-1">{labels.timelineLabel}</p>
                  
                  <div className="relative pl-6 space-y-5">
                    {/* Vertical line connecting steps */}
                    <div className="absolute left-[7px] top-1.5 bottom-1.5 w-[2px] bg-teal-950/80 border-l border-dashed border-teal-500/30" />

                    {/* Step 1: Registrasi Akun */}
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-white uppercase tracking-wider leading-none mb-1">Registrasi Akun</p>
                        <p className="text-[10px] font-bold text-teal-400/60 leading-tight">Akun mahasiswa telah aktif dan terverifikasi di prodi</p>
                      </div>
                    </div>

                    {/* Step 2: Rencana Judul Skripsi */}
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-white uppercase tracking-wider leading-none mb-1">{labels.step2Title}</p>
                        <p className="text-[10px] font-bold text-teal-400/60 leading-tight truncate max-w-[280px]" title={profileStatus.title || "Belum diisi"}>
                          {labels.step2Desc}
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Pilihan Dosen */}
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-[23px] w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider leading-none mb-1">{labels.step3Title}</p>
                        <p className="text-[10px] font-bold text-teal-400/60 leading-tight">{labels.step3Desc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* HIDDEN BUKTI TEMPLATE FOR PDF */}
            <div className="hidden">
              <div id="bukti-pemilihan" className="p-16 bg-white w-[800px] text-teal-950 font-sans">
                <div className="flex items-center justify-between border-b-4 border-teal-500 pb-8 mb-10">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter">{t("dash_student_proof_title")}</h1>
                    <p className="text-sm font-bold text-teal-500 tracking-[0.3em] uppercase">WarDosen</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">{t("dash_student_print_date")}</p>
                    <p className="text-sm font-bold">{new Date().toLocaleString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-1">{t("dash_student_data")}</h3>
                      <p className="text-xl font-black">{studentData.nama}</p>
                      <p className="text-sm font-bold text-teal-600">NIM. {studentData.nim}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-1">{t("dash_student_periode")}</h3>
                      <p className="text-sm font-bold">{studentData.periode || config?.periode || "-"}</p>
                    </div>
                  </div>
                  <div className="p-8 bg-teal-50 rounded-3xl border border-teal-100">
                    <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3">{t("dash_student_dosen_selected")}</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-teal-500 shadow-sm border border-teal-100 overflow-hidden">
                        {studentData.dosen?.foto ? (
                          <img src={studentData.dosen.foto} crossOrigin="anonymous" className="w-full h-full object-cover" />
                        ) : (
                          <GraduationCap className="w-8 h-8" />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-black text-teal-950">{studentData.dosen?.nama}</p>
                        <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest">NIP. {studentData.dosen?.nip}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-2 border-dashed border-teal-100 rounded-3xl mb-12">
                  <h3 className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-2">
                    {config?.category === "MAGANG" ? "Posisi & Mitra Magang" : config?.category === "PLP" ? "Lokasi & Mitra PLP" : t("dash_student_title_plan")}
                  </h3>
                  <p className="text-sm font-medium italic text-teal-800 leading-relaxed">
                    "{profileStatus.title || "Belum ditentukan"}"
                  </p>
                </div>

                <div className="flex justify-between items-end pt-10 border-t border-teal-50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Status</p>
                    <div className="px-4 py-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full inline-block">{t("dash_student_verified")}</div>
                  </div>
                  <div className="text-center w-48">
                    <div className="h-20 mb-2 border-b border-teal-100"></div>
                    <p className="text-[10px] font-black text-teal-950 uppercase tracking-widest">Admin Prodi PTI</p>
                  </div>
                </div>
                
                <div className="mt-16 text-center">
                  <p className="text-[8px] font-bold text-teal-200 uppercase tracking-[0.5em]">Dokumen ini dihasilkan secara otomatis oleh sistem WarDosen</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar & Lecturers Grid */}
        {!studentData?.dosen && (
          <>
            <div className="flex items-center gap-4 py-4">
              <div className="h-px bg-teal-100 flex-1"></div>
              <span className="text-[10px] font-black uppercase text-teal-800/50 tracking-[0.5em]">
                {t("dash_student_database_dosen")}
              </span>
              <div className="h-px bg-teal-100 flex-1"></div>
            </div>

            <div className="relative mb-6 flex items-center bg-white border border-teal-100 rounded-[1.5rem] hover:border-teal-200 focus-within:border-teal-500 shadow-sm px-6 py-4">
              <Search className="w-4 h-4 text-teal-400 shrink-0 mr-3" />
              <Input
                type="text"
                value={searchDosen}
                onChange={(e) => setSearchDosen(e.target.value)}
                placeholder={t("dash_student_search_placeholder")}
                variant="primary"
                className="w-full text-sm font-bold text-teal-950 placeholder:text-teal-300 bg-transparent outline-none border-none p-0 focus:ring-0 focus:outline-none"
              />
              {searchDosen && (
                <button
                  type="button"
                  onClick={() => setSearchDosen("")}
                  className="p-1 hover:bg-teal-50 rounded-full transition-all text-teal-400 hover:text-teal-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {initialLoading ? (
                Array.from({ length: 6 }).map((_, i) => <DosenCardSkeleton key={i} />)
              ) : (
                dosenList.filter(d =>
                  d.nama?.toLowerCase().includes(searchDosen.toLowerCase()) ||
                  d.keahlian?.toLowerCase().includes(searchDosen.toLowerCase())
                ).map((dosen, index) => (
                  <motion.div
                    key={dosen.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white border border-teal-50 rounded-[3rem] p-10 shadow-sm hover:shadow-xl hover:border-teal-200 hover:-translate-y-3 transition-all duration-700 flex flex-col relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 blur-[60px]" />

                    <div className="flex flex-col items-center text-center mb-10 relative">
                      <div className="relative mb-6">
                        <div className="w-28 h-28 rounded-[2.25rem] bg-white p-1 relative z-10 shadow-xl border border-teal-50 overflow-hidden">
                          <img
                            src={dosen.foto || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"}
                            alt={dosen.nama}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        </div>
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white shadow-lg z-20",
                          dosen.kuotaMax - dosen._count.mahasiswa > 0 ? "bg-teal-500" : "bg-rose-500"
                        )} />
                      </div>

                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 rounded-full border border-teal-100">
                          <p className="text-[8px] text-teal-600 uppercase tracking-[0.2em] font-black">NIP. {dosen.nip}</p>
                        </div>
                        <h3 className="font-black text-2xl text-teal-950 group-hover:text-teal-600 transition-colors tracking-tighter leading-tight">{dosen.nama}</h3>
                        <p className="text-[10px] font-bold text-teal-800/40 uppercase tracking-widest">{dosen.keahlian || "Pendidikan Teknologi Informasi"}</p>
                      </div>
                    </div>

                    <div className="space-y-6 flex-1 relative">
                      <div className="p-6 bg-teal-50/50 rounded-[2.5rem] border border-teal-100/50 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-[9px] uppercase font-black text-teal-800/30 tracking-widest mb-1">{t("dash_student_availability")}</p>
                            <p className={cn("text-3xl font-black font-mono tracking-tighter", dosen.kuotaMax - dosen._count.mahasiswa > 0 ? "text-teal-950" : "text-rose-500")}>
                              {dosen.kuotaMax - dosen._count.mahasiswa} <span className="text-[10px] text-teal-800/30">SLOT</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] uppercase font-black text-teal-800/30 tracking-widest mb-1">{t("dash_student_capacity")}</p>
                            <p className="text-xs font-black text-teal-800/60">{dosen._count.mahasiswa} / {dosen.kuotaMax}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <ProgressBar
                            value={(dosen._count.mahasiswa / dosen.kuotaMax) * 100}
                            color={dosen.kuotaMax - dosen._count.mahasiswa > 0 ? "accent" : "danger"}
                            size="md"
                          >
                            <ProgressBar.Track className="bg-white border border-teal-100 rounded-full h-2 overflow-hidden p-0.5">
                              <ProgressBar.Fill className={dosen.kuotaMax - dosen._count.mahasiswa > 0 ? "bg-teal-500" : "bg-rose-500"} />
                            </ProgressBar.Track>
                          </ProgressBar>
                        </div>
                      </div>

                      {config?.category === "SKRIPSI_ARTIKEL" ? (
                        <div className="space-y-2 mt-4 flex-1 flex flex-col justify-end">
                          {dosen.penelitian?.map((p: any) => (
                            <Button
                              key={p.id}
                              onClick={() => setConfirmingDosen({ dosen, title: p.judul })}
                              isDisabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed() || !profileStatus.completed}
                              variant="secondary"
                              className={cn(
                                "w-full py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-300 text-left truncate border h-auto min-h-0",
                                isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed() && profileStatus.completed
                                  ? "bg-teal-50 text-teal-800 border-teal-100 hover:bg-teal-500 hover:text-white hover:border-teal-500 shadow-sm"
                                  : "bg-slate-50 text-slate-400 border-slate-100"
                              )}
                            >
                              PILIH: {p.judul}
                            </Button>
                          ))}
                          <Button
                            onClick={() => setConfirmingDosen({ dosen, title: profileStatus.title })}
                            isDisabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed() || !profileStatus.completed}
                            className={cn(
                              "w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-sm mt-2 h-auto",
                              isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed() && profileStatus.completed
                                ? "bg-teal-950 text-white hover:bg-teal-800 border border-teal-900"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            )}
                          >
                            PILIH (JUDUL DARI PROFIL)
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setConfirmingDosen({ dosen, title: profileStatus.title })}
                          isDisabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed() || !profileStatus.completed}
                          className={cn(
                            "w-full py-6 mt-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl overflow-hidden relative h-auto min-h-[56px]",
                            isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed() && profileStatus.completed
                              ? "bg-teal-950 text-white hover:bg-teal-500 shadow-teal-950/20 hover:-translate-y-1"
                              : "bg-teal-50 text-teal-800/20 border border-teal-100"
                          )}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 
                              config?.isForcedClosed ? t("dash_student_system_closed") :
                              !isWarActive ? t("dash_student_waiting_war") : 
                              !isBatchAllowed() ? t("dash_student_access_denied") :
                              !profileStatus.completed ? "ISI PROFIL TERLEBIH DAHULU" :
                              dosen.kuotaMax - dosen._count.mahasiswa <= 0 ? t("dash_student_quota_full") : t("dash_student_pick_advisor")}
                          </span>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </>
        )}

        {/* Modals: Same as before but with updated styling if needed */}
        <AnimatePresence>
           {/* Confirm Dosen Modal */}
           {confirmingDosen && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmingDosen(null)} className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
                 <div className="relative space-y-6 text-center">
                   <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 mx-auto mb-6">
                     <Info className="w-8 h-8" />
                   </div>
                   <h2 className="text-2xl font-black text-teal-950 leading-tight">{t("dash_student_confirm_choice")}</h2>
                   <p className="text-sm text-teal-800/60 font-medium">Anda akan memilih <span className="font-black text-teal-900">{confirmingDosen.dosen.nama}</span>.</p>
                   
                   <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100/50 text-left">
                     <p className="text-[10px] font-black uppercase tracking-widest text-teal-800/40 mb-1">
                       {config?.category === "MAGANG" ? t("dash_dosen_title_magang") : config?.category === "PLP" ? t("dash_dosen_title_plp") : t("dash_dosen_title_plan")}
                     </p>
                     <p className="text-xs font-bold text-teal-950">{confirmingDosen.title}</p>
                   </div>

                   <div className="flex flex-col gap-3">
                     <button onClick={() => handlePickDosen(confirmingDosen.dosen.id, confirmingDosen.title)} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg">{t("dash_student_yes_sure")}</button>
                     <button onClick={() => setConfirmingDosen(null)} className="w-full py-4 bg-teal-50 text-teal-800/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all">{t("dash_student_cancel")}</button>
                   </div>
                 </div>
               </motion.div>
             </div>
           )}

           {/* Profile Settings Modal */}
           {isProfileModalOpen && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => {
                    if (!isProfileIncomplete) {
                      setIsProfileModalOpen(false);
                    }
                  }} 
                  className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm" 
                />
                <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-10 pb-4 shrink-0">
                    <h2 className="text-2xl font-black text-teal-950">{t("dash_student_profile_custom")}</h2>
                    {!isProfileIncomplete && (
                      <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-teal-50 rounded-xl transition-all"><XCircle className="w-6 h-6 text-teal-200" /></button>
                    )}
                  </div>

                 <div className="flex-1 overflow-y-auto px-10 pb-10 pt-2 custom-scrollbar">
                   <form onSubmit={handleUpdateProfile} className="space-y-6">
                     <div className="flex flex-col items-center gap-4 py-6 bg-teal-50/50 border border-dashed border-teal-100 rounded-[2rem]">
                        <div className="relative group">
                          <div className="w-24 h-24 rounded-3xl bg-white border-2 border-teal-50 overflow-hidden shadow-inner">
                            <img src={profileForm.foto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop"} className="w-full h-full object-cover" alt="Preview" />
                          </div>
                          <label htmlFor="photo-upload" className="absolute inset-0 flex items-center justify-center bg-teal-950/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-3xl"><Camera className="w-6 h-6 text-white" /></label>
                          <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        </div>
                        <p className="text-[10px] font-black uppercase text-teal-500 tracking-widest">{t("dash_student_change_photo")}</p>
                     </div>

                     <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">NIM (Nomor Induk Mahasiswa)</label>
                          <input value={profileForm.nim} disabled className="w-full bg-teal-50/50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950/40 cursor-not-allowed focus:outline-none animate-pulse-subtle" />
                       </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">{t("dash_student_fullname")}</label>
                        <input value={profileForm.nama} onChange={(e) => setProfileForm({...profileForm, nama: e.target.value})} className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" required />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">{t("dash_student_contact")}</label>
                        <input value={profileForm.kontak} onChange={(e) => setProfileForm({...profileForm, kontak: e.target.value})} className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" placeholder="08..." />
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">{t("dash_student_bio")}</label>
                        <textarea value={profileForm.bio} onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none min-h-[100px]" placeholder="Ceritakan sedikit tentang ketertarikan riset Anda..." />
                     </div>

                     {config?.category === "MAGANG" ? (
                         <div className="flex flex-col md:flex-row gap-4">
                           <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Posisi Magang</label>
                             <input 
                               value={profileForm.magangPosisi} 
                               onChange={(e) => setProfileForm({...profileForm, magangPosisi: e.target.value})} 
                               className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" 
                               placeholder="Misal: UI/UX Designer" 
                               required 
                             />
                           </div>
                           <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Tempat / Instansi</label>
                             <input 
                               value={profileForm.magangTempat} 
                               onChange={(e) => setProfileForm({...profileForm, magangTempat: e.target.value})} 
                               className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" 
                               placeholder="Misal: PT. Telkom Indonesia" 
                               required 
                             />
                           </div>
                         </div>
                      ) : config?.category === "PLP" ? (
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                             Lokasi & Rencana PLP
                           </label>
                           <input 
                             value={profileForm.plpLokasi} 
                             onChange={(e) => setProfileForm({...profileForm, plpLokasi: e.target.value})} 
                             className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" 
                             placeholder="Misal: SMKN 1 Surabaya" 
                             required 
                           />
                        </div>
                      ) : (
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                             Rencana Judul Riset Anda
                           </label>
                           <textarea 
                             value={profileForm.rencanaJudul} 
                             onChange={(e) => setProfileForm({...profileForm, rencanaJudul: e.target.value})} 
                             className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none min-h-[80px]" 
                             placeholder="Ketik disini..." 
                             required 
                           />
                        </div>
                      )}

                      <div className="border-t border-teal-100/50 pt-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">Setup / Ganti Password</p>
                        <div className="flex flex-col md:flex-row gap-4">
                           <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Password Baru (Opsional)</label>
                             <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" placeholder="Minimal 6 karakter" />
                           </div>
                           <div className="flex-1 space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Konfirmasi Password</label>
                             <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" placeholder="Ulangi password baru" />
                           </div>
                        </div>
                      </div>

                     <button type="submit" disabled={loading} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg">{loading ? t("dash_student_saving") : t("dash_student_save_changes")}</button>
                   </form>
                 </div>
               </motion.div>
             </div>
           )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default Dashboard;

