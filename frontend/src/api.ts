export type Prediction = {
  id?: number;
  message: string;
  prediction: "SPAM" | "NOT SPAM";
  confidence: number | null;
  created_at?: string;
};

export type Stats = {
  total: number;
  spam: number;
  not_spam: number;
  spam_percentage: number;
  not_spam_percentage: number;
  volume_over_time: { date: string; count: number }[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" }, ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

export const classify = (message: string) => request<Prediction>("/predict", {
  method: "POST", body: JSON.stringify({ message }),
});

export const getHistory = (page: number, filter: string) => request<{
  items: Prediction[]; page: number; pages: number; total: number;
}>(`/history?page=${page}&per_page=8${filter ? `&prediction=${encodeURIComponent(filter)}` : ""}`);

export const getStats = () => request<Stats>("/stats");
