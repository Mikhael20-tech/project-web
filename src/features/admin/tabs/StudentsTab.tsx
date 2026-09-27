import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit, Trash2, CheckCircle2, ChevronDown, Zap, UserPlus, Search, X, Link, Save, Users, Upload, Download, Timer } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import DynamicText from '@/src/components/DynamicText';
import * as XLSX from "xlsx";

export const StudentsTab = ({
  t,
  studentForm,
  setStudentForm,
  handleStudentSubmit,
  students,
  selectedStudents,
  setSelectedStudents,
  handleBulkDelete,
  handleDeleteAll,
  setAiImportType,
  setAiImportOpen,
  reports,
  handleCSVImport,
  setDeleteData
}: any) => {
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStudentAngkatan, setFilterStudentAngkatan] = useState("All");
  const [isStudentFilterDropdownOpen, setIsStudentFilterDropdownOpen] = useState(false);

  return (
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
                        ? t("label_update_student")
                        : t("label_create_account")}
                    </p>
                  </div>
                </div>
                {studentForm.id && (
                  <div className="mb-6 p-4 bg-teal-50/80 border border-teal-200 rounded-2xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse shrink-0" />
                      <span className="text-xs font-bold text-teal-900 truncate">
                        Sedang Mengedit: <span className="font-extrabold">{studentForm.nama || "Mahasiswa"}</span> (NIM: {studentForm.nim})
                      </span>
                    </div>
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
                      className="shrink-0 text-[10px] font-black uppercase text-rose-500 hover:text-rose-700 bg-white px-3 py-1.5 rounded-xl border border-rose-100 shadow-sm transition-all cursor-pointer hover:bg-rose-50"
                    >
                      ✕ Batal Edit
                    </button>
                  </div>
                )}

                {(() => {
                  const cleanInputNim = (studentForm.nim || "").trim().replace(/['"\s.-]/g, "");
                  const duplicateStudent = cleanInputNim
                    ? students.find((s: any) => (s.nim || "").replace(/['"\s.-]/g, "") === cleanInputNim && s.id !== studentForm.id)
                    : null;

                  return (
                    <form
                      onSubmit={(e) => {
                        if (duplicateStudent) {
                          e.preventDefault();
                          return;
                        }
                        handleStudentSubmit(e);
                      }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center ml-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50">
                            {t("dash_admin_student_id")} *
                          </label>
                          {cleanInputNim.length >= 4 && !duplicateStudent && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                              ✓ NIM Tersedia
                            </span>
                          )}
                        </div>
                        <input
                          value={studentForm.nim}
                          onChange={(e) => {
                            const newNim = e.target.value;
                            let autoAngkatan = studentForm.angkatan;
                            const cleanDigits = newNim.replace(/['"\s.-]/g, "");
                            if (!autoAngkatan && /^\d{2}/.test(cleanDigits)) {
                              autoAngkatan = "20" + cleanDigits.substring(0, 2);
                            }
                            setStudentForm({ 
                              ...studentForm, 
                              nim: newNim,
                              angkatan: autoAngkatan
                            });
                          }}
                          className={cn(
                            "w-full p-4 bg-teal-50 border rounded-2xl text-teal-950 text-sm font-bold focus:outline-none transition-all shadow-inner",
                            duplicateStudent 
                              ? "border-rose-400 bg-rose-50/50 text-rose-950 focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500" 
                              : "border-teal-100 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400"
                          )}
                          placeholder="24050974001"
                          required
                        />

                        {duplicateStudent && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1.5 animate-in fade-in duration-200">
                            <div className="flex items-center gap-1.5 font-black text-rose-700 text-[11px]">
                              <span>⚠️</span>
                              <span>Data Ganda (Double Data) Terdeteksi!</span>
                            </div>
                            <p className="text-[10px] text-rose-900 leading-tight">
                              NIM ini sudah terdaftar atas nama: <span className="font-extrabold">{duplicateStudent.nama}</span>
                              {duplicateStudent.angkatan ? ` (Angkatan ${duplicateStudent.angkatan})` : ""}.
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setStudentForm({
                                  id: duplicateStudent.id,
                                  nim: duplicateStudent.nim,
                                  nama: duplicateStudent.nama,
                                  kontak: duplicateStudent.kontak || "",
                                  password: "",
                                  angkatan: duplicateStudent.angkatan || "",
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="w-full mt-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3 h-3" /> Edit Data Mahasiswa Ini
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("label_nama_lengkap")} *
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
                          {t("label_no_hp")}
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
                          placeholder="08123xxxx"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("login_password")} {studentForm.id && "(Kosongi jika tidak diubah)"}
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
                          placeholder={studentForm.id ? "Password baru..." : "••••••••"}
                          required={!studentForm.id}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-teal-800/50 ml-1">
                          {t("dash_admin_batch_label")} *
                        </label>
                        <input
                          value={studentForm.angkatan}
                          onChange={(e) =>
                            setStudentForm({ ...studentForm, angkatan: e.target.value })
                          }
                          className="w-full p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-950 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all shadow-inner"
                          placeholder="Contoh: 2024"
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
                            className="px-8 py-4 bg-teal-50 text-teal-600 rounded-[1.25rem] font-black text-xs uppercase tracking-widest hover:bg-teal-100 transition-all cursor-pointer"
                          >
                            {t("btn_cancel")}
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={!!duplicateStudent}
                          className={cn(
                            "px-10 py-4 rounded-[1.25rem] font-black text-xs uppercase tracking-widest shadow-xl transition-all group flex items-center gap-3 cursor-pointer",
                            duplicateStudent
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                              : "bg-teal-500 text-white shadow-teal-500/10 hover:bg-teal-950"
                          )}
                        >
                          <Save className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />{" "}
                          {duplicateStudent
                            ? "NIM Ganda Terdeteksi"
                            : studentForm.id
                            ? t("btn_save_changes")
                            : t("btn_register_student")}
                        </button>
                      </div>
                    </form>
                  );
                })()}
              </div>

              <div className="bg-white border border-teal-50 rounded-[3rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="p-8 md:p-10 border-b border-teal-50 flex flex-col xl:flex-row justify-between items-start xl:items-center bg-[#f8fdfc] gap-6">
                  <h3 className="text-sm font-black text-teal-950 uppercase tracking-widest flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-teal-600" />
                    </div>
                    {t("dash_admin_db_mahasiswa")}
                  </h3>
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full xl:w-auto">
                    <input
                      type="file"
                      id="import-csv-input"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleCSVImport}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const ws = XLSX.utils.aoa_to_sheet([
                          ["NIM", "Nama"],
                          ["24050974001", "Contoh Nama Mahasiswa"],
                        ]);
                        ws["!cols"] = [{ wch: 20 }, { wch: 35 }];
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Mahasiswa");
                        XLSX.writeFile(wb, "template_import_mahasiswa.xlsx");
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white border-2 border-teal-100 rounded-2xl text-[10px] font-black text-teal-700 hover:bg-teal-50 hover:border-teal-300 transition-all uppercase tracking-widest shadow-sm group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform text-teal-500" />
                      {t("btn_template_excel")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!students || students.length === 0) {
                          alert("Belum ada data mahasiswa untuk diekspor.");
                          return;
                        }
                        const exportData = students.map((s: any, idx: number) => ({
                          "No": idx + 1,
                          "NIM": s.nim || "-",
                          "Nama": s.nama || "-",
                          "Angkatan": s.angkatan || "-",
                          "Kontak / No WA": s.kontak || "-",
                          "Status Bimbingan": s.statusBimbingan || "PENDING",
                          "Dosen Pembimbing": s.dosen?.nama || "-",
                          "NIP Dosen": s.dosen?.nip || "-",
                          "Rencana Judul / Topik": s.rencanaJudul || "-"
                        }));
                        const ws = XLSX.utils.json_to_sheet(exportData);
                        ws["!cols"] = [
                          { wch: 6 },
                          { wch: 18 },
                          { wch: 30 },
                          { wch: 12 },
                          { wch: 18 },
                          { wch: 18 },
                          { wch: 30 },
                          { wch: 20 },
                          { wch: 40 }
                        ];
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, "Data Mahasiswa");
                        const dateStr = new Date().toISOString().split("T")[0];
                        XLSX.writeFile(wb, `Data_Mahasiswa_WarDosPem_${dateStr}.xlsx`);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl text-[10px] font-black text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 transition-all uppercase tracking-widest shadow-sm group"
                    >
                      <Download className="w-4 h-4 group-hover:-translate-y-1 transition-transform text-emerald-600" />
                      Export Data (Excel)
                    </button>
                    <label
                      htmlFor="import-csv-input"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-50 to-teal-100/50 border-2 border-teal-200 rounded-2xl text-[10px] font-black text-teal-800 hover:bg-teal-100 hover:border-teal-300 transition-all uppercase tracking-widest shadow-sm cursor-pointer group"
                    >
                      <Upload className="w-4 h-4 group-hover:-translate-y-1 transition-transform text-teal-600" />
                      {t("btn_import_csv")}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAiImportType("mahasiswa");
                        setAiImportOpen(true);
                      }}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-teal-950 text-teal-400 border-2 border-teal-900 hover:bg-teal-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-teal-950/20 cursor-pointer group transition-all"
                    >
                      <Zap className="w-4 h-4 text-orange-400 group-hover:scale-125 transition-transform animate-pulse group-hover:animate-none" />
                      ✨ {t("btn_ai_import")}
                    </button>
                    <span className="px-4 py-3 bg-teal-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {students.length} {t("dash_admin_registered")}
                    </span>
                  </div>
                </div>
                
                {/* Bulk Actions Bar */}
                <div className="px-8 md:px-10 py-4 bg-rose-50/30 flex flex-wrap gap-4 items-center border-b border-rose-50">
                  <button
                    type="button"
                    onClick={() => handleDeleteAll("mahasiswa")}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" /> {t("btn_delete_all_data")}
                  </button>
                  {selectedStudents.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleBulkDelete("mahasiswa", selectedStudents)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" /> Hapus {selectedStudents.length} Terpilih
                    </button>
                  )}
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
                          {filterStudentAngkatan === "All" ? t("dash_admin_all_batch") : `${t("dash_student_angkatan")} ${filterStudentAngkatan}`}
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
                            
                            {[...new Set(students.map((s: any) => s.angkatan))].filter(Boolean).sort().map((a: any) => (
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
                                <span className="text-[10px] font-black uppercase tracking-widest">{t("dash_student_angkatan")} {a}</span>
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
                        <th className="px-10 py-6 w-10">
                          <input 
                            type="checkbox" 
                            className="appearance-none w-5 h-5 rounded-lg border border-teal-200 bg-white checked:bg-teal-500 checked:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-black checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center"
                            checked={students.length > 0 && selectedStudents.length === students.length}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedStudents(students.map(s => s.id));
                              else setSelectedStudents([]);
                            }}
                          />
                        </th>
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
                          className={cn(
                            "hover:bg-[#f8fdfc] transition-colors group",
                            selectedStudents.includes(std.id) && "bg-teal-50/50"
                          )}
                        >
                          <td className="px-10 py-5">
                            <input 
                              type="checkbox" 
                              className="appearance-none w-5 h-5 rounded-lg border border-teal-200 bg-white checked:bg-teal-500 checked:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 cursor-pointer transition-all relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[10px] checked:after:font-black checked:after:inset-0 checked:after:flex checked:after:items-center checked:after:justify-center"
                              checked={selectedStudents.includes(std.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedStudents([...selectedStudents, std.id]);
                                else setSelectedStudents(selectedStudents.filter(id => id !== std.id));
                              }}
                            />
                          </td>
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
                          <td className="px-10 py-5">
                            <div className="flex flex-wrap items-center justify-end gap-2">
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
                                className="p-2.5 bg-teal-50 text-teal-600 hover:bg-teal-500 hover:text-white border border-teal-100 rounded-xl transition-all shadow-sm"
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
                                className="p-2.5 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-100 rounded-xl transition-all shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
  );
};
