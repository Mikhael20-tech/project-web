import React, { useState, useEffect } from "react";
import DynamicText from "@/src/components/DynamicText";
import { useLanguage } from "@/src/lib/LanguageContext";
import {
  Zap,
  CheckCircle,
  XCircle,
  Play,
  Save,
  Download,
  Activity,
  Calendar,
  MessageSquare,
  FileText,
  Bot,
  RefreshCw,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface N8nConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  webhookUrl: string;
}

interface N8nLog {
  id: string;
  timestamp: string;
  event: string;
  webhookUrl: string;
  status: "SUCCESS" | "FAILED";
  statusCode?: number;
  payloadSummary: string;
  errorMessage?: string;
}

export const N8nAutomationTab: React.FC = () => {
  const { t } = useLanguage();
  const [configs, setConfigs] = useState<N8nConfig[]>([]);
  const [logs, setLogs] = useState<N8nLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error" | "warning"; text: string } | null>(null);

  const token = localStorage.getItem("token");

  const showToast = (type: "success" | "error" | "warning", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchConfigsAndLogs = async () => {
    setLoading(true);
    try {
      const [resConfig, resLogs] = await Promise.all([
        fetch("/api/n8n/config", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/n8n/logs", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (resConfig.ok) {
        const data = await resConfig.json();
        setConfigs(data.configs || []);
      }
      if (resLogs.ok) {
        const data = await resLogs.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to load n8n automation settings:", err);
      showToast("error", "Gagal memuat konfigurasi n8n.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigsAndLogs();
  }, []);

  const handleUpdateConfig = async (eventId: string, updatedFields: Partial<N8nConfig>) => {
    setSavingId(eventId);
    try {
      const res = await fetch("/api/n8n/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId, ...updatedFields }),
      });

      const data = await res.json();
      if (res.ok && data.config) {
        setConfigs(prev => prev.map(c => (c.id === eventId ? data.config : c)));
        showToast("success", `Konfigurasi '${eventId}' berhasil disimpan!`);
      } else {
        showToast("error", data.error || "Gagal memperbarui konfigurasi.");
      }
    } catch (err) {
      showToast("error", "Terjadi kesalahan koneksi.");
    } finally {
      setSavingId(null);
    }
  };

  const handleTestWebhook = async (eventId: string) => {
    setTestingId(eventId);
    try {
      const res = await fetch("/api/n8n/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();
      // Server always returns 200 — check data.success flag instead of res.ok
      if (data.success) {
        showToast("success", data.message || "Test Webhook Berhasil! Cek Executions di n8n kamu.");
        fetchConfigsAndLogs();
      } else {
        // URL not configured = warning (bukan error), URL misconfigured = error
        const isNotConfigured = data.message?.includes("disabled or has no URL");
        showToast(
          isNotConfigured ? "warning" : "error",
          isNotConfigured
            ? "⚠️ URL Webhook belum diisi. Paste URL dari n8n → klik Simpan URL → Test ulang."
            : data.message || "Gagal mengirimkan Test Webhook."
        );
      }
    } catch (err) {
      showToast("error", "Gagal menghubungi server.");
    } finally {
      setTestingId(null);
    }
  };

  const getEventIcon = (id: string) => {
    switch (id) {
      case "WAR_BOOKED":
        return <Zap className="w-5 h-5 text-amber-400" />;
      case "STATUS_CHANGED":
        return <Activity className="w-5 h-5 text-blue-400" />;
      case "BROADCAST_SENT":
        return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case "AI_SUMMARY_REQUEST":
        return <Bot className="w-5 h-5 text-purple-400" />;
      case "CALENDAR_SYNC":
        return <Calendar className="w-5 h-5 text-indigo-400" />;
      case "DOCUMENT_UPLOADED":
        return <FileText className="w-5 h-5 text-cyan-400" />;
      default:
        return <Zap className="w-5 h-5 text-slate-400" />;
    }
  };

  const workflowTemplates = [
    {
      title: "Notifikasi WhatsApp & Telegram",
      desc: "Kirim pesan WA konfirmasi ke mahasiswa dan alert ke Telegram Channel saat War Dosen.",
      file: "/n8n-workflows/whatsapp-telegram-notification.json",
      tag: "Notifikasi Instant",
      color: "from-amber-500/20 to-orange-500/10 border-amber-500/30",
    },
    {
      title: "Sinkronisasi Google Calendar & Meet",
      desc: "Otomatis buat event kalender & link Meet saat jadwal bimbingan disepakati.",
      file: "/n8n-workflows/google-calendar-sync.json",
      tag: "Jadwal & Meet",
      color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30",
    },
    {
      title: "Ringkasan Proposal & Revisi AI",
      desc: "Ekstrak poin revisi dan kesesuaian judul skripsi memakai LLM node n8n.",
      file: "/n8n-workflows/ai-proposal-summarizer.json",
      tag: "AI Node",
      color: "from-purple-500/20 to-pink-500/10 border-purple-500/30",
    },
    {
      title: "Pengorganisir Dokumen Google Drive",
      desc: "Simpan & rapikan file proposal/draft skripsi mahasiswa ke Google Drive prodi.",
      file: "/n8n-workflows/google-drive-organizer.json",
      tag: "Drive Storage",
      color: "from-cyan-500/20 to-teal-500/10 border-cyan-500/30",
    },
    {
      title: "Rangkuman Analisis Mingguan",
      desc: "Tarik statistik mingguan War Dosen dan kirim rangkuman ke Slack/Email Kaprodi.",
      file: "/n8n-workflows/weekly-analytics-digest.json",
      tag: "Cron Digest",
      color: "from-emerald-500/20 to-green-500/10 border-emerald-500/30",
    },
    {
      title: "Notifikasi Perubahan Status",
      desc: "Notifikasi otomatis ke Telegram saat status bimbingan disetujui, ditolak, atau di-reset.",
      file: "/n8n-workflows/status-changed-notification.json",
      tag: "Status Update",
      color: "from-rose-500/20 to-orange-500/10 border-rose-500/30",
    },
    {
      title: "Super Chatbot Telegram (9 Fitur Lengkap)",
      desc: "Chatbot Telegram interaktif 9-in-1: Pengecekan Slot, Rekomendasi Topik, Personal NIM Check, Alarm Slot Dosen, Download Template, Voice Note Query, & Fitur Teman Seperjuangan.",
      file: "/n8n-workflows/telegram-super-chatbot.json",
      tag: "Super Chatbot 9-in-1",
      color: "from-sky-500/20 to-blue-500/10 border-sky-500/30",
    },
  ];

  const activeWebhooksCount = configs.filter(c => c.enabled && c.webhookUrl).length;
  const successLogsCount = logs.filter(l => l.status === "SUCCESS").length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md border flex items-center gap-3 transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/40"
              : toastMessage.type === "warning"
              ? "bg-amber-950/90 text-amber-200 border-amber-500/40"
              : "bg-rose-950/90 text-rose-200 border-rose-500/40"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : toastMessage.type === "warning" ? (
            <Zap className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="font-medium text-sm">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" /> n8n Workflow Integration
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              <DynamicText text="n8n Automation Hub" />
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              <DynamicText text="Hubungkan aplikasi War Dosen dengan instance n8n Workflow Automation milikmu. Otomatiskan notifikasi WhatsApp, Google Calendar, AI Summarizer, hingga Google Drive tanpa baris kode tambahan." />
            </p>
          </div>

          <button
            onClick={fetchConfigsAndLogs}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {t("btn_refresh_status")}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">
                <DynamicText text="Webhook Aktif" />
              </div>
              <div className="text-xl font-bold text-white">
                {activeWebhooksCount} / {configs.length} Event
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">
                <DynamicText text="Eksekusi Sukses" />
              </div>
              <div className="text-xl font-bold text-emerald-400">
                {successLogsCount} Triggers
              </div>
            </div>
          </div>

          <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">
                <DynamicText text="Total Webhook Logs" />
              </div>
              <div className="text-xl font-bold text-white">
                {logs.length} <DynamicText text="Log Disimpan" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" /> Webhook Events & Endpoints
          </h3>
          <span className="text-xs text-slate-400">
            Paste URL Webhook n8n kamu di bawah ini
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-400" />
            Memuat konfigurasi Webhook n8n...
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {configs.map(item => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-5 transition-all shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700/60 mt-0.5">
                      {getEventIcon(item.id)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold text-white text-base">{item.name}</h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {item.id}
                        </span>
                        {item.enabled && item.webhookUrl ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Aktif
                          </span>
                        ) : (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Non-aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        <DynamicText text={item.description} />
                      </p>
                    </div>
                  </div>

                  {/* Enable Switch Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={e => handleUpdateConfig(item.id, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>

                {/* Webhook Input & Actions */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <input
                      type="url"
                      placeholder="https://n8n.yourdomain.com/webhook/..."
                      value={item.webhookUrl}
                      onChange={e =>
                        setConfigs(prev =>
                          prev.map(c => (c.id === item.id ? { ...c, webhookUrl: e.target.value } : c))
                        )
                      }
                      className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 text-slate-200 text-sm rounded-lg px-3.5 py-2 font-mono outline-none transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleUpdateConfig(item.id, { webhookUrl: item.webhookUrl })}
                      disabled={savingId === item.id}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {savingId === item.id ? t("btn_saving") : t("btn_save_url")}
                    </button>

                    <button
                      onClick={() => handleTestWebhook(item.id)}
                      disabled={testingId === item.id}
                      title={!item.webhookUrl ? "Isi dan Simpan URL Webhook terlebih dahulu" : "Kirim payload dummy ke n8n"}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-40"
                    >
                      <Play className={`w-3.5 h-3.5 ${testingId === item.id ? "animate-pulse" : ""}`} />
                      {testingId === item.id ? t("btn_testing") : t("btn_test_webhook")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pre-built Downloadable n8n Workflows */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-400" /> Ready-to-Import n8n Workflows
          </h3>
          <span className="text-xs text-slate-400">
            Download file .json & import langsung ke n8n milikmu
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowTemplates.map((wf, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${wf.color} bg-slate-900/90 border rounded-xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-all shadow-md`}
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {wf.tag}
                </span>
                <h4 className="font-bold text-white text-base mt-2.5">{wf.title}</h4>
                <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed">{wf.desc}</p>
              </div>

              <a
                href={wf.file}
                download
                className="mt-5 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                {t("btn_download_json")}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Live Execution Logs Table */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" /> Riwayat Eksekusi Webhook Logs
          </h3>
          <span className="text-xs text-slate-400">100 Log Terakhir</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              Belum ada log eksekusi webhook n8n.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Waktu</th>
                    <th className="px-4 py-3">Event</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Payload Summary</th>
                    <th className="px-4 py-3">Webhook Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap font-mono">
                        {new Date(log.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">{log.event}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {log.status === "SUCCESS" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" /> 200 OK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> {log.statusCode || "Error"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 max-w-xs truncate">
                        {log.payloadSummary}
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate font-mono">
                        {log.webhookUrl}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
