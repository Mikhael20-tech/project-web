import React, { useState, useEffect } from "react";
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
  Info,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Search,
  Download,
  Folder,
  FileText,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/lib/LanguageContext";

const categoryColors: Record<string, string> = {
  MOA: "bg-blue-50 text-blue-700 border-blue-100",
  IA: "bg-indigo-50 text-indigo-700 border-indigo-100",
  PROPOSAL_MAGANG: "bg-amber-50 text-amber-700 border-amber-100",
  SURAT_PERNYATAAN_BERDAMPAK: "bg-rose-50 text-rose-700 border-rose-100",
  TEMPLATE_LAPORAN_AKHIR_MAGANG: "bg-purple-50 text-purple-700 border-purple-100",
  TEMPLATE_MOA_IA_MOBILITAS_AKADEMIK: "bg-teal-50 text-teal-700 border-teal-100",
  OTHER: "bg-slate-50 text-slate-700 border-slate-100",
};

const GuidePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"mahasiswa" | "dosen" | "admin" | "kategori" | "documents">("mahasiswa");
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Category labels built from translations so they switch with language
  const categoryLabels: Record<string, string> = {
    MOA: t("cat_label_moa"),
    IA: t("cat_label_ia"),
    PROPOSAL_MAGANG: t("cat_label_proposal_magang"),
    SURAT_PERNYATAAN_BERDAMPAK: t("cat_label_surat_berdampak"),
    TEMPLATE_LAPORAN_AKHIR_MAGANG: t("cat_label_laporan_magang"),
    TEMPLATE_MOA_IA_MOBILITAS_AKADEMIK: t("cat_label_moa_ia_mobilitas"),
    OTHER: t("cat_label_other"),
  };

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/documents");
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (err) {
        console.error("Gagal memuat dokumen:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const tabs = [
    { id: "mahasiswa", label: t("type_student"), icon: <Users className="w-4 h-4" /> },
    { id: "dosen", label: t("type_dosen"), icon: <GraduationCap className="w-4 h-4" /> },
    { id: "admin", label: t("nav_admin"), icon: <Settings className="w-4 h-4" /> },
    { id: "kategori", label: t("guide_tab_kategori"), icon: <Zap className="w-4 h-4" /> },
    { id: "documents", label: t("guide_tab_documents"), icon: <Folder className="w-4 h-4" /> },
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
            {t("port_back")}
          </button>

          <div className="bg-gradient-to-r from-teal-950 to-teal-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 max-w-2xl space-y-4">
              <span className="px-4 py-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-full text-[9px] font-black uppercase tracking-widest inline-block">
                {t("guide_badge")}
              </span>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
                {t("guide_title").split("Portal WarDosPem").length > 1 ? (
                  <>
                    {t("guide_title").split("Portal WarDosPem")[0]}
                    <span className="text-teal-400 italic">Portal WarDosPem</span>
                    {t("guide_title").split("Portal WarDosPem")[1]}
                  </>
                ) : (
                  <span className="text-teal-400 italic">{t("guide_title")}</span>
                )}
              </h1>
              <p className="text-teal-100/70 text-sm md:text-base font-medium leading-relaxed">
                {t("guide_desc")}
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
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">{t("guide_mhs_title")}</h2>
                    <p className="text-sm text-teal-800/60 font-medium">{t("guide_mhs_subtitle")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    {/* Step 1 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        1
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">{t("guide_mhs_step1_title")}</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_mhs_step1_desc")}
                        </p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        2
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">{t("guide_mhs_step2_title")}</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_mhs_step2_desc")}
                        </p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        3
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">{t("guide_mhs_step3_title")}</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_mhs_step3_desc")}
                        </p>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl flex gap-5">
                      <div className="w-12 h-12 bg-teal-950 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        4
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-extrabold text-teal-950 text-base leading-tight">{t("guide_mhs_step4_title")}</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_mhs_step4_desc")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Info Link to Documents */}
                  <div className="p-6 bg-teal-50 border border-teal-100 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-8 shadow-sm">
                    <div className="flex gap-4 items-start">
                      <FileText className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-extrabold text-teal-950 text-sm">{t("guide_mhs_doc_title")}</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_mhs_doc_desc")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("documents")}
                      className="px-5 py-2.5 bg-teal-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-teal-800 transition-all shrink-0 shadow-md shadow-teal-950/10"
                    >
                      {t("guide_mhs_doc_btn")}
                    </button>
                  </div>

                </div>
              )}

              {/* --- DOSEN TAB --- */}
              {activeTab === "dosen" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">{t("guide_dosen_title")}</h2>
                    <p className="text-sm text-teal-800/60 font-medium">{t("guide_dosen_subtitle")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <Award className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">{t("guide_dosen_card1_title")}</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        {t("guide_dosen_card1_desc")}
                      </p>
                    </div>

                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <BookOpen className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">{t("guide_dosen_card2_title")}</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        {t("guide_dosen_card2_desc")}
                      </p>
                    </div>

                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">{t("guide_dosen_card3_title")}</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        {t("guide_dosen_card3_desc")}
                      </p>
                    </div>

                    <div className="p-6 bg-teal-50/30 border border-teal-50/50 rounded-3xl space-y-3">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-teal-600" />
                        <h3 className="font-extrabold text-teal-950 text-base">{t("guide_dosen_card4_title")}</h3>
                      </div>
                      <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                        {t("guide_dosen_card4_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- ADMIN TAB --- */}
              {activeTab === "admin" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">{t("guide_admin_title")}</h2>
                    <p className="text-sm text-teal-800/60 font-medium">{t("guide_admin_subtitle")}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Calendar className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">{t("guide_admin_item1_title")}</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_admin_item1_desc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Zap className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">{t("guide_admin_item2_title")}</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_admin_item2_desc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Info className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">{t("guide_admin_item3_title")}</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_admin_item3_desc")}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-5 border border-teal-50 rounded-2xl hover:bg-slate-50 transition-colors">
                      <Users className="w-5 h-5 text-teal-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold text-teal-950">{t("guide_admin_item4_title")}</h4>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_admin_item4_desc")}
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
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">{t("guide_cat_title")}</h2>
                    <p className="text-sm text-teal-800/60 font-medium">{t("guide_cat_subtitle")}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 max-w-3xl">
                    {/* Magang */}
                    <div className="bg-[#fcfefe] border border-teal-50 rounded-3xl p-8 space-y-4 shadow-sm hover:border-teal-100 transition-all">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-teal-950">{t("guide_cat_magang_title")}</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          <strong>{t("guide_cat_magang_desc")}</strong>
                        </p>
                        <div className="p-3 bg-indigo-50/50 rounded-xl text-[10px] text-indigo-950 font-bold border border-indigo-100">
                          {t("guide_cat_magang_format_label")} <br/>
                          <span className="font-mono text-[9px]">"{t("guide_cat_magang_format_template")}"</span> <br/>
                          {t("guide_cat_magang_format_example")}
                        </div>
                      </div>
                    </div>

                    {/* Skripsi */}
                    <div className="bg-[#fcfefe] border border-teal-50 rounded-3xl p-8 space-y-4 shadow-sm hover:border-teal-100 transition-all">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-black text-teal-950">{t("guide_cat_skripsi_title")}</h3>
                        <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                          {t("guide_cat_skripsi_desc")}
                        </p>
                        <div className="p-3 bg-emerald-50/50 rounded-xl text-[10px] text-emerald-950 font-bold border border-emerald-100">
                          {t("guide_cat_skripsi_mech_label")} <br/>
                          <span className="font-normal italic leading-tight block mt-1">
                            • {t("guide_cat_skripsi_mech_1")} <br/>
                            • {t("guide_cat_skripsi_mech_2")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* --- DOCUMENTS TAB --- */}
              {activeTab === "documents" && (
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-teal-950 tracking-tight">{t("guide_doc_title")}</h2>
                    <p className="text-sm text-teal-800/60 font-medium">
                      {t("guide_doc_subtitle")}
                    </p>
                  </div>

                  {/* Search and Category Filter */}
                  <div className="flex flex-col sm:flex-row gap-4 p-6 bg-teal-50/20 border border-teal-50 rounded-[2rem]">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-teal-400 absolute left-4 top-3.5" />
                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t("doc_search_placeholder")}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-teal-100 rounded-xl text-xs font-bold text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="p-2.5 bg-white border border-teal-100 rounded-xl text-xs font-bold text-teal-950 focus:outline-none w-full sm:w-64"
                    >
                      <option value="All">{t("doc_category_all")}</option>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Documents Grid */}
                  {loading ? (
                    <div className="py-12 text-center text-teal-800/40 uppercase tracking-widest font-black flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                      {t("guide_doc_loading")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {documents
                        .filter((doc) => {
                          const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
                          const matchCat = categoryFilter === "All" || doc.category === categoryFilter;
                          return matchSearch && matchCat;
                        })
                        .map((doc) => (
                          <motion.div
                            key={doc.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border border-teal-50 rounded-[2rem] p-6 hover:shadow-xl hover:border-teal-200 transition-all flex flex-col justify-between gap-6"
                          >
                            <div className="space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                  categoryColors[doc.category] || "bg-slate-50 text-slate-700 border-slate-100"
                                )}>
                                  {categoryLabels[doc.category] || doc.category}
                                </span>
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 rounded text-[9px] font-black uppercase tracking-wider">
                                  {doc.fileUrl ? (doc.fileType || "FILE") : "LINK"}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-lg font-black text-teal-950 tracking-tight leading-snug">
                                  {doc.title}
                                </h3>
                                <p className="text-xs text-teal-800/70 font-semibold leading-relaxed">
                                  {doc.description || t("guide_doc_no_desc")}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-teal-50/50">
                              <div className="text-[9px] font-bold text-teal-800/40 uppercase tracking-wider">
                                {t("guide_doc_uploaded")} {new Date(doc.createdAt).toLocaleDateString()}
                              </div>
                              {doc.fileUrl ? (
                                <a
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-teal-700 transition-all shadow-md shadow-teal-500/10"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  {t("guide_doc_download")}
                                </a>
                              ) : (
                                <a
                                  href={doc.driveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/10"
                                >
                                  <Briefcase className="w-3.5 h-3.5" />
                                  {t("guide_doc_open_link")}
                                </a>
                              )}
                            </div>
                          </motion.div>
                        ))}

                      {documents.filter((doc) => {
                        const matchSearch = doc.title.toLowerCase().includes(search.toLowerCase());
                        const matchCat = categoryFilter === "All" || doc.category === categoryFilter;
                        return matchSearch && matchCat;
                      }).length === 0 && (
                        <div className="col-span-full py-16 text-center border-2 border-dashed border-teal-100 rounded-[2.5rem] bg-teal-50/10 text-teal-800/30 uppercase tracking-widest font-black">
                          <Folder className="w-10 h-10 mx-auto mb-2 opacity-30" />
                          {t("guide_doc_empty")}
                        </div>
                      )}
                    </div>
                  )}
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
