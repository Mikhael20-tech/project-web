import React, { useState } from "react";
import { motion } from "motion/react";
import { Users, AlertCircle, RefreshCcw } from "lucide-react";
import GlassCard from "@/src/components/GlassCard";
import { useLanguage } from "@/src/lib/LanguageContext";
import { Alert, Input, Button } from "@heroui/react";

const ProfileForm = ({
  user,
  token,
  onComplete,
}: {
  user: any;
  token: string;
  onComplete: (updatedStudent: any) => void;
}) => {
  const { t } = useLanguage();
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
      setError(t("dash_profile_required"));
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
      if (!res.ok) throw new Error(data.error || t("dash_profile_save_failed"));

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
              {t("dash_profile_complete_title")}
            </h1>
            <p className="text-teal-800/60 text-sm font-medium italic">
              {t("dash_profile_complete_desc")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                {t("dash_profile_nim_auto")}
              </label>
              <Input
                value={user.username}
                disabled
                variant="primary"
                className="w-full bg-teal-50/50 border border-teal-100 rounded-2xl h-14 px-6 shadow-inner cursor-not-allowed font-mono text-sm text-teal-800/60"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                {t("dash_profile_fullname")}
              </label>
              <Input
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
                placeholder={t("dash_profile_fullname_placeholder")}
                required
                variant="primary"
                className="w-full bg-[#f8fdfc] border border-teal-100 rounded-2xl h-14 px-6 shadow-inner transition-all font-bold text-sm text-teal-950 focus:border-teal-400 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                  {t("dash_profile_batch")}
                </label>
                <Input
                  type="text"
                  value={formData.angkatan}
                  onChange={(e) =>
                    setFormData({ ...formData, angkatan: e.target.value })
                  }
                  placeholder="2021"
                  required
                  variant="primary"
                  className="w-full bg-[#f8fdfc] border border-teal-100 rounded-2xl h-14 px-6 shadow-inner transition-all font-bold text-sm text-teal-950 focus:border-teal-400 focus:outline-none focus:ring-0"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-teal-800/60 ml-1">
                  {t("dash_profile_contact")}
                </label>
                <Input
                  value={formData.kontak}
                  onChange={(e) =>
                    setFormData({ ...formData, kontak: e.target.value })
                  }
                  placeholder="0812..."
                  required
                  variant="primary"
                  className="w-full bg-[#f8fdfc] border border-teal-100 rounded-2xl h-14 px-6 shadow-inner transition-all font-bold text-sm text-teal-950 focus:border-teal-400 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {error && (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{error.toUpperCase()}</Alert.Title>
                </Alert.Content>
              </Alert>
            )}

            <Button
              type="submit"
              isDisabled={loading}
              className="w-full h-14 bg-teal-500 text-white rounded-[2rem] shadow-xl shadow-teal-500/20 font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-950 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCcw className="w-4 h-4 animate-spin text-white" />
              ) : (
                t("dash_profile_save_continue")
              )}
            </Button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ProfileForm;
