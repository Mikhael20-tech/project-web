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
  Download,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { socket } from "@/src/lib/socket";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/components/ToastProvider";
import { useLanguage } from "@/src/lib/LanguageContext";

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
  const [selectingDosenForJudul, setSelectingDosenForJudul] = useState<any>(null);
  const [rencanaJudulInput, setRencanaJudulInput] = useState("");
  const [searchDosen, setSearchDosen] = useState("");

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
    try {
      const res = await fetch("/api/war/cancel", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan pemilihan.");

      toast({
        title: "DIBATALKAN",
        description: "PEMILIHAN DOSEN BERHASIL DIBATALKAN.",
        variant: "success",
      });
      await Promise.all([fetchStudentData(), fetchDosen()]);
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

    socket.on("quota_update", (updatedList: any[]) => {
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

  const isBatchAllowed = () => {
    if (!config?.targetAngkatan || config.targetAngkatan === "All") return true;
    const allowed = config.targetAngkatan.split(",").map((a: string) => a.trim());
    return studentData?.angkatan && allowed.includes(studentData.angkatan);
  };

  const handlePickDosen = async (dosenId: string, rencanaJudul: string) => {
    setSelectingDosenForJudul(null);
    setRencanaJudulInput("");
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
        title: "BERHASIL",
        description: `ANDA MENDAPATKAN ${data.lecturerName}.`,
        variant: "success",
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
      toast({
        title: "PROFIL DIPERBARUI",
        description: "PROFIL BERHASIL DIPERBARUI!",
        variant: "success",
      });
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
  
  const downloadBukti = async () => {
    const element = document.getElementById("bukti-pemilihan");
    if (!element) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Bukti_Pemilihan_${studentData.nim}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
      toast({ title: "ERROR", description: "GAGAL MENGUNDUH PDF", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "FILE TERLALU BESAR",
        description: "UKURAN FOTO MAKSIMAL 2MB",
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
        title: "UPLOAD BERHASIL",
        description: "Foto profil berhasil diperbarui.",
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

        {/* Batch-specific Announcement Banner */}
        {config?.announcement && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-orange-50 border border-orange-100 p-6 rounded-[2.5rem] flex items-center gap-6 shadow-sm"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-400 mb-1">{t("dash_student_info_important")}</h4>
              <p className="text-sm font-bold text-orange-800 leading-tight">
                {config.announcement}
              </p>
            </div>
          </motion.div>
        )}

        {/* Selected Lecturer Status */}
        {studentData?.dosen && (
          <div className="bg-gradient-to-br from-teal-900 to-[#022c22] rounded-[2.5rem] p-8 shadow-2xl shadow-teal-900/20 text-white border border-teal-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300">{t("dash_student_status")}</h3>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl mb-8">
                  <p className="text-[10px] font-black uppercase text-teal-400/60 mb-4 tracking-widest">{t("dash_student_dosen_choice")}</p>
                  <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 p-4 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-black text-emerald-400/70 tracking-widest">{t("dash_student_selected")}</span>
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
                    {loading ? "MEMBATALKAN..." : t("dash_student_cancel")}
                  </button>
                )}
              </div>

              {/* Status Section Divider */}
              <div className="flex items-center gap-4 py-4 w-full md:w-auto md:flex-col md:h-20">
                <div className="h-px bg-teal-800 flex-1 md:w-px md:h-full"></div>
                <span className="text-[10px] font-black uppercase text-teal-500/30 tracking-[0.5em] md:rotate-90">INFO</span>
                <div className="h-px bg-teal-800 flex-1 md:w-px md:h-full"></div>
              </div>

              <div className="flex-1 w-full">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                   <p className="text-[10px] font-black uppercase text-teal-400/60 mb-2 tracking-widest">{t("dash_student_guidance_status")}</p>
                   <div className={cn(
                     "inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest",
                     studentData.statusBimbingan === "APPROVED" 
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                   )}>
                      {(studentData.statusBimbingan === "APPROVED" || studentData.dosenId) ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCcw className="w-3 h-3 animate-spin" />}
                      {(studentData.statusBimbingan === "APPROVED" || studentData.dosenId) ? t("status_registered") : t("status_pending")}
                   </div>
                   <div className="mt-4">
                      <p className="text-[10px] font-black uppercase text-teal-400/30 mb-1 tracking-widest">{t("dash_student_angkatan")}</p>
                      <p className="text-sm font-bold text-teal-100">{studentData.periode || config?.periode || "-"}</p>
                   </div>
                   <button 
                      onClick={downloadBukti}
                      disabled={loading}
                      className="w-full mt-6 py-3 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <Download className="w-4 h-4" /> {loading ? "MENGOLAH..." : t("download_proof")}
                   </button>
                </div>
              </div>
            </div>
            
            {/* HIDDEN BUKTI TEMPLATE FOR PDF */}
            <div className="hidden">
              <div id="bukti-pemilihan" className="p-16 bg-white w-[800px] text-teal-950 font-sans">
                <div className="flex items-center justify-between border-b-4 border-teal-500 pb-8 mb-10">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter">{t("dash_student_proof_title")}</h1>
                    <p className="text-sm font-bold text-teal-500 tracking-[0.3em] uppercase">War Dosen PTI UNESA</p>
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
                          <img src={studentData.dosen.foto} className="w-full h-full object-cover" />
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
                  <h3 className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-2">{t("dash_student_title_plan")}</h3>
                  <p className="text-sm font-medium italic text-teal-800 leading-relaxed">
                    "{studentData.rencanaJudul || "Belum ditentukan"}"
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
                  <p className="text-[8px] font-bold text-teal-200 uppercase tracking-[0.5em]">Dokumen ini dihasilkan secara otomatis oleh sistem WarDosen PTI UNESA</p>
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

            <div className="relative mb-6">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-teal-400" />
              </div>
              <input
                type="text"
                value={searchDosen}
                onChange={(e) => setSearchDosen(e.target.value)}
                placeholder={t("dash_student_search_placeholder")}
                className="w-full pl-11 pr-4 py-4 bg-white border border-teal-100 rounded-[1.5rem] text-sm font-bold text-teal-950 placeholder:text-teal-300 focus:outline-none focus:ring-4 focus:ring-teal-500/10 shadow-sm transition-all"
              />
              {searchDosen && (
                <button onClick={() => setSearchDosen("")} className="absolute inset-y-0 right-4 flex items-center text-teal-300 hover:text-teal-500">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dosenList.filter(d =>
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
                        <div className="w-full h-2 bg-white rounded-full overflow-hidden p-0.5 border border-teal-100">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(dosen._count.mahasiswa / dosen.kuotaMax) * 100}%` }}
                            transition={{ duration: 1 }}
                            className={cn("h-full rounded-full", dosen.kuotaMax - dosen._count.mahasiswa > 0 ? "bg-teal-500" : "bg-rose-500")}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectingDosenForJudul(dosen)}
                      disabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed()}
                      className={cn(
                        "w-full py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl overflow-hidden relative",
                        isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed()
                          ? "bg-teal-950 text-white hover:bg-teal-500 shadow-teal-950/20 hover:-translate-y-2"
                          : "bg-teal-50 text-teal-800/20 cursor-not-allowed border border-teal-100"
                      )}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 
                          (config?.isForcedClosed ? t("dash_student_system_closed") :
                          (!isWarActive ? t("dash_student_waiting_war") : 
                          (!isBatchAllowed() ? t("dash_student_access_denied") :
                          (dosen.kuotaMax - dosen._count.mahasiswa <= 0 ? t("dash_student_quota_full") : t("dash_student_pick_advisor")))))}
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))}
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
                   <p className="text-sm text-teal-800/60 font-medium">Anda akan memilih <span className="font-black text-teal-900">{confirmingDosen.nama}</span> sebagai dosen pembimbing.</p>
                   <div className="flex flex-col gap-3">
                     <button onClick={() => handlePickDosen(confirmingDosen.id, rencanaJudulInput)} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg">{t("dash_student_yes_sure")}</button>
                     <button onClick={() => setConfirmingDosen(null)} className="w-full py-4 bg-teal-50 text-teal-800/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all">{t("dash_student_cancel")}</button>
                   </div>
                 </div>
               </motion.div>
             </div>
           )}

           {/* Rencana Judul Modal */}
           {selectingDosenForJudul && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectingDosenForJudul(null)} className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
                 <div className="relative space-y-6">
                    <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-500">{t("dash_student_step_1")}</h3>
                      <h2 className="text-2xl font-black text-teal-950">{t("dash_student_thesis_plan")}</h2>
                      <p className="text-sm text-teal-800/60 font-medium pt-1">Beritahu <span className="font-black text-teal-700">{selectingDosenForJudul.nama}</span> topik riset Anda.</p>
                    </div>
                    <textarea
                      value={rencanaJudulInput}
                      onChange={(e) => setRencanaJudulInput(e.target.value)}
                      placeholder="Contoh: Analisis User Interface pada Aplikasi Pendidikan..."
                      rows={4}
                      className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none resize-none"
                    />
                    <div className="flex flex-col gap-3">
                      <button onClick={() => { setConfirmingDosen(selectingDosenForJudul); setSelectingDosenForJudul(null); }} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg flex items-center justify-center gap-2">LANJUT KONFIRMASI <ChevronRight className="w-4 h-4" /></button>
                      <button onClick={() => setSelectingDosenForJudul(null)} className="w-full py-4 bg-teal-50 text-teal-800/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all">{t("dash_student_cancel")}</button>
                    </div>
                 </div>
               </motion.div>
             </div>
           )}

           {/* Profile Settings Modal */}
           {isProfileModalOpen && (
             <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsProfileModalOpen(false)} className="absolute inset-0 bg-teal-950/60 backdrop-blur-sm" />
               <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
                 <div className="space-y-8">
                   <div className="flex justify-between items-center">
                     <h2 className="text-2xl font-black text-teal-950">{t("dash_student_profile_custom")}</h2>
                     <button onClick={() => setIsProfileModalOpen(false)} className="p-2 hover:bg-teal-50 rounded-xl transition-all"><XCircle className="w-6 h-6 text-teal-200" /></button>
                   </div>

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

                     <button type="submit" disabled={loading} className="w-full py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-950 transition-all shadow-lg">{loading ? t("dash_student_saving") : t("dash_student_save_changes")}</button>
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

export default Dashboard;
