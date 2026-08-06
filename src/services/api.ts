export const fetchAPI = async (endpoint: string, token?: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Handle FormData where we shouldn't set Content-Type manually
  if (options.body instanceof FormData) {
    const newHeaders = new Headers(headers);
    newHeaders.delete("Content-Type");
    options.headers = newHeaders;
  } else {
    options.headers = headers;
  }

  const response = await fetch(endpoint, options);
  
  // Try to parse JSON but fallback gracefully
  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    throw new Error((data && data.error) ? data.error : "Terjadi kesalahan pada server");
  }

  return data;
};

// --- Documents ---
export const getDocuments = (token: string) => fetchAPI("/api/documents", token);
export const deleteDocument = (token: string, id: string) => fetchAPI(`/api/admin/documents/${id}`, token, { method: "DELETE" });
export const uploadDocument = (token: string, formData: FormData) => fetchAPI("/api/admin/documents/upload", token, { method: "POST", body: formData });
export const analyzeAiDocument = (token: string, payload: any) => fetchAPI("/api/admin/documents/analyze-ai", token, { method: "POST", body: JSON.stringify(payload) });

// --- Students ---
export const getStudents = (token: string) => fetchAPI("/api/admin/mahasiswa", token);
export const importStudents = (token: string, payload: any) => fetchAPI("/api/admin/mahasiswa/import", token, { method: "POST", body: JSON.stringify(payload) });
export const resetAngkatan = (token: string, payload: any) => fetchAPI("/api/admin/reset-angkatan", token, { method: "POST", body: JSON.stringify(payload) });

// --- Lecturers (Dosen) ---
export const getDosen = (token: string) => fetchAPI("/api/dosen", token);
export const createDosen = (token: string, payload: any) => fetchAPI("/api/admin/dosen", token, { method: "POST", body: JSON.stringify(payload) });
export const updateDosen = (token: string, id: string, payload: any) => fetchAPI(`/api/admin/dosen/${id}`, token, { method: "PUT", body: JSON.stringify(payload) });

// --- Config ---
export const getConfig = () => fetchAPI("/api/war-config");
export const updateConfig = (token: string, payload: any) => fetchAPI("/api/admin/war-config", token, { method: "POST", body: JSON.stringify(payload) });

// --- Activities & Broadcast ---
export const getActivities = (token: string) => fetchAPI("/api/admin/activities", token);
export const generateAiBroadcast = (token: string, payload: any) => fetchAPI("/api/admin/broadcast/ai", token, { method: "POST", body: JSON.stringify(payload) });
export const sendBroadcast = (token: string, payload: any) => fetchAPI("/api/admin/broadcast/send", token, { method: "POST", body: JSON.stringify(payload) });

// --- Generic CRUD utilities (For bulk/single delete) ---
export const deleteItem = (token: string, type: string, id: string) => fetchAPI(`/api/admin/${type}/${id}`, token, { method: "DELETE" });
export const bulkDelete = (token: string, type: string, ids: string[]) => fetchAPI(`/api/admin/${type}/bulk-delete`, token, { method: "POST", body: JSON.stringify({ ids }) });
export const deleteAll = (token: string, type: string) => fetchAPI(`/api/admin/${type}/all`, token, { method: "DELETE" });

// --- Admin ---
export const updatePassword = (token: string, payload: any) => fetchAPI("/api/admin/password", token, { method: "PUT", body: JSON.stringify(payload) });
