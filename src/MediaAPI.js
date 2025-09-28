const BASE_URL = import.meta.env.VITE_API_BASE;

// A simple function to simulate network delay
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function http(path, options = {}) {
  await delay(750)
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

    if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} – ${text}`);
  } 
    // Return JSON response (or null if no content)
    return res.status === 204 ? null : res.json();
}

export const api = {
  getMediaItems: () => http("/api/media"),
  getMediaItem: (id) => http(`/api/media/${id}`),
  createMediaItem: (item) =>
    http("/api/media", { method: "POST", body: JSON.stringify(item) }),
  updateMediaItem: (id, item) =>
    http(`/api/media/${id}`, { method: "PUT", body: JSON.stringify(item) }),
  deleteMediaItem: (id) => http(`/api/media/${id}`, { method: "DELETE" }),
};