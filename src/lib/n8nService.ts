export interface N8nWebhookEventConfig {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  webhookUrl: string;
}

export interface N8nLogEntry {
  id: string;
  timestamp: string;
  event: string;
  webhookUrl: string;
  status: "SUCCESS" | "FAILED";
  statusCode?: number;
  payloadSummary: string;
  errorMessage?: string;
}

// Memory store for n8n Webhook settings (can be synchronized with DB or .env)
export const n8nEventConfigs: Record<string, N8nWebhookEventConfig> = {
  WAR_BOOKED: {
    id: "WAR_BOOKED",
    name: "War Dosen Slot Booked",
    description: "Fired when a student locks a slot with a lecturer. Ideal for instant WA/Telegram notifications.",
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_WAR_BOOKED || "",
  },
  STATUS_CHANGED: {
    id: "STATUS_CHANGED",
    name: "Guidance Status Changed",
    description: "Fired when lecturer/admin approves, rejects, or resets student guidance status.",
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_STATUS_CHANGED || "",
  },
  BROADCAST_SENT: {
    id: "BROADCAST_SENT",
    name: "Admin Announcement Broadcast",
    description: "Fired when admin sends mass announcement to students or batch target.",
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_BROADCAST || "",
  },
  AI_SUMMARY_REQUEST: {
    id: "AI_SUMMARY_REQUEST",
    name: "AI Proposal & Revision Summarizer",
    description: "Fired when a student or lecturer requests AI analysis of proposal topic or long revision notes.",
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_AI_SUMMARY || "",
  },
  CALENDAR_SYNC: {
    id: "CALENDAR_SYNC",
    name: "Google Calendar & Meet Schedule Sync",
    description: "Fired when a guidance session or appointment is created or updated.",
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_CALENDAR_SYNC || "",
  },
  DOCUMENT_UPLOADED: {
    id: "DOCUMENT_UPLOADED",
    name: "Academic Document Uploaded",
    description: "Fired when thesis proposal, MoA, or IA document is uploaded to auto-organize into Google Drive.",
    enabled: true,
    webhookUrl: process.env.N8N_WEBHOOK_DOC_UPLOAD || "",
  },
};

// In-memory execution logs (up to 100 entries)
const n8nExecutionLogs: N8nLogEntry[] = [];

export function getExecutionLogs(): N8nLogEntry[] {
  return [...n8nExecutionLogs];
}

export function updateEventConfig(eventId: string, config: Partial<N8nWebhookEventConfig>): N8nWebhookEventConfig | null {
  if (!n8nEventConfigs[eventId]) return null;
  n8nEventConfigs[eventId] = {
    ...n8nEventConfigs[eventId],
    ...config,
  };
  return n8nEventConfigs[eventId];
}

/**
 * Trigger an n8n webhook asynchronously
 */
export async function triggerN8nWebhook(event: string, payload: Record<string, any>): Promise<{ success: boolean; error?: string }> {
  const config = n8nEventConfigs[event];
  if (!config) {
    return { success: false, error: `Event '${event}' is not registered.` };
  }

  if (!config.enabled || !config.webhookUrl) {
    return { success: false, error: `Webhook for '${event}' is disabled or has no URL configured.` };
  }

  const logId = Math.random().toString(36).substring(2, 9);
  const fullPayload = {
    event,
    timestamp: new Date().toISOString(),
    ...payload,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    const response = await fetch(config.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "WarDosPem-n8n-Engine/1.0",
      },
      body: JSON.stringify(fullPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const isSuccess = response.ok;
    const logEntry: N8nLogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      event,
      webhookUrl: config.webhookUrl,
      status: isSuccess ? "SUCCESS" : "FAILED",
      statusCode: response.status,
      payloadSummary: JSON.stringify(fullPayload).substring(0, 150) + "...",
      errorMessage: isSuccess ? undefined : `Webhook n8n mengembalikan HTTP ${response.status} (${response.statusText || "Error"})`,
    };

    n8nExecutionLogs.unshift(logEntry);
    if (n8nExecutionLogs.length > 100) n8nExecutionLogs.pop();

    return {
      success: isSuccess,
      error: isSuccess ? undefined : `Target n8n mengembalikan HTTP ${response.status} (${response.statusText || "Not OK"}). Pastikan workflow di n8n sudah di-Publish & metode HTTP sesuai.`,
    };
  } catch (err: any) {
    const logEntry: N8nLogEntry = {
      id: logId,
      timestamp: new Date().toISOString(),
      event,
      webhookUrl: config.webhookUrl,
      status: "FAILED",
      payloadSummary: JSON.stringify(fullPayload).substring(0, 150) + "...",
      errorMessage: err.message || "Network Error / Timeout",
    };

    n8nExecutionLogs.unshift(logEntry);
    if (n8nExecutionLogs.length > 100) n8nExecutionLogs.pop();

    console.error(`❌ n8n Webhook Error [${event}]:`, err.message);
    return { success: false, error: err.message };
  }
}
