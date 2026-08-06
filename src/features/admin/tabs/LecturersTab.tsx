import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, CheckCircle2, FileText, ArrowLeftRight, ChevronDown, Download, Bot, Zap, GraduationCap, Camera, Save, Users, Search, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import DynamicText from '@/src/components/DynamicText';

export const LecturersTab = ({
  t,
  dosenForm,
  setDosenForm,
  handleDosenSubmit,
  reports,
  selectedDosen,
  setSelectedDosen,
  handleDelete,
  handleBulkDelete,
  handleDeleteAll,
  setAiImportType,
  setAiImportOpen,
  handleFileUpload,
  uploadLoading
}: any) => {
  const [searchDosen, setSearchDosen] = useState("");

  return (
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
                    {dosenForm.id ? t("dash_admin_edit") + " Dosen" : t("dash_admin_add_lecturer")}
                  </h3>
                  <form onSubmit={handleDosenSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("dash_admin_full_name")}
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
                        {t("label_nip")}
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
                        {t("dash_admin_max_quota")}
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
                        {t("label_foto_profil")}
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
                                {t("label_delete")}
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
                              t("label_uploading")
                            ) : (
                              <>
                                <Camera className="w-4 h-4" />{" "}
                                {dosenForm.foto
                                  ? t("label_change_photo")
                                  : t("label_pick_from_device")}
                              </>
                            )}
                          </label>
                        </div>
                        <div className="flex items-center gap-3 px-2">
                          <div className="h-px flex-1 bg-teal-100" />
                          <span className="text-[9px] font-black text-teal-800/40 uppercase tracking-widest">
                            {t("label_or_url")}
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
                        {t("label_keahlian_utama")}
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
                        placeholder={t("placeholder_keahlian")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("label_bio_singkat")}
                      </label>
                      <textarea
                        value={dosenForm.bio || ""}
                        onChange={(e) =>
                          setDosenForm({ ...dosenForm, bio: e.target.value })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner min-h-[80px]"
                        placeholder={t("placeholder_bio")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("dash_admin_contact")}
                      </label>
                      <input
                        value={dosenForm.kontak || ""}
                        onChange={(e) =>
                          setDosenForm({ ...dosenForm, kontak: e.target.value })
                        }
                        className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                        placeholder="08123xxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                        {t("dash_admin_password")} {dosenForm.id && "(Kosongi jika tidak diubah)"}
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
              <div className="xl:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-[#f8fdfc] p-6 rounded-[2rem] border border-teal-50 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                  <div>
                    <h3 className="text-xs font-black text-teal-950 uppercase tracking-widest flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="appearance-none w-5 h-5 rounded-lg border border-teal-200 bg-white checked:bg-teal-500 checked:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-black checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center"
                        checked={reports.length > 0 && selectedDosen.length === reports.length}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedDosen(reports.map(d => d.id));
                          else setSelectedDosen([]);
                        }}
                        title="Pilih Semua Dosen"
                      />
                      <Users className="w-4 h-4 text-teal-500" /> {t("label_dosen_list")}
                    </h3>
                    <p className="text-[10px] font-bold text-teal-800/40 uppercase tracking-wider mt-0.5">{t("label_n_dosen").replace("{n}", String(reports.length))}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAiImportType("dosen");
                      setAiImportOpen(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-teal-950 text-teal-400 border border-teal-900 hover:bg-teal-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg cursor-pointer group"
                  >
                    <Zap className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
                    ✨ {t("btn_ai_import")}
                  </button>
                </div>

                {/* Bulk Actions Bar for Dosen */}
                <div className="flex flex-wrap gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => handleDeleteAll("dosen")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm border border-rose-100"
                  >
                    <Trash2 className="w-4 h-4" /> {t("btn_delete_all_dosen")}
                  </button>
                  {selectedDosen.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleBulkDelete("dosen", selectedDosen)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" /> {t("btn_delete_selected").replace("{n}", String(selectedDosen.length))}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {reports.map((dosen, i) => (
                    <motion.div
                      key={dosen.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "bg-white p-6 rounded-[2.5rem] border shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.15)] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between group relative",
                        selectedDosen.includes(dosen.id) ? "border-teal-400 bg-teal-50/30" : "border-teal-50 hover:border-teal-100"
                      )}
                    >
                      <div className="absolute top-5 right-5 sm:top-auto sm:left-4 z-10">
                        <input
                          type="checkbox"
                          className="appearance-none w-5 h-5 rounded-lg border border-teal-200 bg-white checked:bg-teal-500 checked:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-black checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center"
                          checked={selectedDosen.includes(dosen.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDosen([...selectedDosen, dosen.id]);
                            else setSelectedDosen(selectedDosen.filter(id => id !== dosen.id));
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-5 sm:ml-6 mt-4 sm:mt-0">
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
                            {t("label_nip")}: {dosen.nip}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 transition-opacity justify-end w-full sm:w-auto mt-4 sm:mt-0">
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
                          className="p-2.5 bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white border border-teal-100 rounded-xl transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
  );
};
