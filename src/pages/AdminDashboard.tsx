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
  ChevronDown,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/lib/LanguageContext";
import { socket } from "@/src/lib/socket";
import LoadingOverlay from "@/src/components/LoadingOverlay";
import { AdminDateTimePicker } from "@/src/components/AdminDateTimePicker";
import { BookingCalendar } from "@/src/components/BookingCalendar";
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
import * as XLSX from "xlsx";

const AdminDashboard = ({
  token,
  currentUser,
  onUserUpdate,
}: {
  token: string;
  currentUser: any;
  onUserUpdate: (user: any) => void;
}) => {
  const { t, lang } = useLanguage();
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
  const [activities, setActivities] = useState<any[]>([]);

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
    isForcedClosed: false,
    category: "SKRIPSI_ARTIKEL"
  });
  const [filterAngkatan, setFilterAngkatan] = useState("All");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStudentAngkatan, setFilterStudentAngkatan] = useState("All");
  const [isStudentFilterDropdownOpen, setIsStudentFilterDropdownOpen] = useState(false);
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
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    type?: "danger" | "warning" | "info";
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
            category: confData.category || "SKRIPSI_ARTIKEL",
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

    // Fix #9 (Admin): Use named handlers so socket.off removes only these specific listeners
    const handleQuotaUpdate = () => fetchData();
    const handleNewSelection = (data: any) => {
      setActivities(prev => [
        { id: Date.now(), ...data },
        ...prev.slice(0, 49) // Keep last 50
      ]);
    };

    socket.on("quota_update", handleQuotaUpdate);
    socket.on("new_selection", handleNewSelection);

    return () => {
      socket.off("quota_update", handleQuotaUpdate);
      socket.off("new_selection", handleNewSelection);
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

      setMessage({ type: "success", text: t("toast_dosen_saved") });
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
          ? t("toast_student_saved")
          : t("toast_student_registered"),
      });
      setStudentForm({ id: "", nim: "", nama: "", kontak: "", password: "", angkatan: "" });
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleCancelSelection = async (mahasiswaId: string, studentName: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Membatalkan Pilihan Dosen",
      message: `${t("confirm_cancel_advisor")} ${studentName}?`,
      description: "Tindakan ini akan membatalkan pilihan dosen mahasiswa tersebut secara instan dan mengembalikan kuota pembimbing dosen terkait.",
      confirmText: "YA, BATALKAN PILIHAN",
      cancelText: "KEMBALI",
      type: "danger",
      onConfirm: async () => {
        setConfirmModal(null);
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
      }
    });
  };

  const handleDelete = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
      `Laporan_dosenkita_PTI_${new Date().toISOString().split("T")[0]}.csv`,
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

      setMessage({ type: "success", text: t("toast_schedule_updated") });
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
        body: JSON.stringify({ prompt: broadcastForm.prompt, lang })
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
    
    setConfirmModal({
      isOpen: true,
      title: "Kirim Broadcast WhatsApp",
      message: t("confirm_broadcast_send") || "Apakah Anda yakin ingin mengirim pesan broadcast ini ke seluruh mahasiswa yang ditargetkan?",
      description: "Pesan WhatsApp massal akan segera dikirimkan ke nomor kontak aktif dari mahasiswa yang terpilih.",
      confirmText: "YA, KIRIM PESAN",
      cancelText: "BATALKAN",
      type: "warning",
      onConfirm: async () => {
        setConfirmModal(null);
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
      }
    });
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

      setMessage({ type: "success", text: t("toast_password_changed") });
      setPasswordForm({ newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleResetAngkatan = async () => {
    if (!resetAngkatan) return;
    
    setLoading(true);
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
      setResetModalOpen(false);
      fetchData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    const toTitleCase = (str: string): string => {
      if (!str) return "";
      return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const findColumnIndices = (dataRows: any[][]): { nimIdx: number; namaIdx: number } => {
      let nimScores: { [key: number]: number } = {};
      let namaScores: { [key: number]: number } = {};

      // Scanner regex for NIM: starts with 15-29 (active cohorts), digits only, length 11 to 15 digits
      const nimRegex = /^(1[5-9]|2[0-9])\d{9,13}$/;

      for (let i = 0; i < Math.min(dataRows.length, 10); i++) {
        const row = dataRows[i];
        if (!row) continue;

        for (let c = 0; c < row.length; c++) {
          const val = String(row[c] ?? "").trim();
          if (!val) continue;

          // Check if matches NIM format (digits-only, valid cohort years)
          if (nimRegex.test(val) && !/[a-zA-Z]/.test(val)) {
            nimScores[c] = (nimScores[c] || 0) + 1;
          }
          // Check if matches Name (has letters, reasonable length, and not a header keyword)
          else if (
            /[a-zA-Z]/.test(val) &&
            val.length > 2 &&
            !/^(nim|nama|name|username|email|no|hp|phone|telepon|kontak|contact|angkatan|cohort|class|kelas|jurusan|prodi|timestamp|created_at|createdat)$/i.test(val)
          ) {
            namaScores[c] = (namaScores[c] || 0) + 1;
          }
        }
      }

      let nimIdx = 0;
      let namaIdx = 1;

      // Find column index with highest NIM score
      let maxNimScore = 0;
      let bestNimIdx = -1;
      for (const c in nimScores) {
        const idx = parseInt(c);
        if (nimScores[idx] > maxNimScore) {
          maxNimScore = nimScores[idx];
          bestNimIdx = idx;
        }
      }

      if (bestNimIdx !== -1) {
        nimIdx = bestNimIdx;
      }

      // Find column index with highest Nama score (excluding the NIM column)
      let maxNamaScore = 0;
      let bestNamaIdx = -1;
      for (const c in namaScores) {
        const idx = parseInt(c);
        if (idx !== nimIdx && namaScores[idx] > maxNamaScore) {
          maxNamaScore = namaScores[idx];
          bestNamaIdx = idx;
        }
      }

      if (bestNamaIdx !== -1) {
        namaIdx = bestNamaIdx;
      } else {
        // Fallback: choose the other column if we have exactly 2 columns
        if (bestNimIdx === 0) namaIdx = 1;
        else if (bestNimIdx === 1) namaIdx = 0;
      }

      return { nimIdx, namaIdx };
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedStudents: { nim: string; nama: string }[] = [];

        if (isExcel) {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

          // Detect column indices dynamically
          const { nimIdx, namaIdx } = findColumnIndices(rows);

          for (let i = 0; i < rows.length; i++) {
            const cols = rows[i];
            if (!cols) continue;

            const nim = String(cols[nimIdx] ?? "").trim();
            const nama = String(cols[namaIdx] ?? "").trim();

            if (
              i === 0 &&
              (nim.toLowerCase() === "nim" ||
                nim.toLowerCase() === "username" ||
                nim.toLowerCase() === "nomor induk mahasiswa" ||
                nama.toLowerCase() === "nama" ||
                nama.toLowerCase() === "name" ||
                nama.toLowerCase() === "nama lengkap")
            ) {
              continue;
            }

            // Clean & validate format: NIM must consist of digits and match Unesa format
            const nimClean = nim.replace(/['"]/g, "").trim();
            if (nimClean && nama && /^(1[5-9]|2[0-9])\d{9,13}$/.test(nimClean) && !/[a-zA-Z]/.test(nimClean)) {
              parsedStudents.push({ 
                nim: nimClean, 
                nama: toTitleCase(nama) 
              });
            }
          }
        } else {
          const text = event.target?.result as string;
          if (!text) throw new Error("File kosong atau tidak terbaca.");

          const lines = text.split(/\r?\n/);
          const rawRows: string[][] = [];

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const delimiter = line.includes(";") ? ";" : ",";
            const cols = line.split(delimiter).map(c => c.replace(/^["']|["']$/g, "").trim());
            rawRows.push(cols);
          }

          // Detect column indices dynamically
          const { nimIdx, namaIdx } = findColumnIndices(rawRows);

          for (let i = 0; i < rawRows.length; i++) {
            const cols = rawRows[i];
            if (!cols) continue;

            const nim = String(cols[nimIdx] ?? "").trim();
            const nama = String(cols[namaIdx] ?? "").trim();

            if (
              i === 0 &&
              (nim.toLowerCase() === "nim" ||
                nim.toLowerCase() === "username" ||
                nim.toLowerCase() === "nomor induk mahasiswa" ||
                nama.toLowerCase() === "nama" ||
                nama.toLowerCase() === "name" ||
                nama.toLowerCase() === "nama lengkap")
            ) {
              continue;
            }

            // Clean & validate format
            const nimClean = nim.replace(/['"]/g, "").trim();
            if (nimClean && nama && /^(1[5-9]|2[0-9])\d{9,13}$/.test(nimClean) && !/[a-zA-Z]/.test(nimClean)) {
              parsedStudents.push({ 
                nim: nimClean, 
                nama: toTitleCase(nama) 
              });
            }
          }
        }

        if (parsedStudents.length === 0) {
          throw new Error(
            isExcel
              ? "Tidak ada data mahasiswa valid yang ditemukan dalam file Excel. Pastikan kolom NIM berisi 11-15 digit angka yang valid."
              : "Tidak ada data mahasiswa valid yang ditemukan dalam CSV. Pastikan kolom NIM berisi 11-15 digit angka yang valid."
          );
        }

        const res = await fetch("/api/admin/mahasiswa/import", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(parsedStudents),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mengimpor data.");

        setMessage({
          type: "success",
          text: `Berhasil mengimpor ${data.successCount} mahasiswa baru! (${data.skipCount} dilewati/sudah terdaftar).`,
        });
        fetchData();
      } catch (err: any) {
        setMessage({ type: "error", text: err.message });
      } finally {
        setLoading(false);
        e.target.value = "";
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
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
      setMessage({ type: "success", text: t("toast_photo_updated") });
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
    <>
      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>
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
                {t("dash_admin_control_room")}
              </h2>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white">
                Admin{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400 italic pr-2">
                  {t("dash_admin_dashboard")}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 p-2 bg-white/[0.03] backdrop-blur-md rounded-3xl border border-white/5 relative z-10 w-full xl:w-auto">
            {[
              { id: "monitoring", label: t("dash_admin_tab_monitor"), icon: Timer },
              { id: "dosen", label: t("dash_admin_tab_dosen"), icon: Users },
              { id: "students", label: t("dash_admin_tab_students"), icon: UserPlus },
              { id: "broadcast", label: t("dash_admin_tab_broadcast"), icon: Zap },
              { id: "settings", label: t("dash_admin_tab_schedule"), icon: Calendar },
              { id: "admin_profile", label: t("dash_admin_tab_profile"), icon: Settings },
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

        {/* Float Notification Toast renders globally at the bottom of page layout */}

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
                        {t("dash_admin_monitor_title")}
                    </h3>
                    <p className="text-sm text-teal-800/60 font-medium">
                        {t("dash_admin_monitor_subtitle")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={exportToCSV}
                      className="flex items-center gap-2 px-5 py-3 bg-white border border-teal-100 rounded-2xl text-[10px] font-black text-teal-800 hover:bg-teal-50 hover:border-teal-200 transition-all uppercase tracking-widest shadow-sm group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      {t("dash_admin_export_all")}
                    </button>
                    <button
                      onClick={exportBelumMemilih}
                      className="flex items-center gap-2 px-5 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-black text-rose-600 hover:bg-rose-100 hover:border-rose-200 transition-all uppercase tracking-widest shadow-sm group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      {t("dash_admin_export_not_picked")}
                    </button>
                    <div className="flex items-center gap-2 text-teal-500 text-xs font-black bg-teal-50 px-5 py-3 rounded-2xl border border-teal-100 shadow-sm shadow-teal-100">
                      <div className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
                      {t("dash_admin_live_update")}
                    </div>
                  </div>
                </div>

                {/* Statistics Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 md:p-10">
                  <div className="lg:col-span-2 bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-sm font-black text-teal-900 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-4 h-4 text-teal-500" /> {t("dash_admin_occupancy_per_dosen")}
                      </h4>
                      <span className="text-[10px] font-black text-teal-300 uppercase tracking-widest">{t("dash_admin_top_10")}</span>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reports.slice(0, 10).map(d => ({ name: d.nama.split(" ")[0], terisi: d.mahasiswa.length, kuota: d.kuotaMax }))}>
                          <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#14B8A6" stopOpacity={1} />
                              <stop offset="100%" stopColor="#0D9488" stopOpacity={0.8} />
                            </linearGradient>
                            <linearGradient id="fullGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F43F5E" stopOpacity={1} />
                              <stop offset="100%" stopColor="#E11D48" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0FAF8" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: "#0D2E28" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: "#0D2E28" }} />
                          <Tooltip 
                            cursor={{ fill: '#F8FDF9' }}
                            contentStyle={{ borderRadius: "1.5rem", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", padding: "1rem" }}
                            itemStyle={{ fontSize: "11px", fontWeight: "bold" }}
                          />
                          <Bar dataKey="terisi" radius={[8, 8, 0, 0]} animationDuration={1500}>
                            {reports.slice(0, 10).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.mahasiswa.length >= entry.kuotaMax ? "url(#fullGradient)" : "url(#barGradient)"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-teal-500/10 transition-colors" />
                    
                    <h4 className="text-[10px] font-black text-teal-800/40 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      {t("dash_admin_total_progress")}
                    </h4>

                    {(() => {
                      const totalFilled = reports.reduce((acc, d) => acc + d.mahasiswa.length, 0);
                      const totalQuota = reports.reduce((acc, d) => acc + d.kuotaMax, 0);
                      const percentage = Math.round((totalFilled / (totalQuota || 1)) * 100);

                      return (
                        <>
                          <div className="flex items-end gap-2 mb-2">
                            <motion.span 
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={percentage}
                              className="text-5xl font-black text-teal-950 tracking-tighter"
                            >
                              {percentage}%
                            </motion.span>
                            <span className="text-xs font-bold text-teal-500 mb-2 uppercase tracking-widest">
                              {t("dash_admin_filled")}
                            </span>
                          </div>

                          <div className="h-[220px] w-full relative mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <defs>
                                  <linearGradient id="pieGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#14B8A6" />
                                    <stop offset="100%" stopColor="#0D9488" />
                                  </linearGradient>
                                </defs>
                                <Pie
                                  data={[
                                    { name: t("dash_admin_filled"), value: totalFilled },
                                    { name: "Empty", value: Math.max(0, totalQuota - totalFilled) }
                                  ]}
                                  innerRadius={70}
                                  outerRadius={90}
                                  paddingAngle={8}
                                  dataKey="value"
                                  stroke="none"
                                  startAngle={90}
                                  endAngle={450}
                                >
                                  <Cell fill="url(#pieGradient)" />
                                  <Cell fill="#F0FAF8" />
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: "1.25rem", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <Users className="w-6 h-6 text-teal-100 mb-1" />
                                <span className="text-[10px] font-black text-teal-800/20 uppercase tracking-[0.2em]">LIVE</span>
                            </div>
                          </div>

                          <div className="mt-8 space-y-4 pt-6 border-t border-teal-50/50">
                            <div className="flex justify-between items-center bg-teal-50/30 p-4 rounded-2xl border border-teal-50/50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-teal-500">
                                  <CheckCircle2 className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-teal-800/60 uppercase tracking-wide">{t("dash_admin_total_students")}</span>
                              </div>
                              <span className="text-lg font-black text-teal-950">{totalFilled}</span>
                            </div>
                            <div className="flex justify-between items-center bg-orange-50/30 p-4 rounded-2xl border border-orange-50/50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-orange-500">
                                  <Users className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-teal-800/60 uppercase tracking-wide">{t("dash_admin_total_quota")}</span>
                              </div>
                              <span className="text-lg font-black text-teal-950">{totalQuota}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  <div className="bg-teal-950 border border-teal-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 shadow-inner">
                        <Zap className="w-5 h-5" />
                      </div>
                      {t("dash_admin_recent_activity")}
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar relative z-10 mt-6">
                      {activities.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center py-10 text-teal-300/50">
                          <Zap className="w-8 h-8 text-orange-400 animate-pulse mb-3" />
                          <p className="text-[10px] font-black uppercase tracking-widest">{t("dash_admin_activity_waiting")}</p>
                        </div>
                      ) : (
                        <AnimatePresence initial={false}>
                          {activities.map((act) => (
                            <motion.div
                              key={act.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="bg-white/5 border border-white/5 p-4 rounded-2xl"
                            >
                              <p className="text-[9px] font-bold text-teal-200/80 leading-relaxed">
                                <span className="text-teal-400">{act.studentName || t("dash_admin_activity_prefix")}</span> {t("dash_admin_activity_suffix")} <span className="text-white">{act.lecturerName}</span>
                              </p>
                              <p className="text-[7px] font-black text-teal-500 mt-2 uppercase tracking-widest">
                                {new Date(act.timestamp).toLocaleTimeString()}
                              </p>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col">
                  {/* Search Bar for Monitoring */}
                  <div className="px-6 md:px-10 py-6 border-b border-teal-50 bg-[#f8fdfc] flex flex-wrap items-center gap-4">
                    {/* Filter Angkatan Custom Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                        className="flex items-center gap-3 bg-white border border-teal-100 px-5 py-2.5 rounded-2xl shadow-sm hover:border-teal-300 transition-all group min-w-[180px] justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase text-teal-800/40 tracking-widest">{t("dash_admin_filter")}</span>
                          <span className="text-xs font-black text-teal-950">
                            {filterAngkatan === "All" ? t("dash_admin_all_batch") : `Angkatan ${filterAngkatan}`}
                          </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-teal-400 transition-transform duration-300", isFilterDropdownOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isFilterDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-[110]" onClick={() => setIsFilterDropdownOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              className="absolute top-full left-0 mt-3 w-full min-w-[220px] bg-white/95 backdrop-blur-xl border border-teal-50 rounded-[1.5rem] shadow-2xl p-2 z-[120] overflow-hidden"
                            >
                              <button
                                onClick={() => {
                                  setFilterAngkatan("All");
                                  setIsFilterDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all",
                                  filterAngkatan === "All" ? "bg-teal-50 text-teal-950" : "hover:bg-slate-50 text-teal-800/60"
                                )}
                              >
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("dash_admin_all_batch")}</span>
                                {filterAngkatan === "All" && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                              </button>
                              
                              {[...new Set(reports.flatMap(d => d.mahasiswa.map((m: any) => m.angkatan)))].filter(Boolean).sort().map(a => (
                                <button
                                  key={a}
                                  onClick={() => {
                                    setFilterAngkatan(a);
                                    setIsFilterDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all mt-1",
                                    filterAngkatan === a ? "bg-teal-50 text-teal-950" : "hover:bg-slate-50 text-teal-800/60"
                                  )}
                                >
                                  <span className="text-[10px] font-black uppercase tracking-widest">Angkatan {a}</span>
                                  {filterAngkatan === a && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
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
                    <div className="col-span-2 text-center">{t("dash_admin_occupancy")}</div>
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
                              {t("login_nip")}: {dosen.nip}
                            </span>
                          </div>
                        </div>

                        {/* Okupansi Section */}
                        <div className="col-span-2 flex flex-col justify-center items-start lg:items-center mt-2 lg:mt-0">
                          <span className="text-[10px] font-black uppercase text-teal-800/40 lg:hidden mb-2">{t("dash_admin_occupancy")}</span>
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
                            <span className="text-[10px] font-black uppercase text-teal-800/40 lg:hidden mb-3">{t("dash_admin_student_data")}</span>
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
                                        type="button"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleCancelSelection(m.id, m.nama);
                                        }}
                                        className="p-1.5 hover:bg-rose-50 text-teal-300 hover:text-rose-500 rounded-lg transition-colors group/btn shrink-0"
                                        title={t("dash_student_cancel")}
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] font-black text-teal-800/30 uppercase tracking-widest px-4 py-2 border border-dashed border-teal-100 rounded-xl bg-teal-50/50">
                                  {t("dash_dosen_no_student")}
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
                            ? t("dash_admin_pass_new_placeholder")
                            : t("dash_admin_pass_lecturer_placeholder")
                        }
                        required={!dosenForm.id}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-5 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-teal-500/10 hover:bg-teal-950 transition-all flex items-center justify-center gap-2 mt-4 group"
                    >
                      <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                      {dosenForm.id ? t("dash_admin_save") : t("dash_admin_add_lecturer")}
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
                        {t("dash_admin_cancel_edit")}
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
                      <div className="flex gap-2 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
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
                            });
                          }}
                          className="p-3 bg-[#f8fdfc] text-teal-800/40 hover:bg-teal-50 hover:text-teal-500 border border-transparent hover:border-teal-100 rounded-xl transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteData({
                              type: "dosen",
                              id: dosen.id,
                              name: dosen.nama,
                            });
                          }}
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
                        ? t("dash_admin_edit_mahasiswa")
                        : t("dash_admin_reg_mahasiswa")}
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
                      {t("dash_admin_student_id")}
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
                      {t("dash_admin_batch_label")}
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
                <div className="p-8 md:p-10 border-b border-teal-50 flex flex-wrap justify-between items-center bg-[#f8fdfc] gap-4">
                  <h3 className="text-xs font-black text-teal-950 uppercase tracking-widest flex items-center gap-2">
                    <Users className="w-4 h-4 text-teal-500" /> {t("dash_admin_db_mahasiswa")}
                  </h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      id="import-csv-input"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleCSVImport}
                      className="hidden"
                    />
                    <label
                      htmlFor="import-csv-input"
                      className="flex items-center gap-2 px-5 py-3 bg-teal-50 border border-teal-100 rounded-2xl text-[10px] font-black text-teal-800 hover:bg-teal-100 hover:border-teal-200 transition-all uppercase tracking-widest shadow-sm cursor-pointer group"
                    >
                      <Upload className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                      Impor CSV / Excel
                    </label>
                    <span className="px-4 py-3 bg-teal-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {students.length} {t("dash_admin_registered")}
                    </span>
                  </div>
                </div>
                <div className="px-8 md:px-10 py-6 border-b border-teal-50 bg-[#f8fdfc] flex flex-wrap gap-4 items-center">
                  <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-400" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder={t("dash_admin_search_student")}
                      className="w-full pl-11 pr-4 py-2.5 bg-white border border-teal-100 rounded-2xl text-sm font-bold text-teal-950 placeholder:text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-inner"
                    />
                  </div>
                  {/* Custom Student Filter Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsStudentFilterDropdownOpen(!isStudentFilterDropdownOpen)}
                      className="flex items-center gap-3 bg-white border border-teal-100 px-5 py-2.5 rounded-2xl shadow-sm hover:border-teal-300 transition-all group min-w-[180px] justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-teal-800/40 tracking-widest">{t("dash_admin_filter")}</span>
                        <span className="text-xs font-black text-teal-950">
                          {filterStudentAngkatan === "All" ? t("dash_admin_all_batch") : `Angkatan ${filterStudentAngkatan}`}
                        </span>
                      </div>
                      <ChevronDown className={cn("w-4 h-4 text-teal-400 transition-transform duration-300", isStudentFilterDropdownOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isStudentFilterDropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-[110]" onClick={() => setIsStudentFilterDropdownOpen(false)} />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full right-0 mt-3 w-full min-w-[220px] bg-white/95 backdrop-blur-xl border border-teal-50 rounded-[1.5rem] shadow-2xl p-2 z-[120] overflow-hidden"
                          >
                            <button
                              onClick={() => {
                                setFilterStudentAngkatan("All");
                                setIsStudentFilterDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all",
                                filterStudentAngkatan === "All" ? "bg-teal-50 text-teal-950" : "hover:bg-slate-50 text-teal-800/60"
                              )}
                            >
                              <span className="text-[10px] font-black uppercase tracking-widest">{t("dash_admin_all_batch")}</span>
                              {filterStudentAngkatan === "All" && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                            </button>
                            
                            {[...new Set(students.map(s => s.angkatan))].filter(Boolean).sort().map(a => (
                              <button
                                key={a}
                                onClick={() => {
                                  setFilterStudentAngkatan(a);
                                  setIsStudentFilterDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all mt-1",
                                  filterStudentAngkatan === a ? "bg-teal-50 text-teal-950" : "hover:bg-slate-50 text-teal-800/60"
                                )}
                              >
                                <span className="text-[10px] font-black uppercase tracking-widest">Angkatan {a}</span>
                                {filterStudentAngkatan === a && <CheckCircle2 className="w-3 h-3 text-teal-500" />}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#f8fdfc] border-b border-teal-50 text-[10px] font-black uppercase text-teal-800/40 tracking-widest">
                        <th className="px-10 py-6">{t("dash_admin_student_data").split(" ")[0]}</th>
                        <th className="px-10 py-6">{t("dash_admin_student_id").split(" ")[0]}</th>
                        <th className="px-10 py-6">{t("dash_admin_advisor_selected")}</th>
                        <th className="px-10 py-6 text-right">{t("dash_admin_action")}</th>
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
                                <Timer className="w-3 h-3" /> {t("dash_admin_not_selecting")}
                              </span>
                            )}
                          </td>
                          <td className="px-10 py-5 text-right space-x-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
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
                              className="p-3 text-teal-800/30 bg-white border border-teal-100 hover:border-teal-200 hover:text-teal-600 hover:bg-teal-50 rounded-[1rem] transition-all shadow-sm"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDeleteData({
                                  type: "mahasiswa",
                                  id: std.id,
                                  name: std.nama,
                                });
                              }}
                              className="p-3 text-teal-800/30 bg-white border border-teal-100 hover:border-rose-200 hover:text-rose-500 hover:bg-rose-50 rounded-[1rem] transition-all shadow-sm"
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
                        {t("dash_admin_schedule_title")}
                      </h3>
                      <p className="text-sm text-teal-800/60 font-medium mt-1">
                        {t("dash_admin_schedule_subtitle")}
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleConfigSubmit} className="space-y-12">
                    {/* War Category Selection */}
                    <div className="space-y-4 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("dash_admin_war_category")}
                      </label>
                        <div className="flex flex-wrap gap-3">
                          {[
                            { id: "MAGANG", label: t("cat_magang"), icon: Briefcase, color: "bg-indigo-500", text: "text-indigo-500" },
                            { id: "PLP", label: t("cat_plp"), icon: GraduationCap, color: "bg-rose-500", text: "text-rose-500" },
                            { id: "SKRIPSI_ARTIKEL", label: t("cat_skripsi_artikel"), icon: ShieldCheck, color: "bg-emerald-500", text: "text-emerald-500" }
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setConfigForm({ ...configForm, category: cat.id } as any)}
                            className={cn(
                              "flex items-center gap-3 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                              (configForm as any).category === cat.id
                                ? `${cat.color} text-white border-transparent shadow-xl`
                                : `bg-white ${cat.text} border-teal-50 hover:border-teal-200`
                            )}
                          >
                            <cat.icon className={cn("w-4 h-4", (configForm as any).category === cat.id ? "text-white" : cat.text)} />
                            {cat.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                      <AdminDateTimePicker
                        label={t("dash_admin_start_time")}
                        value={configForm.startTime}
                        onChange={(val) =>
                          setConfigForm({ ...configForm, startTime: val })
                        }
                        required
                      />
                      <AdminDateTimePicker
                        label={t("dash_admin_end_time")}
                        value={configForm.endTime}
                        onChange={(val) =>
                          setConfigForm({ ...configForm, endTime: val })
                        }
                        required
                      />
                    </div>

                    {/* ── HeroUI Booking Calendar Preview ── */}
                    <div className="bg-teal-50/40 border border-teal-100 rounded-[2rem] p-8 text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 mb-6 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Preview Kalender Jadwal
                      </p>
                      <div className="flex justify-center">
                        <BookingCalendar />
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("dash_admin_period_name")}
                        </label>
                        <input
                          type="text"
                          value={(configForm as any).periode || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, periode: e.target.value } as any)
                          }
                          placeholder={t("dash_admin_period_name")}
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("dash_admin_target_batch")}
                        </label>
                        <div className="flex flex-wrap gap-3 p-6 bg-teal-50/30 border border-teal-100/50 rounded-[1.5rem] shadow-inner">
                          <button
                            type="button"
                            onClick={() => setConfigForm({ ...configForm, targetAngkatan: "All" } as any)}
                            className={cn(
                              "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                              (configForm as any).targetAngkatan === "All"
                                ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                                : "bg-white text-teal-400 border-teal-100 hover:border-teal-300 hover:text-teal-600"
                            )}
                          >
                            ALL
                          </button>
                          {Array.from(new Set(students.map((s) => s.angkatan)))
                            .filter(Boolean)
                            .sort()
                            .map((angkatan) => {
                              const currentSelected = (configForm as any).targetAngkatan || "All";
                              const selectedArray = currentSelected === "All" ? [] : currentSelected.split(", ").filter(Boolean);
                              const isSelected = selectedArray.includes(angkatan);
                              
                              return (
                                <button
                                  key={angkatan}
                                  type="button"
                                  onClick={() => {
                                    let newSelected;
                                    if (currentSelected === "All") {
                                      newSelected = [angkatan];
                                    } else if (isSelected) {
                                      newSelected = selectedArray.filter(a => a !== angkatan);
                                    } else {
                                      newSelected = [...selectedArray, angkatan];
                                    }
                                    
                                    const finalValue = newSelected.length === 0 ? "All" : newSelected.sort().join(", ");
                                    setConfigForm({ ...configForm, targetAngkatan: finalValue } as any);
                                  }}
                                  className={cn(
                                    "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                    isSelected && currentSelected !== "All"
                                      ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20"
                                      : "bg-white text-teal-400 border-teal-100 hover:border-teal-300 hover:text-teal-600"
                                  )}
                                >
                                  {angkatan}
                                </button>
                              );
                            })}
                        </div>
                        <p className="text-[10px] font-medium text-teal-800/40 ml-1 italic">
                          * {(configForm as any).targetAngkatan === "All" ? "Semua angkatan dapat mengakses portal." : `Hanya angkatan ${(configForm as any).targetAngkatan} yang dapat mengakses.`}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("dash_admin_announcement_label")}
                        </label>
                        <textarea
                          value={(configForm as any).announcement || ""}
                          onChange={(e) =>
                            setConfigForm({ ...configForm, announcement: e.target.value } as any)
                          }
                          placeholder={t("dash_admin_announcement_placeholder")}
                          rows={3}
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner resize-none"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-orange-50/50 rounded-[1.5rem] border border-orange-100 text-left flex gap-5 shadow-sm">
                      <Info className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-orange-800 leading-relaxed font-medium">
                        {t("dash_admin_schedule_info")}
                      </p>
                    </div>

                    <div className="pt-8 border-t border-teal-50">
                      <div className="flex items-center justify-between p-6 bg-rose-50/50 rounded-3xl border border-rose-100/50">
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-rose-900 flex items-center gap-2">
                            <Zap className="w-4 h-4" /> {t("dash_admin_emergency_stop")}
                          </h4>
                          <p className="text-[10px] font-medium text-rose-700/60 uppercase tracking-wider">{t("dash_admin_force_close")}</p>
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
                  {/* Reset Angkatan Section */}
                  <div className="mt-12 pt-12 border-t border-teal-50">
                    <h3 className="text-xl font-black text-teal-950 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      {t("dash_admin_reset_data")}
                    </h3>
                    <p className="text-xs text-teal-800/60 font-medium mb-8 leading-relaxed max-w-xl">
                      {t("dash_admin_reset_desc")}
                    </p>
                    <div className="space-y-6">
                      <div className="flex flex-wrap gap-3">
                        {Array.from(new Set(students.map((s) => s.angkatan)))
                          .filter(Boolean)
                          .sort()
                          .map((angkatan) => (
                            <button
                              key={angkatan}
                              type="button"
                              onClick={() => setResetAngkatan(angkatan)}
                              className={cn(
                                "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                resetAngkatan === angkatan
                                  ? "bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20 scale-105"
                                  : "bg-white text-rose-400 border-rose-100 hover:border-rose-300 hover:text-rose-600 shadow-sm"
                              )}
                            >
                              {angkatan}
                            </button>
                          ))}
                      </div>
                      
                      <button 
                        type="button"
                        onClick={() => setResetModalOpen(true)}
                        disabled={!resetAngkatan}
                        className="w-full sm:w-auto px-12 py-5 bg-rose-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-600 transition-all disabled:opacity-20 shadow-2xl shadow-rose-500/20"
                      >
                        {t("dash_admin_reset_btn")}
                      </button>
                    </div>
                  </div>
                </form>
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
                          <Edit className="w-3 h-3" /> {t("dash_admin_broadcast_instruction")}
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
                        {broadcastForm.status === "generating" ? t("dash_admin_broadcast_generating") : t("dash_admin_broadcast_ai_btn")}
                      </button>
                    </div>

                    {/* Right: Preview & Send */}
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> {t("dash_admin_broadcast_preview")}
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
                          {broadcastForm.status === "sending" ? t("dash_admin_saving") : t("dash_admin_broadcast_send_btn")}
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
                    type="button"
                    onClick={(e) => handleDelete(e)}
                    disabled={loading}
                    className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-100 hover:bg-rose-600 transition-all disabled:opacity-50"
                  >
                    {loading ? "MENGHAPUS..." : "YA, HAPUS PERMANEN"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteData(null);
                    }}
                    disabled={loading}
                    className="w-full py-4 bg-teal-50 text-teal-800/40 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all"
                  >
                    BATALKAN
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {resetModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setResetModalOpen(false)}
                className="absolute inset-0 bg-teal-950/60 backdrop-blur-md"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-white rounded-[3rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] space-y-8"
              >
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-rose-50 rounded-[1.75rem] flex items-center justify-center text-rose-500 shadow-inner">
                    <AlertCircle className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-2">
                      DANGER ZONE
                    </h3>
                    <h2 className="text-3xl font-black text-teal-950 leading-tight">
                      Reset Data {resetAngkatan}
                    </h2>
                  </div>
                </div>

                <div className="p-6 bg-rose-50/50 rounded-3xl border border-rose-100">
                    <p className="text-sm text-rose-900 leading-relaxed font-medium">
                        Tindakan ini akan **MENGHAPUS SEMUA PILIHAN DOSEN** untuk seluruh mahasiswa angkatan **{resetAngkatan}**. 
                        Mahasiswa yang terdampak harus melakukan pemilihan ulang.
                    </p>
                </div>

                <div className="flex flex-col gap-4 pt-4">
                  <button
                    onClick={handleResetAngkatan}
                    disabled={loading}
                    className="w-full py-6 bg-rose-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-rose-500/20 hover:bg-rose-600 hover:-translate-y-1 transition-all disabled:opacity-50 group flex items-center justify-center gap-3"
                  >
                    {loading ? (
                        <RefreshCcw className="w-5 h-5 animate-spin" />
                    ) : (
                        <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    {loading ? "PROSES RESET..." : "IYA, RESET SEKARANG"}
                  </button>
                  <button
                    onClick={() => setResetModalOpen(false)}
                    disabled={loading}
                    className="w-full py-6 bg-teal-50 text-teal-800/40 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-100 transition-all"
                  >
                    TIDAK, BATALKAN
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Premium Glassmorphic Confirmation Modal */}
          {confirmModal && confirmModal.isOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirmModal(null)}
                className="absolute inset-0 bg-teal-950/40 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/40 rounded-[3rem] p-10 shadow-2xl shadow-teal-950/10 space-y-8"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner",
                  confirmModal.type === "danger" 
                    ? "bg-rose-50 text-rose-500 shadow-rose-100" 
                    : confirmModal.type === "warning"
                    ? "bg-amber-50 text-amber-500 shadow-amber-100"
                    : "bg-teal-50 text-teal-500 shadow-teal-100"
                )}>
                  {confirmModal.type === "danger" ? (
                    <AlertCircle className="w-8 h-8" />
                  ) : confirmModal.type === "warning" ? (
                    <Info className="w-8 h-8" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    confirmModal.type === "danger" 
                      ? "text-rose-500" 
                      : confirmModal.type === "warning"
                      ? "text-amber-500"
                      : "text-teal-500"
                  )}>
                    {confirmModal.title}
                  </h3>
                  <h2 className="text-2xl font-black text-teal-950 leading-tight">
                    {confirmModal.message}
                  </h2>
                  {confirmModal.description && (
                    <p className="text-xs text-teal-800/50 font-medium leading-relaxed">
                      {confirmModal.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={confirmModal.onConfirm}
                    disabled={loading}
                    className={cn(
                      "w-full py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] disabled:opacity-50",
                      confirmModal.type === "danger"
                        ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200"
                        : confirmModal.type === "warning"
                        ? "bg-amber-500 hover:bg-amber-600 shadow-amber-200"
                        : "bg-teal-600 hover:bg-teal-700 shadow-teal-200"
                    )}
                  >
                    {confirmModal.confirmText || "KONFIRMASI"}
                  </button>
                  <button
                    onClick={() => setConfirmModal(null)}
                    disabled={loading}
                    className="w-full py-4 bg-teal-50/50 text-teal-900/60 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-100/50 transition-all"
                  >
                    {confirmModal.cancelText || "BATAL"}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Float Notification Toast */}
          {message && (
            <div className="fixed bottom-6 right-6 z-[300] max-w-sm w-full px-6 sm:px-0">
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 50, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "p-5 rounded-[2.5rem] flex items-center gap-4 text-xs font-black uppercase tracking-wider shadow-2xl border backdrop-blur-xl bg-white/80 border-white/50",
                  message.type === "success"
                    ? "text-emerald-700 shadow-emerald-500/10 border-emerald-100"
                    : "text-rose-700 shadow-rose-500/10 border-rose-100",
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  message.type === "success" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
                )}>
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 pr-4 normal-case text-teal-950 font-semibold leading-snug">
                  {message.text}
                </div>
                <button
                  onClick={() => setMessage(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-teal-950/30 hover:bg-teal-950/5 hover:text-teal-950 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard;
