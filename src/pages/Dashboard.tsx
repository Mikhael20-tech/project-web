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
import { socket } from "@/src/lib/socket";
import { cn } from "@/src/lib/utils";
import { useToast } from "@/src/components/ToastProvider";
import { useLanguage } from "@/src/lib/LanguageContext";
import LoadingOverlay from "@/src/components/LoadingOverlay";
import DosenCardSkeleton from "@/src/components/DosenCardSkeleton";
import confetti from "canvas-confetti";

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
    nama: "",
    kontak: "",
    peminatan: "",
    bio: "",
    foto: "",
    rencanaJudul: "",
  });
  const [magangTempat, setMagangTempat] = useState("");
  const [magangPosisi, setMagangPosisi] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
        const judul = data.rencanaJudul || "";
        setProfileForm({
          nama: data.nama || "",
          kontak: data.kontak || "",
          peminatan: data.peminatan || "",
          bio: data.bio || "",
          foto: data.foto || "",
          rencanaJudul: judul,
        });
        
        if (judul && judul.includes(" - ")) {
           const parts = judul.split(" - ");
           setMagangPosisi(parts[0]?.trim() || "");
           setMagangTempat(parts.slice(1).join(" - ")?.trim() || "");
        } else {
           setMagangPosisi(judul);
        }
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
        title: t("toast_deleted_title"),
        description: t("toast_deleted_desc"),
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
    const init = async () => {
      setInitialLoading(true);
      await Promise.all([fetchDosen(), fetchConfig(), fetchStudentData()]);
      setInitialLoading(false);
    };
    init();

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
    
    // Combine magang fields immediately before submission to ensure fresh state
    let finalJudul = profileForm.rencanaJudul;
    if (config?.category === "MAGANG") {
      const pos = magangPosisi.trim();
      const tempat = magangTempat.trim();
      finalJudul = (pos || tempat) ? `${pos} - ${tempat}` : "";
    }
    
    const payload = { ...profileForm, rencanaJudul: finalJudul };

    try {
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
    if (!studentData) return;
    setLoading(true);
    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const W = pdf.internal.pageSize.getWidth();   // 210
      const H = pdf.internal.pageSize.getHeight();  // 297

      // ── Helper: fetch image as base64 (via proxy to bypass CORS) ──
      const toBase64 = async (url: string, name = "image"): Promise<string | null> => {
        if (!url) return null;
        console.log(`📸 PDF: Fetching ${name} from ${url}`);
        try {
          const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const blob = await res.blob();
            return await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
          console.warn(`⚠️ PDF: Proxy fetch failed for ${name}, status: ${res.status}`);
        } catch (e) {
          console.error(`❌ PDF: Proxy error for ${name}:`, e);
        }
        
        try {
          const res = await fetch(url);
          if (res.ok) {
            const blob = await res.blob();
            return await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(blob);
            });
          }
        } catch { return null; }
        return null;
      };

      const studentPhotoB64 = studentData.foto ? await toBase64(studentData.foto, "student") : null;
      const dosenPhotoB64 = studentData.dosen?.foto ? await toBase64(studentData.dosen.foto, "dosen") : null;

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // BACKGROUND
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      pdf.setFillColor(245, 250, 249);
      pdf.rect(0, 0, W, H, "F");

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // HERO HEADER (dark)
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      pdf.setFillColor(4, 47, 46);
      pdf.rect(0, 0, W, 70, "F");

      // Decorative circles (subtle)
      pdf.setGState(pdf.GState({ opacity: 0.07 }));
      pdf.setFillColor(20, 184, 166);
      pdf.circle(W - 10, 10, 40, "F");
      pdf.circle(W - 25, 65, 28, "F");
      pdf.setGState(pdf.GState({ opacity: 1 }));

      // Orange left accent stripe
      pdf.setFillColor(249, 115, 22);
      pdf.rect(0, 0, 6, 70, "F");

      // Teal bottom strip of header
      pdf.setFillColor(13, 148, 136);
      pdf.rect(6, 67, W - 6, 3, "F");

      // â”€â”€ Header text â”€â”€
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.text("BUKTI PEMILIHAN", 16, 26);
      pdf.text("DOSEN PEMBIMBING", 16, 37);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(134, 239, 172);
      pdf.text("War Dosen PTI UNESA  Â·  Dokumen Resmi Sistem", 16, 48);

      pdf.setFontSize(7.5);
      pdf.setTextColor(148, 163, 184);
      pdf.text(`Diterbitkan: ${new Date().toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}`, 16, 56);

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // STUDENT INFO SECTION  (with photo)
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      const cardY = 78;
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(10, cardY, W - 20, 55, 5, 5, "F");
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(10, cardY, W - 20, 55, 5, 5, "S");

      // Teal accent bar (left)
      pdf.setFillColor(13, 148, 136);
      pdf.roundedRect(10, cardY, 4, 55, 2, 2, "F");

      // Photo circle
      const photoX = 30;
      const photoY = cardY + 28;
      const photoR = 16;

      if (studentPhotoB64) {
        pdf.addImage(studentPhotoB64, "JPEG", photoX - photoR, cardY + 10, photoR * 2, photoR * 2);
        // circular clip effect via overlapping shapes
        pdf.setDrawColor(13, 148, 136);
        pdf.setLineWidth(1);
        pdf.circle(photoX, photoY, photoR, "S");
      } else {
        // Fallback avatar circle
        pdf.setFillColor(13, 148, 136);
        pdf.circle(photoX, photoY, photoR, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        const initials = (studentData.nama || "MHS").split(" ").slice(0, 2).map((n: string) => n[0]).join("");
        pdf.text(initials, photoX, photoY + 5, { align: "center" });
      }

      // Student text info (right of photo)
      const textX = photoX + photoR + 8;
      pdf.setTextColor(100, 116, 139);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.text("MAHASISWA", textX, cardY + 14);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      // Ensure name fits in the remaining width
      const maxNameW = W - 20 - textX - 8;
      const nameLines = pdf.splitTextToSize(studentData.nama || "-", maxNameW);
      pdf.text(nameLines, textX, cardY + 22);

      pdf.setTextColor(13, 148, 136);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(`NIM: ${studentData.nim || "-"}`, textX, cardY + 34);

      pdf.setTextColor(100, 116, 139);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(`Angkatan : ${studentData.angkatan || "-"}    Â·    Periode : ${studentData.periode || config?.periode || "-"}`, textX, cardY + 42);

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // DOSEN SECTION
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      const dosenY = cardY + 63;
      const dosenBoxH = 52;
      pdf.setFillColor(4, 47, 46);
      pdf.roundedRect(10, dosenY, W - 20, dosenBoxH, 5, 5, "F");

      // Decorative right circle
      pdf.setGState(pdf.GState({ opacity: 0.06 }));
      pdf.setFillColor(20, 184, 166);
      pdf.circle(W - 20, dosenY + dosenBoxH / 2, 30, "F");
      pdf.setGState(pdf.GState({ opacity: 1 }));

      // Orange left bar
      pdf.setFillColor(249, 115, 22);
      pdf.roundedRect(10, dosenY, 4, dosenBoxH, 2, 2, "F");

      // Dosen photo (right side)
      const dosenPhotoSize = 32;
      const dosenPhotoX = W - 20 - dosenPhotoSize;
      const dosenPhotoY = dosenY + (dosenBoxH - dosenPhotoSize) / 2;
      if (dosenPhotoB64) {
        pdf.addImage(dosenPhotoB64, "JPEG", dosenPhotoX, dosenPhotoY, dosenPhotoSize, dosenPhotoSize);
        pdf.setDrawColor(20, 184, 166);
        pdf.setLineWidth(0.8);
        pdf.rect(dosenPhotoX, dosenPhotoY, dosenPhotoSize, dosenPhotoSize, "S");
      } else {
        // fallback circle avatar
        pdf.setFillColor(13, 148, 136);
        pdf.roundedRect(dosenPhotoX, dosenPhotoY, dosenPhotoSize, dosenPhotoSize, 4, 4, "F");
        pdf.setTextColor(255, 255, 255);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        const dosenInitials = (studentData.dosen?.nama || "D").split(" ").slice(0, 2).map((n: string) => n[0]).join("");
        pdf.text(dosenInitials, dosenPhotoX + dosenPhotoSize / 2, dosenPhotoY + dosenPhotoSize / 2 + 4, { align: "center" });
      }

      // Dosen text (left side)
      const dosenTextMaxW = W - 20 - dosenPhotoSize - 16;
      pdf.setTextColor(249, 115, 22); // Orange (matching user screenshot)
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text("DOSEN PEMBIMBING TERPILIH", 20, dosenY + 12);

      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      const dosenNameLines = pdf.splitTextToSize(studentData.dosen?.nama || "-", dosenTextMaxW);
      pdf.text(dosenNameLines, 20, dosenY + 22);

      pdf.setTextColor(20, 184, 166);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text(`NIP. ${studentData.dosen?.nip || "-"}`, 20, dosenY + 38);

      if (studentData.dosen?.kontak) {
        pdf.setTextColor(148, 163, 184);
        pdf.setFontSize(7.5);
        pdf.text(`WA: ${studentData.dosen.kontak}`, 20, dosenY + 46);
      }


      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // RENCANA JUDUL / POSISI BOX
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      const labelJudul = config?.category === "MAGANG" ? "POSISI & TEMPAT MAGANG" :
                         config?.category === "PLP" ? "RENCANA PROGRAM PLP" : "RENCANA JUDUL PENELITIAN";
      const judulText = `"${studentData.rencanaJudul || "Belum ditentukan"}"`;
      const judulLines2 = pdf.splitTextToSize(judulText, W - 48);
      const judulBoxH = Math.max(28, judulLines2.length * 7 + 18);

      const judulY = dosenY + 50;
      pdf.setFillColor(240, 253, 250);
      pdf.roundedRect(10, judulY, W - 20, judulBoxH, 5, 5, "F");
      pdf.setDrawColor(153, 212, 204);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(10, judulY, W - 20, judulBoxH, 5, 5, "S");
      pdf.setFillColor(249, 115, 22);
      pdf.roundedRect(10, judulY, 4, judulBoxH, 2, 2, "F");

      pdf.setTextColor(100, 116, 139);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6.5);
      pdf.text(labelJudul, 20, judulY + 10);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont("helvetica", "bolditalic");
      pdf.setFontSize(10);
      pdf.text(judulLines2, 20, judulY + 20);

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // BADGES ROW
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      const badgeY = judulY + judulBoxH + 10;

      // Verified badge
      pdf.setFillColor(16, 185, 129);
      pdf.roundedRect(10, badgeY, 58, 12, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      pdf.text("âœ“  TERVERIFIKASI", 39, badgeY + 8.3, { align: "center" });

      // Category badge
      const catColors: Record<string, number[]> = {
        MAGANG: [99, 102, 241],
        PLP: [244, 63, 94],
        SKRIPSI_ARTIKEL: [20, 184, 166],
      };
      const catKey = config?.category || "SKRIPSI_ARTIKEL";
      const cc = catColors[catKey] || [20, 184, 166];
      pdf.setFillColor(cc[0], cc[1], cc[2]);
      pdf.roundedRect(74, badgeY, 48, 12, 3, 3, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8.5);
      const catLabel = config?.category === "MAGANG" ? "â— MAGANG" :
                       config?.category === "PLP"    ? "â— PLP" : "â— SKRIPSI";
      pdf.text(catLabel, 98, badgeY + 8.3, { align: "center" });

      // Decorative seal
      const sealX = W - 30;
      const sealY2 = badgeY + 6;
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(249, 115, 22);
      pdf.setLineWidth(0.9);
      pdf.circle(sealX, sealY2, 15, "FD");
      pdf.setDrawColor(249, 115, 22);
      pdf.setLineWidth(0.3);
      pdf.circle(sealX, sealY2, 12, "S");
      pdf.setTextColor(249, 115, 22);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(6);
      pdf.text("PTI", sealX, sealY2 - 1.5, { align: "center" });
      pdf.text("UNESA", sealX, sealY2 + 4, { align: "center" });
      pdf.setFontSize(4.5);
      pdf.text("OFFICIAL", sealX, sealY2 + 8.5, { align: "center" });

      // â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• â• 
      // SIGNATURE AREA
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      const sigY = badgeY + 28;
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.4);
      pdf.line(10, sigY, W - 10, sigY);

      pdf.setTextColor(100, 116, 139);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.text("Mengetahui,", W - 60, sigY + 8);
      pdf.setFont("helvetica", "bold");
      pdf.text("Koordinator Prodi PTI UNESA", W - 60, sigY + 15);
      pdf.setDrawColor(180, 200, 200);
      pdf.setLineWidth(0.5);
      pdf.line(W - 70, sigY + 38, W - 12, sigY + 38);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(148, 163, 184);
      pdf.text("( Tanda Tangan & Cap Basah )", W - 41, sigY + 44, { align: "center" });

      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      // FOOTER
      // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
      pdf.setFillColor(4, 47, 46);
      pdf.rect(0, H - 18, W, 18, "F");
      pdf.setFillColor(249, 115, 22);
      pdf.rect(0, H - 18, 6, 18, "F");
      pdf.setFillColor(13, 148, 136);
      pdf.rect(6, H - 18, W - 6, 2, "F");

      pdf.setTextColor(148, 163, 184);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6.5);
      pdf.text(
        "Dokumen ini diterbitkan secara otomatis oleh Sistem WarDosen PTI UNESA · Tidak memerlukan tanda tangan basah · v2.1",
        W / 2 + 3, H - 8,
        { align: "center", maxWidth: W - 20 }
      );

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

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch gap-6">

              {/* LEFT — Dosen Card with photo */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-300">{t("dash_student_status")}</h3>
                </div>

                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5">
                  <p className="text-[10px] font-black uppercase text-teal-400/60 mb-4 tracking-widest">{t("dash_student_dosen_choice")}</p>

                  <div className="flex items-center gap-5">
                    {/* Dosen Photo */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-teal-800 border-2 border-emerald-500/40 shadow-lg">
                        {studentData.dosen.foto ? (
                          <img src={studentData.dosen.foto} alt={studentData.dosen.nama} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <GraduationCap className="w-8 h-8 text-teal-400" />
                          </div>
                        )}
                      </div>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-teal-900 flex items-center justify-center shadow">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>

                    {/* Dosen Info */}
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[9px] uppercase font-black text-emerald-400/70 tracking-widest">{t("dash_student_selected")}</span>
                      <span className="text-base font-black text-emerald-50 leading-tight">{studentData.dosen.nama}</span>
                      <span className="text-[10px] font-bold text-teal-400">NIP. {studentData.dosen.nip}</span>
                      {studentData.dosen.kontak && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <Smartphone className="w-3 h-3 text-teal-500" />
                          <span className="text-[10px] font-bold text-teal-300">{studentData.dosen.kontak}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 py-4 w-full md:w-auto md:flex-col md:h-auto">
                <div className="h-px bg-teal-800 flex-1 md:w-px md:h-full"></div>
                <span className="text-[10px] font-black uppercase text-teal-500/30 tracking-[0.5em] md:rotate-90">INFO</span>
                <div className="h-px bg-teal-800 flex-1 md:w-px md:h-full"></div>
              </div>

              {/* RIGHT — Status & Download */}
              <div className="flex-1 w-full">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
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
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-teal-400/30 mb-1 tracking-widest">{t("dash_student_angkatan")}</p>
                      <p className="text-sm font-bold text-teal-100">{studentData.periode || config?.periode || "-"}</p>
                    </div>
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

                      {config?.category === "SKRIPSI_ARTIKEL" ? (
                        <div className="space-y-2 mt-4 flex-1 flex flex-col justify-end">
                          {dosen.penelitian?.map((p: any) => (
                            <button
                              key={p.id}
                              onClick={() => setConfirmingDosen({ dosen, title: p.judul })}
                              disabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed() || !studentData?.rencanaJudul}
                              className={cn(
                                "w-full py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-300 text-left truncate border",
                                isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed() && studentData?.rencanaJudul
                                  ? "bg-teal-50 text-teal-800 hover:bg-teal-500 hover:text-white border-teal-100 hover:border-teal-500 shadow-sm"
                                  : "bg-slate-50 text-slate-400 cursor-not-allowed border-slate-100"
                              )}
                              title={p.judul}
                            >
                              PILIH: {p.judul}
                            </button>
                          ))}
                          <button
                            onClick={() => setConfirmingDosen({ dosen, title: studentData?.rencanaJudul })}
                            disabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed() || !studentData?.rencanaJudul}
                            className={cn(
                              "w-full py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 shadow-sm mt-2",
                              isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed() && studentData?.rencanaJudul
                                ? "bg-teal-950 text-white hover:bg-teal-800 border border-teal-900"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                            )}
                          >
                            PILIH (JUDUL DARI PROFIL)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDosen({ dosen, title: studentData?.rencanaJudul })}
                          disabled={!isWarActive || config?.isForcedClosed || dosen.kuotaMax - dosen._count.mahasiswa <= 0 || loading || !isBatchAllowed() || !studentData?.rencanaJudul}
                          className={cn(
                            "w-full py-6 mt-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl overflow-hidden relative",
                            isWarActive && !config?.isForcedClosed && dosen.kuotaMax - dosen._count.mahasiswa > 0 && isBatchAllowed() && studentData?.rencanaJudul
                              ? "bg-teal-950 text-white hover:bg-teal-500 shadow-teal-950/20 hover:-translate-y-2"
                              : "bg-teal-50 text-teal-800/20 cursor-not-allowed border border-teal-100"
                          )}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 
                              (config?.isForcedClosed ? t("dash_student_system_closed") :
                              (!isWarActive ? t("dash_student_waiting_war") : 
                              (!isBatchAllowed() ? t("dash_student_access_denied") :
                              (!studentData?.rencanaJudul ? "ISI PROFIL TERLEBIH DAHULU" :
                              (dosen.kuotaMax - dosen._count.mahasiswa <= 0 ? t("dash_student_quota_full") : t("dash_student_pick_advisor"))))))}
                          </span>
                        </button>
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

                     {config?.category === "MAGANG" ? (
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Posisi Magang</label>
                            <input 
                              value={magangPosisi} 
                              onChange={(e) => setMagangPosisi(e.target.value)} 
                              className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" 
                              placeholder="Misal: UI/UX Designer" 
                              required 
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">Tempat / Instansi</label>
                            <input 
                              value={magangTempat} 
                              onChange={(e) => setMagangTempat(e.target.value)} 
                              className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none" 
                              placeholder="Misal: PT. Telkom Indonesia" 
                              required 
                            />
                          </div>
                        </div>
                     ) : (
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                            {config?.category === "PLP" ? "Lokasi & Rencana PLP" : "Rencana Judul Riset Anda"}
                          </label>
                          <textarea value={profileForm.rencanaJudul} onChange={(e) => setProfileForm({...profileForm, rencanaJudul: e.target.value})} className="w-full bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3 text-sm font-bold text-teal-950 focus:ring-4 focus:ring-teal-500/10 focus:outline-none min-h-[80px]" placeholder="Ketik disini..." required />
                       </div>
                     )}

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

