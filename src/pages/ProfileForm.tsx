import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, AlertCircle, RefreshCcw } from "lucide-react";
import GlassCard from "@/src/components/GlassCard";

const ProfileForm = ({
  user,
  token,
  onComplete,
}: {
  user: any;
  token: string;
  onComplete: (updatedStudent: any) => void;
}) => {
  const [formData, setFormData] = useState({
    nama: user.mahasiswa?.nama || "",
    angkatan: user.mahasiswa?.angkatan || ("20" + user.username.substring(0, 2)),
    kontak: user.mahasiswa?.kontak || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.angkatan || !formData.kontak) {
      setError("Semua field wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nama: formData.nama,
          angkatan: formData.angkatan,
          kontak: formData.kontak,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan profil.");

      onComplete(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F0FAF8]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <GlassCard className="bg-white p-10 space-y-8">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-orange-400 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-100">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-teal-950">
              Lengkapi Profil Anda
            </h1>
            <p className="text-teal-800/60 text-sm font-medium italic">
              Anda wajib melengkapi data berikut sebelum masuk ke Dashboard
              pemilihan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                NIM (Auto)
              </label>
              <input
                value={user.username}
                disabled
                className="w-full p-4 bg-teal-50/50 border border-teal-100 rounded-2xl text-teal-800/60 font-mono text-sm cursor-not-allowed shadow-inner"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                Nama Lengkap
              </label>
              <input
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder="Sesuaikan dengan KTP/KTM"
                className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                  Angkatan
                </label>
                <input
                  type="text"
                  value={formData.angkatan}
                  onChange={(e) =>
                    setFormData({ ...formData, angkatan: e.target.value })
                  }
                  placeholder="2021"
                  className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                  Kontak / No. HP
                </label>
                <input
                  value={formData.kontak}
                  onChange={(e) =>
                    setFormData({ ...formData, kontak: e.target.value })
                  }
                  placeholder="0812..."
                  className="w-full p-4 bg-[#f8fdfc] border border-teal-100 rounded-2xl text-teal-950 text-sm focus:ring-4 focus:ring-teal-100 transition-all outline-none shadow-inner placeholder:text-teal-800/30 font-bold"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{" "}
                {error.toUpperCase()}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-teal-500 text-white rounded-[2rem] shadow-xl shadow-teal-500/20 font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-950 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" /> MENYIMPAN...
                </>
              ) : (
                "SIMPAN & LANJUT KE DASHBOARD"
              )}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ProfileForm;
