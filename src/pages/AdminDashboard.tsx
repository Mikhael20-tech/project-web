import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Settings,
  Timer,
  Users,
  UserPlus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Search,
  X,
  GraduationCap,
  Plus,
  Edit,
  Save,
  Camera,
  Trash2,
  RefreshCcw,
  Upload,
  Info,
  Zap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { socket } from "@/src/lib/socket";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

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
    "monitoring" | "dosen" | "students" | "settings" | "admin_profile" | "broadcast"
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
  const [searchMonitoring, setSearchMonitoring] = useState("");

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
    angkatan: "",
  });
  const [configForm, setConfigForm] = useState({ 
    startTime: "", 
    endTime: "", 
    periode: "", 
    targetAngkatan: "All", 
    announcement: "",
    isForcedClosed: false
  });
  const [filterAngkatan, setFilterAngkatan] = useState("All");
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStudentAngkatan, setFilterStudentAngkatan] = useState("All");
  const [resetAngkatan, setResetAngkatan] = useState("");
  const [broadcastForm, setBroadcastForm] = useState({
    prompt: "",
    message: "",
    targetAngkatan: "All",
    status: "idle" as "idle" | "generating" | "sending" | "success" | "error"
  });
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
            periode: confData.periode || "",
            targetAngkatan: confData.targetAngkatan || "All",
            announcement: confData.announcement || "",
            isForcedClosed: confData.isForcedClosed || false,
          } as any);
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
      setStudentForm({ id: "", nim: "", nama: "", kontak: "", password: "", angkatan: "" });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleCancelSelection = async (mahasiswaId: string, studentName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin membatalkan pilihan dosen untuk ${studentName}?`)) return;
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/war/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mahasiswaId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membatalkan pilihan.");

      setMessage({ type: "success", text: data.message });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
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
      "NIP Dosen",
      "Kuota Max",
      "Terisi",
      "NIM Mahasiswa",
      "Nama Mahasiswa",
      "Angkatan",
    ];

    const rows = reports.flatMap((dosen) => {
      const filteredMahasiswa = filterAngkatan === "All" 
        ? dosen.mahasiswa 
        : dosen.mahasiswa.filter((m: any) => m.angkatan === filterAngkatan);

      if (filteredMahasiswa.length === 0) {
        if (filterAngkatan !== "All") return []; // Don't show dosen if no students of that batch
        return [[dosen.nama, `'${dosen.nip}`, dosen.kuotaMax, 0, "-", "-", "-"]];
      }
      return filteredMahasiswa.map((m: any) => {
        return [
          dosen.nama,
          `'${dosen.nip}`,
          dosen.kuotaMax,
          dosen.mahasiswa.length,
          `'${m.nim}`,
          m.nama,
          m.angkatan || "-",
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

  const exportBelumMemilih = () => {
    const headers = ["NIM", "Nama Mahasiswa", "Angkatan", "Kontak"];
    const belumMemilih = students.filter(s => !s.dosenId);
    
    const rows = belumMemilih.map(s => [
      `'${s.nim}`,
      s.nama,
      s.angkatan || "-",
      s.kontak || "-"
    ]);

    const BOM = "\uFEFF";
    const csvContent = BOM + [
      headers.join(";"),
      ...rows.map(e => e.map(item => `"${String(item).replace(/"/g, '""')}"`).join(";"))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Mahasiswa_Belum_Memilih_${new Date().toLocaleDateString()}.csv`);
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

  const handleGenerateAI = async () => {
    if (!broadcastForm.prompt) return;
    setBroadcastForm({ ...broadcastForm, status: "generating" });
    try {
      const res = await fetch("/api/admin/broadcast/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: broadcastForm.prompt })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal generate pesan.");
      setBroadcastForm({ ...broadcastForm, message: data.message, status: "idle" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
      setBroadcastForm({ ...broadcastForm, status: "error" });
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastForm.message) return;
    if (!window.confirm("Kirim pengumuman ini ke semua mahasiswa target?")) return;
    
    setBroadcastForm({ ...broadcastForm, status: "sending" });
    try {
      const res = await fetch("/api/admin/broadcast/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          message: broadcastForm.message, 
          targetAngkatan: broadcastForm.targetAngkatan 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim broadcast.");
      
      setMessage({ type: "success", text: `Pesan berhasil dikirim ke ${data.count} mahasiswa!` });
      setBroadcastForm({ ...broadcastForm, status: "success" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
      setBroadcastForm({ ...broadcastForm, status: "error" });
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

  const handleResetAngkatan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetAngkatan) return;
    if (!confirm(`Apakah Anda yakin ingin mereset data bimbingan untuk mahasiswa angkatan ${resetAngkatan}? Tindakan ini tidak dapat dibatalkan.`)) return;
    
    setMessage(null);
    try {
      const res = await fetch("/api/admin/reset-angkatan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ angkatan: resetAngkatan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal me-reset data.");
      setMessage({ type: "success", text: data.message });
      setResetAngkatan("");
      fetchData();
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
              { id: "broadcast", label: "Broadcast AI", icon: Zap },
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
                      Export Semua
                    </button>
                    <button
                      onClick={exportBelumMemilih}
                      className="flex items-center gap-2 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-600 hover:bg-rose-100 hover:border-rose-200 transition-all uppercase tracking-widest shadow-sm group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      Belum Memilih
                    </button>
                    <div className="flex items-center gap-2 text-teal-500 text-xs font-black bg-teal-50 px-5 py-3 rounded-2xl border border-teal-100 shadow-sm shadow-teal-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                      LIVE UPDATE
                    </div>
                  </div>
                </div>

                {/* Statistics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  <div className="lg:col-span-2 bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-teal-500" /> Okupansi Per Dosen
                      </h4>
                      <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Top 10 Terisi</span>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reports.slice(0, 10).map(d => ({ name: d.nama.split(" ")[0], terisi: d.mahasiswa.length, kuota: d.kuotaMax }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0FAF8" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "#0D2E28" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: "#0D2E28" }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: "1.5rem", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "1rem" }}
                            itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="terisi" radius={[10, 10, 0, 0]}>
                            {reports.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.mahasiswa.length >= entry.kuotaMax ? "#F43F5E" : "#14B8A6"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-sm">
                    <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <Users className="w-4 h-4 text-teal-500" /> Total Progress
                    </h4>
                    <div className="h-[250px] w-full relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Terisi", value: reports.reduce((acc, d) => acc + d.mahasiswa.length, 0) },
                              { name: "Kosong", value: reports.reduce((acc, d) => acc + d.kuotaMax, 0) - reports.reduce((acc, d) => acc + d.mahasiswa.length, 0) }
                            ]}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#14B8A6" />
                            <Cell fill="#F0FAF8" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-black text-teal-950">
                          {Math.round((reports.reduce((acc, d) => acc + d.mahasiswa.length, 0) / reports.reduce((acc, d) => acc + d.kuotaMax, 0)) * 100)}%
                        </span>
                        <span className="text-[10px] font-black text-teal-300 uppercase">Terisi</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-teal-800/60">Total Mahasiswa:</span>
                        <span className="text-sm font-black text-teal-950">{reports.reduce((acc, d) => acc + d.mahasiswa.length, 0)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-teal-800/60">Total Kuota:</span>
                        <span className="text-sm font-black text-teal-950">{reports.reduce((acc, d) => acc + d.kuotaMax, 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col">
                  {/* Search Bar for Monitoring */}
                  <div className="px-6 md:px-10 py-6 border-b border-teal-50 bg-[#f8fdfc] flex flex-wrap items-center gap-4">
                    {/* Filter Angkatan */}
                    <div className="flex items-center gap-3 bg-white border border-teal-100 px-4 py-2 rounded-2xl shadow-sm">
                      <span className="text-[10px] font-black uppercase text-teal-800/40 tracking-widest">Filter:</span>
                      <select 
                        value={filterAngkatan}
                        onChange={(e) => setFilterAngkatan(e.target.value)}
                        className="bg-transparent border-none text-xs font-bold text-teal-950 focus:ring-0 cursor-pointer"
                      >
                        <option value="All">Semua Angkatan</option>
                        {[...new Set(reports.flatMap(d => d.mahasiswa.map((m: any) => m.angkatan)))].filter(Boolean).sort().map(a => (
                          <option key={a} value={a}>Angkatan {a}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative flex-grow max-w-md">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-teal-400" />
                      </div>
                      <input
                        type="text"
                        value={searchMonitoring}
                        onChange={(e) => setSearchMonitoring(e.target.value)}
                        placeholder="Cari dosen atau mahasiswa..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-teal-100 rounded-2xl text-sm font-bold text-teal-950 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                      {searchMonitoring && (
                        <button onClick={() => setSearchMonitoring("")} className="absolute inset-y-0 right-4 flex items-center text-teal-300 hover:text-teal-500">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Header (Hidden on Mobile) */}
                  <div className="hidden lg:grid lg:grid-cols-12 gap-6 bg-[#f8fdfc] border-b border-teal-50 px-6 py-6 md:px-10 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">
                    <div className="col-span-4">Dosen</div>
                    <div className="col-span-2 text-center">Okupansi</div>
                    <div className="col-span-6">Mahasiswa</div>
                  </div>
                  
                  {/* Body */}
                  <div className="divide-y divide-teal-50 flex flex-col">
                    {reports.filter(d => {
                      const matchesSearch = d.nama?.toLowerCase().includes(searchMonitoring.toLowerCase()) ||
                        d.mahasiswa?.some((m: any) => m.nama?.toLowerCase().includes(searchMonitoring.toLowerCase()) || m.nim?.toLowerCase().includes(searchMonitoring.toLowerCase()));
                      
                      const matchesFilter = filterAngkatan === "All" || d.mahasiswa?.some((m: any) => m.angkatan === filterAngkatan);
                      
                      return matchesSearch && matchesFilter;
                    }).map((dosen, i) => (
                      <div
                        key={dosen.id}
                        className="flex flex-col lg:grid lg:grid-cols-12 gap-4 lg:gap-6 hover:bg-[#f8fdfc] transition-colors group p-6 md:px-10 md:py-6"
                      >
                        {/* Dosen Section */}
                        <div className="col-span-4 flex items-center gap-5">
                          <div className="w-14 h-14 rounded-2xl bg-teal-50 overflow-hidden border border-teal-100 shadow-inner group-hover:scale-110 transition-transform shrink-0 flex items-center justify-center">
                            {dosen.foto ? (
                              <img
                                src={dosen.foto || undefined}
                                className="w-full h-full object-cover object-center"
                              />
                            ) : (
                              <GraduationCap className="w-6 h-6 text-teal-300" />
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

                        {/* Okupansi Section */}
                        <div className="col-span-2 flex flex-col justify-center items-start lg:items-center mt-2 lg:mt-0">
                          <span className="text-[10px] font-black uppercase text-teal-800/40 lg:hidden mb-2">Okupansi</span>
                          <span className="text-sm font-mono font-black mb-2 text-teal-800">
                            {dosen.mahasiswa.length} / {dosen.kuotaMax}
                          </span>
                          <div className="w-full max-w-[200px] lg:w-32 h-2.5 bg-teal-50 rounded-full overflow-hidden shadow-inner p-0.5">
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

                        {/* Mahasiswa Section */}
                        <div className="col-span-6 flex flex-col justify-center mt-4 lg:mt-0">
                          <span className="text-[10px] font-black uppercase text-teal-800/40 lg:hidden mb-3">Data Mahasiswa</span>
                          <div className="flex flex-wrap gap-2">
                            {dosen.mahasiswa.length > 0 ? (
                              dosen.mahasiswa.filter((m: any) => filterAngkatan === "All" || m.angkatan === filterAngkatan).map((m: any) => (
                                <div
                                  key={m.id}
                                  className="flex flex-col px-4 py-2.5 bg-white border border-teal-100 rounded-xl shadow-sm hover:border-teal-200 hover:shadow-teal-100 transition-all cursor-default group/group flex-grow sm:flex-grow-0"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex flex-col">
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
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelSelection(m.id, m.nama);
                                      }}
                                      className="p-1.5 hover:bg-rose-50 text-teal-300 hover:text-rose-500 rounded-lg transition-colors group/btn shrink-0"
                                      title="Batalkan Pilihan"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span className="text-[10px] font-black text-teal-800/30 uppercase tracking-widest px-4 py-2 border border-dashed border-teal-100 rounded-xl bg-teal-50/50">
                                Belum Ada Mahasiswa
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                      Angkatan
                    </label>
                    <input
                      value={studentForm.angkatan}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, angkatan: e.target.value })
                      }
                      className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                      placeholder="Contoh: 2021"
                      required
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
                            angkatan: "",
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
                
                <div className="px-8 md:px-10 py-6 border-b border-teal-50 bg-[#f8fdfc] flex flex-wrap gap-4 items-center">
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Cari NIM atau nama mahasiswa..."
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-teal-100 rounded-2xl text-sm font-bold text-teal-950 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-inner"
                    />
                  </div>
                  <div className="flex items-center gap-3 bg-white border border-teal-100 px-4 py-2 rounded-2xl shadow-sm border-b-2 border-b-teal-500/10">
                    <span className="text-[10px] font-black uppercase text-teal-800/40 tracking-widest">Filter Angkatan:</span>
                    <select 
                      value={filterStudentAngkatan}
                      onChange={(e) => setFilterStudentAngkatan(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-teal-950 focus:ring-0 cursor-pointer"
                    >
                      <option value="All">Semua Angkatan</option>
                      {[...new Set(students.map(s => s.angkatan))].filter(Boolean).sort().map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>
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
                      {students.filter(std => {
                        const matchesSearch = std.nama?.toLowerCase().includes(searchStudent.toLowerCase()) || 
                          std.nim?.toLowerCase().includes(searchStudent.toLowerCase());
                        const matchesAngkatan = filterStudentAngkatan === "All" || std.angkatan === filterStudentAngkatan;
                        return matchesSearch && matchesAngkatan;
                      }).map((std, i) => (
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
                                  angkatan: std.angkatan || "",
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

                    <div className="space-y-4 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Nama Periode (Display Only)
                        </label>
                        <input
                          type="text"
                          value={(configForm as any).periode || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, periode: e.target.value } as any)
                          }
                          placeholder="Contoh: 2024/2025"
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Target Angkatan (Akses War)
                        </label>
                        <input
                          type="text"
                          value={(configForm as any).targetAngkatan || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, targetAngkatan: e.target.value } as any)
                          }
                          placeholder="Contoh: 2021, 2022 (atau 'All')"
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          Pengumuman Khusus (Khusus Angkatan Aktif)
                        </label>
                        <textarea
                          value={(configForm as any).announcement || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, announcement: e.target.value } as any)
                          }
                          placeholder="Pesan yang akan muncul di dashboard mahasiswa..."
                          rows={3}
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner resize-none"
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

                    <div className="pt-8 border-t border-teal-50">
                      <div className="flex items-center justify-between p-6 bg-rose-50/50 rounded-3xl border border-rose-100/50">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-rose-900 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> EMERGENCY STOP
                          </h4>
                          <p className="text-[10px] font-medium text-rose-700/60 uppercase tracking-wider">Tutup paksa akses war dosen seketika</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={configForm.isForcedClosed}
                            onChange={(e) => setConfigForm({ ...configForm, isForcedClosed: e.target.checked })}
                            className="sr-only peer" 
                          />
                          <div className="w-14 h-7 bg-teal-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-rose-500 shadow-inner"></div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-6 bg-teal-500 text-white rounded-[2rem] shadow-2xl shadow-teal-500/20 font-black text-sm uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all group flex items-center gap-3 justify-center"
                    >
                      <Calendar className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      SIMPAN KONFIGURASI
                    </button>
                  </form>

                  {/* Reset Angkatan Section */}
                  <div className="mt-12 pt-12 border-t border-teal-50">
                    <h3 className="text-xl font-black text-teal-950 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Reset Data per Angkatan
                    </h3>
                    <p className="text-xs text-teal-800/60 font-medium mb-6">
                      Menghapus semua pilihan dosen untuk mahasiswa pada angkatan tertentu. Berguna saat memulai periode baru.
                    </p>
                    <form onSubmit={handleResetAngkatan} className="flex gap-4">
                      <input 
                        type="text" 
                        value={resetAngkatan}
                        onChange={(e) => setResetAngkatan(e.target.value)}
                        placeholder="Contoh: 2021"
                        className="flex-grow p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none"
                      />
                      <button 
                        type="submit"
                        disabled={!resetAngkatan}
                        className="px-8 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all disabled:opacity-50"
                      >
                        RESET
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "broadcast" && (
            <motion.div
              key="broadcast"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white border border-teal-50 rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-teal-500/5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 opacity-50" />
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-12 relative z-10">
                    <div className="w-20 h-20 bg-teal-950 rounded-3xl flex items-center justify-center text-teal-400 shadow-xl shadow-teal-950/20">
                      <Zap className="w-10 h-10" />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-tight">
                        AI Broadcast Center
                      </h3>
                      <p className="text-sm text-teal-800/60 font-medium mt-1">
                        Gunakan kecerdasan buatan untuk menyusun pengumuman WhatsApp yang profesional.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                    {/* Left: Input AI */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 flex items-center gap-2">
                          <Edit className="w-3 h-3" /> Instruksi Pengumuman (Bahasa Indonesia)
                        </label>
                        <textarea
                          value={broadcastForm.prompt}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, prompt: e.target.value })}
                          placeholder="Contoh: Beritahu angkatan 2021 kalau war dospem dibuka besok jam 8 pagi."
                          rows={4}
                          className="w-full p-6 bg-teal-50/50 border border-teal-100 rounded-[2rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner resize-none"
                        />
                      </div>
                      <button
                        onClick={handleGenerateAI}
                        disabled={broadcastForm.status === "generating" || !broadcastForm.prompt}
                        className="w-full py-5 bg-teal-950 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-teal-950/20 disabled:opacity-50"
                      >
                        {broadcastForm.status === "generating" ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 text-teal-400" />
                        )}
                        {broadcastForm.status === "generating" ? "MENYUSUN PESAN..." : "BANTU TULIS DENGAN AI"}
                      </button>
                    </div>

                    {/* Right: Preview & Send */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Preview Pesan WhatsApp
                        </label>
                        <textarea
                          value={broadcastForm.message}
                          onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                          placeholder="Hasil AI akan muncul di sini dan bisa Anda edit..."
                          rows={8}
                          className="w-full p-6 bg-white border border-teal-100 rounded-[2rem] text-teal-950 text-xs font-medium leading-relaxed focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/40 ml-1">Kirim Ke:</label>
                          <select 
                            value={broadcastForm.targetAngkatan}
                            onChange={(e) => setBroadcastForm({ ...broadcastForm, targetAngkatan: e.target.value })}
                            className="w-full p-4 bg-teal-50 border border-teal-100 rounded-xl text-xs font-bold text-teal-950 focus:outline-none focus:border-teal-400 transition-all"
                          >
                            <option value="All">Semua Mahasiswa</option>
                            {[...new Set(students.map(s => s.angkatan))].filter(Boolean).sort().map(a => (
                              <option key={a} value={a}>Angkatan {a}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={handleSendBroadcast}
                          disabled={broadcastForm.status === "sending" || !broadcastForm.message}
                          className="sm:mt-6 w-full py-4 bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                        >
                          {broadcastForm.status === "sending" ? (
                            <RefreshCcw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {broadcastForm.status === "sending" ? "MENGIRIM..." : "BLAST WHATSAPP"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-teal-50/50 rounded-[2rem] border border-dashed border-teal-100 flex items-start gap-4">
                    <Info className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-teal-900 leading-relaxed uppercase tracking-wide">Panduan Cepat</p>
                      <p className="text-[10px] text-teal-800/60 font-medium leading-relaxed">
                        1. Masukkan instruksi singkat (misal: "Ingatkan war besok pagi") <br/>
                        2. Klik tombol AI untuk mendapatkan draf pesan WhatsApp yang profesional <br/>
                        3. Periksa dan edit pesan jika perlu di kotak preview <br/>
                        4. Pilih target angkatan dan klik BLAST untuk mengirim ke seluruh mahasiswa.
                      </p>
                    </div>
                  </div>
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
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
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

export default AdminDashboard;
