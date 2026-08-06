import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, FileText, CheckCircle2, ShieldCheck, Download, Trash2, Bot, Info, Search, RefreshCcw, X, Upload, Zap, ChevronDown, Save, Filter, Briefcase, Folder } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import DynamicText from '@/src/components/DynamicText';

export const DocumentsTab = ({
  t,
  docForm,
  setDocForm,
  handleDocSubmit,
  handleDocFileUpload,
  docSaveLoading,
  docSearch,
  setDocSearch,
  docFilterCategory,
  setDocFilterCategory,
  categoryLabels,
  categoryColors,
  categoryTranslationKeys,
  documents,
  handleDocDelete,
  handleAiAnalysis,
  aiDocAnalyzing,
  uploadLoading
}: any) => {
  const [isDocCategoryDropdownOpen, setIsDocCategoryDropdownOpen] = useState(false);
  const [isDocCategoryDropOpen, setIsDocCategoryDropOpen] = useState(false);
  
  // handleDocAnalyzeAI alias
  const handleDocAnalyzeAI = handleAiAnalysis;

  return (
            <motion.div
              key="documents"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="grid grid-cols-1 xl:grid-cols-3 gap-8"
            >
              {/* Form Input Dokumen */}
              <div className="xl:col-span-1">
                <div className="bg-white border border-teal-50 rounded-[2.5rem] p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sticky top-28">
                  <h3 className="text-2xl font-black text-teal-950 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-500">
                      {docForm.id ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                    {docForm.id ? t("doc_edit") : t("doc_add")}
                  </h3>
                  
                  <form onSubmit={handleDocSubmit} className="space-y-6">
                    {/* Tipe Dokumen: Upload File vs Tautan Link */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("doc_source")}
                      </label>
                      <div className="flex gap-2 p-1 bg-teal-50 border border-teal-100 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setDocForm(prev => ({ ...prev, type: "upload" }))}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            docForm.type === "upload" 
                              ? "bg-teal-500 text-white shadow-md" 
                              : "text-teal-800 hover:bg-teal-100/50"
                          )}
                        >
                          {t("doc_source_upload")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDocForm(prev => ({ ...prev, type: "link" }))}
                          className={cn(
                            "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                            docForm.type === "link" 
                              ? "bg-teal-500 text-white shadow-md" 
                              : "text-teal-800 hover:bg-teal-100/50"
                          )}
                        >
                          {t("doc_source_link")}
                        </button>
                      </div>
                    </div>

                    {/* Conditional Input based on type */}
                    {docForm.type === "upload" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("doc_file")}
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            id="doc-file-input"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                            onChange={handleDocFileUpload}
                            className="hidden"
                          />
                          {docForm.fileUrl ? (
                            <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-teal-950 truncate">{docForm.fileName || t("doc_file_uploaded")}</p>
                                  <p className="text-[10px] font-medium text-teal-800/50">
                                    {docForm.fileSize ? `${(docForm.fileSize / 1024).toFixed(1)} KB` : ""} ({docForm.fileType?.toUpperCase()})
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setDocForm(prev => ({ ...prev, fileUrl: "", fileName: "", fileType: "", fileSize: 0 }))}
                                className="p-1.5 hover:bg-rose-50 text-teal-400 hover:text-rose-500 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor="doc-file-input"
                              className={cn(
                                "flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all bg-teal-50/20 border-teal-200 text-teal-500 hover:bg-teal-50/50",
                                uploadLoading && "opacity-50 pointer-events-none"
                              )}
                            >
                              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600">
                                {uploadLoading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-wider text-teal-950">
                                  {uploadLoading ? t("doc_uploading") : t("doc_choose_file")}
                                </p>
                                <p className="text-[9px] text-teal-800/40 font-bold mt-0.5">
                                  {t("doc_max_size_hint")}
                                </p>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("doc_link_label")}
                        </label>
                        <input
                          type="url"
                          value={docForm.driveUrl}
                          onChange={(e) => setDocForm({ ...docForm, driveUrl: e.target.value })}
                          placeholder="https://drive.google.com/..."
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-xs font-bold focus:outline-none focus:border-teal-400 transition-all shadow-inner"
                        />
                      </div>
                    )}

                    {/* AI AUTO CLASSIFICATION BUTTON */}
                    <button
                      type="button"
                      onClick={handleDocAnalyzeAI}
                      disabled={aiDocAnalyzing || (docForm.type === "upload" ? !docForm.fileName : !docForm.driveUrl)}
                      className="w-full py-3.5 bg-gradient-to-r from-teal-950 to-teal-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:from-teal-900 hover:to-teal-800 transition-all flex items-center justify-center gap-2 disabled:opacity-40 shadow-md shadow-teal-950/10"
                    >
                      {aiDocAnalyzing ? (
                        <RefreshCcw className="w-4 h-4 animate-spin text-teal-400" />
                      ) : (
                        <Zap className="w-4 h-4 text-teal-400" />
                      )}
                      {aiDocAnalyzing ? t("doc_ai_analyzing") : t("doc_ai_classify")}
                    </button>
                    <p className="text-[8px] text-teal-800/40 font-semibold uppercase tracking-wider text-center">
                      {t("doc_ai_hint")}
                    </p>

                    <div className="h-px bg-teal-50" />

                    {/* Judul Dokumen */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("doc_title_label")}
                      </label>
                      <input
                        type="text"
                        value={docForm.title}
                        onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                        placeholder={t("doc_title_placeholder")}
                        required
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-xs font-bold focus:outline-none focus:border-teal-400 transition-all shadow-inner"
                      />
                    </div>

                    {/* Kategori Dokumen */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("doc_category_label")}
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDocCategoryDropdownOpen(!isDocCategoryDropdownOpen)}
                          className="w-full flex items-center justify-between p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-xs font-bold text-teal-950 shadow-inner hover:border-teal-300 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/20 group"
                        >
                          <span className="truncate">
                            {t(categoryTranslationKeys[docForm.category] || "cat_label_other")}
                          </span>
                          <ChevronDown className={cn("w-4 h-4 text-teal-500 shrink-0 transition-transform duration-300", isDocCategoryDropdownOpen && "rotate-180")} />
                        </button>
                        <AnimatePresence>
                          {isDocCategoryDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-20" onClick={() => setIsDocCategoryDropdownOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute z-30 top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-teal-100 rounded-2xl shadow-2xl overflow-hidden py-1.5 max-h-60 overflow-y-auto custom-scrollbar"
                              >
                                {Object.keys(categoryTranslationKeys).map((key) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                      setDocForm({ ...docForm, category: key });
                                      setIsDocCategoryDropdownOpen(false);
                                    }}
                                    className={cn(
                                      "w-full px-4 py-3 text-left text-xs font-bold flex items-center justify-between transition-colors",
                                      docForm.category === key
                                        ? "bg-teal-50 text-teal-950 font-black"
                                        : "text-teal-800/70 hover:bg-teal-50/50 hover:text-teal-950"
                                    )}
                                  >
                                    <span className="truncate pr-2">{t(categoryTranslationKeys[key])}</span>
                                    {docForm.category === key && <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Deskripsi Dokumen */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("doc_desc_label")}
                      </label>
                      <textarea
                        value={docForm.description}
                        onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                        placeholder={t("doc_desc_placeholder")}
                        rows={3}
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-[1.25rem] text-teal-950 text-xs font-bold focus:outline-none focus:border-teal-400 transition-all shadow-inner resize-none"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      {docForm.id && (
                        <button
                          type="button"
                          onClick={() => setDocForm({
                            id: "",
                            title: "",
                            description: "",
                            category: "MOA",
                            type: "upload",
                            fileUrl: "",
                            driveUrl: "",
                            fileType: "",
                            fileSize: 0,
                            fileName: "",
                          })}
                          className="px-4 py-4 bg-teal-50 hover:bg-teal-100 text-teal-800/60 rounded-2xl font-black text-[10px] uppercase tracking-wider transition-all"
                        >
                          {t("doc_cancel")}
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={docSaveLoading}
                        className="flex-1 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/10"
                      >
                        {docSaveLoading ? (
                          <RefreshCcw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {docForm.id ? t("doc_btn_update") : t("doc_btn_save")}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Table List Dokumen */}
              <div className="xl:col-span-2 space-y-6">
                <div className="bg-white border border-teal-50 rounded-[2.5rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                  <div className="p-8 border-b border-teal-50 bg-[#f8fdfc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-black text-teal-950 tracking-tight">{t("doc_list_title")}</h3>
                      <p className="text-xs text-teal-800/60 font-medium">{t("doc_list_subtitle")}</p>
                    </div>
                  </div>

                  {/* Filter and Search */}
                  <div className="p-6 border-b border-teal-50 bg-[#f8fdfc] flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-teal-400 absolute left-4 top-3.5" />
                      <input
                        type="text"
                        value={docSearch}
                        onChange={(e) => setDocSearch(e.target.value)}
                        placeholder={t("doc_search_placeholder")}
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-teal-100 rounded-xl text-xs font-bold text-teal-950 focus:outline-none"
                      />
                    </div>
                    {/* Custom Beautiful Document Category Filter */}
                    <div className="relative w-full sm:w-72">
                      <button
                        type="button"
                        onClick={() => setIsDocCategoryDropOpen(!isDocCategoryDropOpen)}
                        className="w-full flex items-center justify-between p-3.5 bg-white border border-teal-100 rounded-2xl text-xs font-bold text-teal-950 shadow-sm hover:border-teal-300 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Filter className="w-4 h-4 text-teal-500 shrink-0" />
                          <span className="truncate">
                            {docFilterCategory === "All" ? t("doc_category_all") : t(categoryTranslationKeys[docFilterCategory] || docFilterCategory)}
                          </span>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 text-teal-400 transition-transform duration-300 shrink-0", isDocCategoryDropOpen && "rotate-180")} />
                      </button>

                      <AnimatePresence>
                        {isDocCategoryDropOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-20"
                              onClick={() => setIsDocCategoryDropOpen(false)}
                            />
                            <motion.div
                              initial={{ opacity: 0, y: -10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -10, scale: 0.98 }}
                              transition={{ duration: 0.15, ease: "easeOut" }}
                              className="absolute z-30 top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl border border-teal-100 rounded-2xl shadow-2xl overflow-hidden py-1.5 max-h-72 overflow-y-auto custom-scrollbar"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setDocFilterCategory("All");
                                  setIsDocCategoryDropOpen(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors",
                                  docFilterCategory === "All"
                                    ? "bg-teal-50 text-teal-950 font-black"
                                    : "text-teal-800/70 hover:bg-teal-50/50 hover:text-teal-950"
                                )}
                              >
                                <span>{t("doc_category_all")}</span>
                                {docFilterCategory === "All" && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />}
                              </button>
                              <div className="h-px bg-teal-50/80 my-1" />
                              {Object.keys(categoryTranslationKeys).map((key) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => {
                                    setDocFilterCategory(key);
                                    setIsDocCategoryDropOpen(false);
                                  }}
                                  className={cn(
                                    "w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors",
                                    docFilterCategory === key
                                      ? "bg-teal-50 text-teal-950 font-black"
                                      : "text-teal-800/70 hover:bg-teal-50/50 hover:text-teal-950"
                                  )}
                                >
                                  <span className="truncate pr-2">{t(categoryTranslationKeys[key])}</span>
                                  {docFilterCategory === key && <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-teal-950 text-white uppercase text-[9px] font-black tracking-widest">
                          <th className="px-6 py-4">{t("doc_th_name")}</th>
                          <th className="px-6 py-4">{t("doc_th_category")}</th>
                          <th className="px-6 py-4">{t("doc_th_type")}</th>
                          <th className="px-6 py-4">{t("doc_th_uploaded")}</th>
                          <th className="px-6 py-4 text-right">{t("doc_th_action")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-teal-50 text-xs font-semibold text-teal-950">
                        {documents
                          .filter((doc) => {
                            const matchSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase());
                            const matchCat = docFilterCategory === "All" || doc.category === docFilterCategory;
                            return matchSearch && matchCat;
                          })
                          .map((doc) => (
                            <tr key={doc.id} className="hover:bg-teal-50/20 transition-colors">
                              <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                                <span className="font-extrabold text-teal-950 block mb-1 text-sm">
                                  <DynamicText text={doc.title} />
                                </span>
                                <span className="text-[10px] text-teal-800/60 font-medium block leading-relaxed">
                                  {doc.description ? (
                                    <DynamicText text={doc.description} />
                                  ) : (
                                    t("doc_no_desc")
                                  )}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border",
                                  categoryColors[doc.category] || "bg-slate-50 text-slate-700 border-slate-100"
                                )}>
                                  {t(categoryTranslationKeys[doc.category] || "cat_label_other")}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-mono text-[10px]">
                                {doc.fileUrl ? (
                                  <a
                                    href={doc.fileUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 underline uppercase"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    {doc.fileType || "FILE"}
                                  </a>
                                ) : (
                                  <a
                                    href={doc.driveUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-teal-600 hover:text-teal-800 underline uppercase"
                                  >
                                    <Briefcase className="w-3.5 h-3.5" />
                                    LINK
                                  </a>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <span className="block text-[10px] font-bold text-teal-900">{doc.uploadedBy}</span>
                                <span className="block text-[8px] text-teal-800/40 uppercase font-black">{new Date(doc.createdAt).toLocaleDateString()}</span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => setDocForm({
                                      id: doc.id,
                                      title: doc.title,
                                      description: doc.description || "",
                                      category: doc.category,
                                      type: doc.fileUrl ? "upload" : "link",
                                      fileUrl: doc.fileUrl || "",
                                      driveUrl: doc.driveUrl || "",
                                      fileType: doc.fileType || "",
                                      fileSize: doc.fileSize || 0,
                                      fileName: doc.fileUrl ? doc.fileUrl.split("/").pop() || "" : "",
                                    })}
                                    className="p-1.5 hover:bg-teal-50 text-teal-500 rounded-lg transition-all"
                                    title="Edit Dokumen"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDocDelete(doc.id, doc.title)}
                                    className="p-1.5 hover:bg-rose-50 text-rose-400 hover:text-rose-600 rounded-lg transition-all"
                                    title="Hapus Dokumen"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        
                        {documents.filter((doc) => {
                          const matchSearch = doc.title.toLowerCase().includes(docSearch.toLowerCase());
                          const matchCat = docFilterCategory === "All" || doc.category === docFilterCategory;
                          return matchSearch && matchCat;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-teal-800/30 uppercase tracking-widest font-black">
                              <Folder className="w-8 h-8 mx-auto mb-2 opacity-30" />
                              Dokumen Tidak Ditemukan
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </motion.div>
  );
};
