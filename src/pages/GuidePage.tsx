import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Users,
  GraduationCap,
  Settings,
  Zap,
  BookOpen,
  Briefcase,
  Award,
  CheckCircle2,
  Info,
  Calendar,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const GuidePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"mahasiswa" | "dosen" | "admin" | "kategori">("mahasiswa");

  const tabs = [
    { id: "mahasiswa", label: "Mahasiswa", icon: <Users className="w-4 h-4" /> },
    { id: "dosen", label: "Dosen", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "admin", label: "Admin", icon: <Settings className="w-4 h-4" /> },
    { id: "kategori", label: "Kategori War", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F0FAF8] pt-32 pb-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Back Button & Header Banner */}
        <div className="flex flex-col gap-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-teal-100 rounded-xl text-teal-800 text-[10px] font-black uppercase tracking-widest hover:bg-teal-50 hover:border-teal-200 transition-all shadow-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>

          <div className="bg-gradient-to-r from-teal-950 to-teal-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-4 py-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                Pusat Bantuan Akademik
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                Panduan <span className="text-teal-400 italic">Portal WarDosen</span>
              </h1>
              <p className="text-teal-100/70 text-sm md:text-base font-medium leading-relaxed">
                Pelajari langkah-langkah, aturan, dan mekanisme pemilihan dosen pembimbing secara kompetitif, adil, dan transparan. Panduan ini mencakup peran mahasiswa, dosen, admin, serta penjelasan khusus tiga kategori war.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-teal-950/5 border border-teal-950/10 rounded-3xl w-fit shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2.5 relative",
                activeTab === tab.id
                  ? "bg-teal-950 text-white shadow-lg shadow-teal-950/20"
                  : "text-teal-800/60 hover:text-teal-950 hover:bg-teal-50"
              )}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="guide-tab-glow"
                  className="absolute inset-0 bg-white/10 rounded-2xl"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="bg-white border border-teal-50 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.03)] min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-10"
            >
              {/* --- MAHASISWA TAB --- */}
              {activeTab === "mahasiswa" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">Panduan Alur untuk Mahasiswa</h2>
                    <p className="text-sm text-teal-800/60 font-medium">Langkah demi langkah bagi mahasiswa untuk memenangkan war dosen pembimbing pilihan.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Step 1 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        1
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">Lengkapi Profil Wajib</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Sebelum masa war dimulai, lengkapi foto profil asli, nomor WhatsApp aktif, dan perbarui password bawaan Anda. Profil yang tidak lengkap akan memblokir tombol pemilihan.
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        2
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">Eksplorasi Portofolio Dosen</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Pelajari direktori portofolio dosen di menu utama. Tinjau bidang keahlian, topik riset yang ditawarkan (jika ada), sisa kuota bimbingan, serta kesesuaian dengan rencana riset/lokasi magang Anda.
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        3
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">Input Judul / Lokasi Rencana</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Masukkan draf rencana judul skripsi, posisi magang, atau nama mitra sekolah Anda di pengaturan profil. Data ini akan otomatis dilampirkan dan dikunci saat Anda mengklik tombol pilih dosen.
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        4
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">Ikuti Real-time Live War</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Pantau penghitung mundur server. Saat status beralih menjadi <strong>LIVE WAR</strong>, klik tombol "PILIH" di samping nama dosen target secepat mungkin. Kuota diproses real-time (first-come, first-served).
                        </p>
                      </div>
                    </div>
                  </div>


                </div>
              )}

              {/* --- DOSEN TAB --- */}
              {activeTab === "dosen" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">Panduan Alur untuk Dosen</h2>
                    <p className="text-sm text-teal-800/60 font-medium">Bagaimana dosen memantau kuota bimbingan, menyusun projek penawaran, dan mengelola daftar bimbingan.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">Kelola Profil & Keahlian</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        Lengkapi bidang keahlian spesifik, riwayat pendidikan singkat, dan kutipan riset/bio Anda. Informasi profil yang menarik akan membantu mahasiswa mengenali relevansi topik Anda.
                      </p>
                    </div>

                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">Tawarkan Projek Penelitian</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        Di tab "Projek Dosen", tambahkan topik-topik penelitian aktif yang Anda tawarkan. Mahasiswa skripsi dapat langsung memilih topik tersebut saat proses war berlangsung.
                      </p>
                    </div>

                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">Pantau Mahasiswa Bimbingan</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        Lihat daftar nama mahasiswa yang berhasil memenangkan kuota Anda secara real-time. Anda dapat langsung mengklik tombol kontak WhatsApp untuk segera terhubung dan berdiskusi.
                      </p>
                    </div>

                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">Manajemen Bimbingan</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        Dosen memiliki hak prerogatif untuk menyetujui rencana bimbingan. Jika terdapat ketidaksesuaian topik yang krusial, dosen dapat mengeluarkan mahasiswa dari daftar agar kuota slot kembali terbuka.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ADMIN TAB --- */}
              {activeTab === "admin" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">Panduan Ruang Kontrol Admin</h2>
                    <p className="text-sm text-teal-800/60 font-medium">Pengelolaan pintu akses war, integrasi blast WhatsApp, dan manajemen data server.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Calendar className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">Konfigurasi Jadwal & Target Periode</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Atur waktu mulai (START) dan waktu selesai (END) secara presisi. Tentukan juga Kategori War yang aktif (Magang, PLP, atau Skripsi) serta target angkatan yang boleh ikut bertanding (misal: "22, 23").
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Zap className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">Impor Massal Terverifikasi AI</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Gunakan Asisten Impor AI untuk meregistrasikan ribuan mahasiswa atau puluhan dosen baru. Cukup upload Excel/CSV atau copy-paste chat WA daftar mentah. AI akan merapikan nama (Title Case), mendeteksi anomali NIM/NIP, dan memeriksa duplikasi sebelum masuk ke database.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Info className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">Emergency Stop & Emergency Control</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Jika terjadi kendala sistem atau kebocoran jadwal, Admin dapat mengklik tombol "EMERGENCY STOP" di tab Jadwal untuk langsung mengunci seluruh aksi pemilihan dosen di seluruh portal secara instan.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Users className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">WhatsApp AI Broadcast Center</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Gunakan generator teks AI (Gemini) untuk menyusun pesan pengumuman resmi WhatsApp dengan gaya profesional dan ikonik, lalu kirimkan blast pesan tersebut secara massal ke angkatan aktif terpilih.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- KATEGORI TAB --- */}
              {activeTab === "kategori" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">Kategori Pemilihan (War Kategori)</h2>
                    <p className="text-sm text-teal-800/60 font-medium">Sistem portal ini terbagi menjadi 3 fokus kategori sesuai dengan agenda akademik semester prodi:</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                    {/* Magang */}
                    <div className="bg-[#fcfefe] border border-teal-50 rounded-3xl p-8 space-y-4 shadow-sm hover:border-teal-100 transition-all">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-teal-950">1. War Magang</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Masa pemilihan <strong>Dosen Pembimbing Lapangan (DPL) Magang Industri</strong>. 
                        </p>
                        <div className="p-3 bg-indigo-50/50 rounded-xl text-[10px] text-indigo-950 font-bold border border-indigo-100">
                          Format Judul Profil: <br/>
                          <span className="font-mono text-[9px]">"Posisi Magang - Nama Mitra"</span> <br/>
                          Contoh: <span className="font-normal italic">UI/UX Designer - PT GoTo</span>
                        </div>
                      </div>
                    </div>

                    {/* PLP */}
                    <div className="bg-[#fcfefe] border border-teal-50 rounded-3xl p-8 space-y-4 shadow-sm hover:border-teal-100 transition-all">
                      <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-teal-950">2. War PLP</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Masa pemilihan <strong>Dosen Pembimbing PLP</strong> (Pengenalan Lapangan Persekolahan) untuk praktek mengajar mahasiswa di sekolah mitra.
                        </p>
                        <div className="p-3 bg-rose-50/50 rounded-xl text-[10px] text-rose-950 font-bold border border-rose-100">
                          Format Judul Profil: <br/>
                          <span className="font-mono text-[9px]">"Lokasi PLP / Nama Sekolah"</span> <br/>
                          Contoh: <span className="font-normal italic">SMKN 1 Surabaya</span>
                        </div>
                      </div>
                    </div>

                    {/* Skripsi */}
                    <div className="bg-[#fcfefe] border border-teal-50 rounded-3xl p-8 space-y-4 shadow-sm hover:border-teal-100 transition-all">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-teal-950">3. War Skripsi / Artikel</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          Masa pemilihan <strong>Dosen Pembimbing Skripsi Utama</strong>. Mahasiswa bertanding memperebutkan kuota dospem berdasarkan kecocokan bidang riset.
                        </p>
                        <div className="p-3 bg-emerald-50/50 rounded-xl text-[10px] text-emerald-950 font-bold border border-emerald-100">
                          Mekanisme Pemilihan: <br/>
                          <span className="font-normal italic leading-tight block mt-1">
                            • Memilih judul penelitian yang ditawarkan dosen. <br/>
                            • Atau mengajukan judul rencana proposal skripsi sendiri dari profil.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default GuidePage;
