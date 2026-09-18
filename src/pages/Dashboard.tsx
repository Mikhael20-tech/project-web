import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  User,
  KeyRound,
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
  Lock,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MessageSquare,
  FileText,
  Check,
  ShieldCheck,
  Sparkles,
  Award,
  Umbrella,
  History,
  Printer,
  FileCode,
  FileSpreadsheet,
  Headphones,
} from "lucide-react";
import { socket } from "@/src/lib/socket";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/components/ToastProvider";
import { useLanguage } from "@/src/lib/LanguageContext";
import DynamicText from "@/src/components/DynamicText";
import LoadingOverlay from "@/src/components/LoadingOverlay";
import DosenCardSkeleton from "@/src/components/DosenCardSkeleton";
import confetti from "canvas-confetti";
import { Alert, Input, Button, ProgressBar } from "@heroui/react";


const Dashboard = ({
  user: initialUser,
  token,
  onProfileUpdate,
  onLogout,
}: {
  user: any;
  token: string;
  onProfileUpdate: (s: any) => void;
  onLogout?: () => void;
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
      if (meRes.status === 401) {
        if (onLogout) {
          onLogout();
          return;
        }
      }
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
    if (confirmingDosen || isProfileModalOpen) {
      document.body.style.overflow = "hidden";
      document.body.classList.add("modal-open");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("modal-open");
    };
  }, [confirmingDosen, isProfileModalOpen]);

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
        dosenChoice: t("magang_dosen_choice"),
        selected: t("magang_selected"),
        timelineLabel: t("magang_timeline"),
        step2Title: t("magang_step2_title"),
        step2Desc: profileStatus.title || t("magang_step2_empty"),
        step3Title: t("magang_step3_title"),
        step3Desc: t("magang_step3_desc"),
        guidanceStatus: t("magang_guidance_status"),
      };
    } else {
      return {
        dosenChoice: t("dash_student_dosen_choice"),
        selected: t("dash_student_selected"),
        timelineLabel: t("dash_student_timeline_label") && !t("dash_student_timeline_label").includes("TIMELINE") ? t("dash_student_timeline_label") : "Milestone Pemilihan Tugas Akhir",
        step2Title: t("skripsi_step2_title"),
        step2Desc: profileStatus.title || t("skripsi_step2_empty"),
        step3Title: t("skripsi_step3_title"),
        step3Desc: t("skripsi_step3_desc"),
        guidanceStatus: t("dash_student_guidance_status"),
      };
    }
  })();



  return (
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>
      <div className="min-h-screen bg-[#F0FAF8] pt-28 pb-16 px-4 md:px-8">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {studentData?.dosen ? (
            /* ========================================================================= */
            /* POST-WAR VIEW: DOSEN BERHASIL TERPILIH (PURE WAR RESULT DASHBOARD)        */
            /* ========================================================================= */
            <div className="flex flex-col w-full gap-6">
              {/* 1. Header Banner: Status Pemilihan Sukses */}
              <div className="bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-teal-800">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      WAR SELESAI • SLOT KUOTA TERKUNCI
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                      Selamat, Pembimbing Anda Telah Ditetapkan!
                    </h1>
                    <p className="text-teal-200/80 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                      Alokasi kuota pembimbing Anda berhasil dikunci secara permanen di sistem <strong>WarDosPem</strong> periode {config?.periode || "2025/2026"}. Silakan menghubungi dosen pembimbing untuk koordinasi awal.
                    </p>
                  </div>

                  <div className="shrink-0 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 text-center md:text-right">
                    <span className="text-[10px] uppercase font-black tracking-wider text-teal-300 block">
                      Status Penetapan
                    </span>
                    <span className="text-emerald-400 font-mono text-xl sm:text-2xl font-black flex items-center justify-center md:justify-end gap-1.5 mt-0.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      RESMI TERKUNCI
                    </span>
                    <span className="text-[10px] text-teal-200/70 block mt-0.5">
                      Cluster PTI • UNESA
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Dua Kartu Berdampingan: Dosen Pembimbing & Ringkasan Usulan */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* 2.1 Kartu Dosen Pembimbing Terpilih (Col 1-7) */}
                <div className="lg:col-span-7 bg-white border border-teal-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                          Dosen Pembimbing Terpilih
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        KUOTA TERKUNCI
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start gap-5 mt-6">
                      <div className="relative shrink-0 mx-auto sm:mx-0">
                        <div className="w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 shadow-md border-2 border-teal-100">
                          {studentData.dosen.foto ? (
                            <img
                              className="w-full h-full object-cover"
                              src={studentData.dosen.foto}
                              alt={studentData.dosen.nama}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-teal-900 text-teal-200">
                              <GraduationCap className="w-12 h-12" />
                            </div>
                          )}
                        </div>
                        <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white">
                          <Check className="w-4 h-4" />
                        </span>
                      </div>

                      <div className="flex flex-col min-w-0 flex-1 text-center sm:text-left">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-teal-100 text-teal-800 w-fit mx-auto sm:mx-0">
                          PEMBIMBING UTAMA
                        </span>
                        <h2 className="text-xl font-black text-slate-900 mt-1.5 leading-snug">
                          {studentData.dosen.nama}
                        </h2>
                        <span className="font-mono text-xs font-bold text-slate-500 mt-0.5">
                          NIP: {studentData.dosen.nip}
                        </span>

                        {/* Bidang Keahlian */}
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center sm:justify-start">
                          {studentData.dosen.keahlian ? (
                            studentData.dosen.keahlian.split(",").map((k: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                {k.trim()}
                              </span>
                            ))
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              Dosen Pembimbing S1 PTI
                            </span>
                          )}
                        </div>

                        {studentData.dosen.moto && (
                          <p className="text-xs text-slate-500 italic mt-3 border-l-2 border-teal-500 pl-3 py-0.5">
                            &ldquo;{studentData.dosen.moto}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Kuota Kapasitas */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                      {(() => {
                        const currentDosenInList = dosenList.find((d: any) => d.id === studentData.dosen.id);
                        const occupied = currentDosenInList?._count?.mahasiswa ?? studentData.dosen._count?.mahasiswa ?? 1;
                        const maxQ = studentData.dosen.kuotaMax || 12;
                        const pct = Math.min(100, Math.round((occupied / maxQ) * 100));
                        const isFull = pct >= 100;
                        return (
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                              <span className="text-slate-500">
                                Kapasitas Kuota Bimbingan Angkatan {studentData.angkatan || config?.targetAngkatan || "2023"}
                              </span>
                              <span className={cn("font-mono font-black", isFull ? "text-rose-600" : "text-teal-700")}>
                                {occupied} / {maxQ} Kursi ({isFull ? "Penuh 100%" : `${pct}% Terisi`})
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
                              <div
                                className={cn("h-full rounded-full transition-all duration-500", isFull ? "bg-rose-500" : "bg-teal-600")}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Tombol Hubungi Dosen */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                    <a
                      className="flex-1 py-3 px-5 rounded-2xl bg-teal-700 text-white text-xs font-bold hover:bg-teal-800 transition-all shadow-md flex items-center justify-center gap-2 text-center"
                      href={(() => {
                        if (studentData.dosen.kontak && studentData.dosen.kontak.trim()) {
                          let cleaned = studentData.dosen.kontak.replace(/\D/g, "");
                          if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
                          else if (cleaned.startsWith("8")) cleaned = "62" + cleaned;
                          return `https://wa.me/${cleaned}`;
                        }
                        const pesan = encodeURIComponent(
                          `Halo BAAK / Admin Prodi PTI UNESA, saya ${studentData.nama} (NIM: ${studentData.nim}) mahasiswa bimbingan ${studentData.dosen.nama}. Mohon informasi kontak WhatsApp resmi atau jadwal bimbingan dosen pembimbing saya.`
                        );
                        return `https://wa.me/628112345987?text=${pesan}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        if (!studentData.dosen.kontak || !studentData.dosen.kontak.trim()) {
                          toast({
                            title: "MENGHUBUNGI HELPDESK PRODI",
                            description: "Kontak langsung dosen belum tersedia. Mengarahkan Anda ke WhatsApp Helpdesk BAAK/Prodi PTI.",
                            variant: "info",
                          });
                        }
                      }}
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>{studentData.dosen.kontak ? "Hubungi Pembimbing (WhatsApp)" : "Hubungi via Helpdesk Prodi (WA)"}</span>
                    </a>
                    <button
                      onClick={() => navigate("/portfolio")}
                      className="py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
                      type="button"
                    >
                      <BookOpen className="w-4 h-4 text-slate-600" />
                      <span>Portofolio Riset Dosen</span>
                    </button>
                  </div>
                </div>

                {/* 2.2 Kartu Data Mahasiswa & Rencana Judul (Col 8-12) */}
                <div className="lg:col-span-5 bg-white border border-teal-100 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-teal-600" />
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-black">
                          Biodata Mahasiswa
                        </span>
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ANGKATAN {studentData.angkatan || config?.targetAngkatan || "2023"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-teal-50 border border-teal-100 shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          src={
                            studentData?.foto ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
                          }
                          alt={studentData?.nama || "Mahasiswa"}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-black text-slate-900 truncate">
                          {studentData.nama}
                        </h3>
                        <p className="font-mono text-xs font-bold text-slate-500">
                          NIM: {studentData.nim}
                        </p>
                        <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                          S1 Pendidikan Teknologi Informasi • UNESA
                        </p>
                      </div>
                    </div>

                    {/* Judul yang Diajukan */}
                    <div className="mt-5 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-4 h-4 text-teal-700" />
                        <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider">
                          {config?.category === "MAGANG" ? "Posisi & Mitra Magang" : "Rencana Usulan Judul Skripsi"}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        &ldquo;{studentData.rencanaJudul || (config?.category === "MAGANG" ? `${studentData.magangPosisi || "Software Engineer Intern"} di ${studentData.magangTempat || "Mitra Industri"}` : "Topik usulan skripsi telah dikunci saat pemilihan kuota dosen.")}&rdquo;
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      onClick={() => setIsProfileModalOpen(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2"
                      type="button"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                      <span>Pengaturan Akun &amp; Kontak</span>
                    </button>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-slate-500 text-[11px]">
                      <Info className="w-4 h-4 text-teal-600 shrink-0" />
                      <span>Pemilihan dosen telah final dan tercatat resmi di pangkalan data BAAK.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* PRE-WAR / LIVE-WAR PICKING VIEW (NO DOSEN ALLOCATED YET)                  */
            /* ========================================================================= */
            <>
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
                      "text-emerald-500"
                    )}>
                      <div className={cn(
                        "w-2 h-2 rounded-full animate-ping",
                        config?.category === "MAGANG" ? "bg-indigo-500" :
                        "bg-emerald-500"
                      )} />
                      {config?.category ? t(`cat_${config.category.toLowerCase()}`) : "Live War System"}
                    </h2>
                    <h1 className="text-5xl font-black text-teal-950 tracking-tighter leading-none mb-2">
                      Dosen <span className="text-teal-500 italic">War</span>
                    </h1>
                    <p className="text-teal-800/60 text-sm font-medium pr-12">
                      {t("dash_student_hero_desc")}
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
                      {t("dash_student_quick_guide_title")}
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                          1
                        </div>
                        <p className="text-xs font-bold leading-tight">
                          {t("dash_student_quick_step1")}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-black">
                          2
                        </div>
                        <p className="text-xs font-bold leading-tight">
                          {t("dash_student_quick_step2")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="w-full mt-6 py-3 bg-white text-teal-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg"
                  >
                    {t("nav_settings")}
                  </button>
                  <button
                    onClick={() => navigate("/portfolio")}
                    className="w-full mt-3 py-3 bg-teal-600 text-white border border-teal-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:border-slate-900 transition-all shadow-lg"
                  >
                    {t("nav_portfolio")}
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
            </>
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
                          <p className="text-[8px] text-teal-600 uppercase tracking-[0.2em] font-black">{t("label_nip")}: {dosen.nip}</p>
                        </div>
                        <h3 className="font-black text-2xl text-teal-950 group-hover:text-teal-600 transition-colors tracking-tighter leading-tight">{dosen.nama}</h3>
                        <p className="text-[10px] font-bold text-teal-800/40 uppercase tracking-widest"><DynamicText text={dosen.keahlian || t("dash_dosen_expert_default")} /></p>
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
                              {t("dash_student_pick_advisor")}: {p.judul}
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
                            {t("btn_pick_profile_title")}
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
                              : "bg-teal-50 text-teal-800/60 border border-teal-100"
                          )}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 
                              config?.isForcedClosed ? t("dash_student_system_closed") :
                              !isWarActive ? t("dash_student_waiting_war") : 
                              !isBatchAllowed() ? t("dash_student_access_denied") :
                              !profileStatus.completed ? t("dash_profile_complete_first") :
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

        <AnimatePresence>
           {confirmingDosen && (
             <div className="fixed inset-0 z-[9999] overflow-y-auto">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmingDosen(null)} className="fixed inset-0 bg-teal-950/60 backdrop-blur-md" />
               <div className="min-h-full flex items-center justify-center p-4 sm:p-6 pt-24 pb-12 sm:pt-28 relative z-10 pointer-events-none">
                 <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="pointer-events-auto relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden">
                   <div className="relative space-y-6 text-center">
                     <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-500 mx-auto mb-6">
                       <Info className="w-8 h-8" />
                     </div>
                     <h2 className="text-2xl font-black text-teal-950 leading-tight">{t("dash_student_confirm_choice")}</h2>
                     <p className="text-sm text-teal-800/60 font-medium">Anda akan memilih <span className="font-black text-teal-900">{confirmingDosen.dosen.nama}</span>.</p>
                     
                     <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100/50 text-left">
                       <p className="text-[10px] font-black uppercase tracking-widest text-teal-800/40 mb-1">
                         {config?.category === "MAGANG" ? t("dash_dosen_title_magang") : t("dash_dosen_title_plan")}
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
             </div>
           )}


           {isProfileModalOpen && (
              <div className="fixed inset-0 z-[9999] overflow-y-auto">
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }} 
                  onClick={() => {
                    if (!isProfileIncomplete) {
                      setIsProfileModalOpen(false);
                    }
                  }} 
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" 
                />
                <div className="min-h-full flex items-center justify-center p-4 sm:p-6 relative z-10 pointer-events-none">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 15 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95, y: 15 }} 
                    className="pointer-events-auto relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
                  >
                    {/* Header Modal */}
                    <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-slate-100 bg-slate-50/60 shrink-0">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shadow-sm shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight tracking-tight">
                            {t("dash_student_profile_custom")}
                          </h2>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            Perbarui identitas akademik, kontak WhatsApp, dan preferensi akun Anda.
                          </p>
                        </div>
                      </div>
                      {!isProfileIncomplete && (
                        <button 
                          type="button"
                          onClick={() => setIsProfileModalOpen(false)} 
                          className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all shadow-sm shrink-0"
                          aria-label="Tutup"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Body Form */}
                    <form id="profile-form" onSubmit={handleUpdateProfile} className="flex flex-col flex-1 min-h-0">
                      <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-5 custom-scrollbar">
                        {/* 1. Baris Upload Foto Profil (Sleek Horizontal Card) */}
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                          <div className="relative group shrink-0">
                            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-white border-2 border-slate-200 overflow-hidden shadow-sm">
                              <img 
                                src={profileForm.foto || "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop"} 
                                className="w-full h-full object-cover" 
                                alt="Preview Profil" 
                              />
                            </div>
                            <label 
                              htmlFor="photo-upload" 
                              className="absolute inset-0 flex items-center justify-center bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl text-white"
                              title="Klik untuk ganti foto"
                            >
                              <Camera className="w-5 h-5" />
                            </label>
                            <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                          </div>

                          <div className="flex-1 text-center sm:text-left">
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <h4 className="text-sm font-bold text-slate-900">Foto Profil Mahasiswa</h4>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                                JPG / PNG
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                              Format foto resmi atau semi-formal yang jelas (maksimal 2MB).
                            </p>
                            <label 
                              htmlFor="photo-upload" 
                              className="inline-flex items-center gap-1.5 mt-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-all shadow-sm"
                            >
                              <Camera className="w-3.5 h-3.5 text-teal-600" />
                              <span>{t("dash_student_change_photo")}</span>
                            </label>
                          </div>
                        </div>

                        {/* 2. Grid Dua Kolom */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          {/* Kolom Kiri: Identitas & Kontak */}
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700">
                                  {t("label_nim")}
                                </label>
                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Terkunci Sistem
                                </span>
                              </div>
                              <input 
                                value={profileForm.nim} 
                                disabled 
                                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-500 cursor-not-allowed select-none" 
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-700">
                                {t("dash_student_fullname")} <span className="text-rose-500">*</span>
                              </label>
                              <input 
                                value={profileForm.nama} 
                                onChange={(e) => setProfileForm({...profileForm, nama: e.target.value})} 
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none" 
                                placeholder="Nama lengkap sesuai SIAKAD"
                                required 
                              />
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold text-slate-700">
                                  {t("dash_student_contact")} <span className="text-rose-500">*</span>
                                </label>
                                <span className="text-[10px] text-teal-600 font-semibold">WhatsApp Aktif</span>
                              </div>
                              <div className="relative">
                                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input 
                                  value={profileForm.kontak} 
                                  onChange={(e) => setProfileForm({...profileForm, kontak: e.target.value})} 
                                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none font-mono" 
                                  placeholder="Contoh: 081233003481" 
                                  required
                                />
                              </div>
                              <p className="text-[10px] text-slate-400">
                                Digunakan Dosen Pembimbing dan Koordinator Prodi untuk koordinasi.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-700">
                                {t("dash_student_bio")}
                              </label>
                              <textarea 
                                value={profileForm.bio} 
                                onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})} 
                                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none min-h-[72px] resize-none" 
                                placeholder="Ceritakan sedikit tentang ketertarikan riset Anda..." 
                              />
                            </div>
                          </div>

                          {/* Kolom Kanan: Rencana Usulan & Keamanan */}
                          <div className="space-y-4">
                            {config?.category === "MAGANG" ? (
                              <>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-slate-700">
                                    Posisi Magang <span className="text-rose-500">*</span>
                                  </label>
                                  <input 
                                    value={profileForm.magangPosisi} 
                                    onChange={(e) => setProfileForm({...profileForm, magangPosisi: e.target.value})} 
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none" 
                                    placeholder="Misal: UI/UX Designer Intern" 
                                    required 
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[11px] font-bold text-slate-700">
                                    Tempat / Instansi Magang <span className="text-rose-500">*</span>
                                  </label>
                                  <input 
                                    value={profileForm.magangTempat} 
                                    onChange={(e) => setProfileForm({...profileForm, magangTempat: e.target.value})} 
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none" 
                                    placeholder="Misal: PT. Telkom Indonesia" 
                                    required 
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-bold text-slate-700">
                                    Rencana Usulan Judul Skripsi <span className="text-rose-500">*</span>
                                  </label>
                                  <span className="text-[10px] text-teal-600 font-semibold">Bisa Diperbarui</span>
                                </div>
                                <textarea 
                                  value={profileForm.rencanaJudul} 
                                  onChange={(e) => setProfileForm({...profileForm, rencanaJudul: e.target.value})} 
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none min-h-[96px] resize-none leading-relaxed" 
                                  placeholder="Ketik usulan judul atau tema riset skripsi Anda..." 
                                  required 
                                />
                                <p className="text-[10px] text-slate-400">
                                  Dapat disesuaikan kembali setelah sesi bimbingan bersama dosen.
                                </p>
                              </div>
                            )}

                            {/* Sub-card Keamanan Akun (Ganti Password) */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                              <div className="flex items-center gap-2">
                                <KeyRound className="w-4 h-4 text-slate-500" />
                                <div>
                                  <h4 className="text-xs font-bold text-slate-800">Ganti Kata Sandi (Opsional)</h4>
                                  <p className="text-[10px] text-slate-400">Kosongkan jika tidak ingin mengubah kata sandi.</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                                <input 
                                  type="password" 
                                  value={newPassword} 
                                  onChange={(e) => setNewPassword(e.target.value)} 
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none" 
                                  placeholder="Password baru (min. 6)" 
                                />
                                <input 
                                  type="password" 
                                  value={confirmPassword} 
                                  onChange={(e) => setConfirmPassword(e.target.value)} 
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all outline-none" 
                                  placeholder="Ulangi password" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sticky Footer */}
                      <div className="border-t border-slate-100 bg-slate-50/80 px-6 sm:px-8 py-4 flex items-center justify-between shrink-0">
                        <span className="text-[11px] font-medium text-slate-500">
                          {isProfileIncomplete ? (
                            <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              Lengkapi data wajib untuk melanjutkan
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              Data tersinkronisasi aman
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2.5">
                          {!isProfileIncomplete && (
                            <button 
                              type="button"
                              onClick={() => setIsProfileModalOpen(false)}
                              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-all shadow-sm"
                            >
                              Batal
                            </button>
                          )}
                          <button 
                            type="submit" 
                            disabled={loading} 
                            className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {loading ? (
                              <>
                                <RefreshCcw className="w-3.5 h-3.5 animate-spin" />
                                <span>Menyimpan...</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>{t("dash_student_save_changes")}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                </div>
              </div>
            )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
