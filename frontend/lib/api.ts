const API_BASE = (
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? ""
    : "http://127.0.0.1:8000")
);

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(API_BASE + endpoint, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      fetchAPI("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, username: string, password: string) =>
      fetchAPI("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, password }),
      }),
    me: (token: string) =>
      fetchAPI("/api/v1/auth/me", {
        headers: { Authorization: "Bearer " + token },
      }),
  },
  chat: {
    getConversations: (token: string) =>
      fetchAPI("/api/v1/chat/conversations", {
        headers: { Authorization: "Bearer " + token },
      }),
    getMessages: (conversationId: string, token: string) =>
      fetchAPI("/api/v1/chat/conversations/" + conversationId + "/messages", {
        headers: { Authorization: "Bearer " + token },
      }),
    async *stream(message: string, token: string, conversationId?: string) {
      const res = await fetch(API_BASE + "/api/v1/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ message, conversation_id: conversationId }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        for (const line of text.split("\n")) {
          if (line.startsWith("data: ")) {
            try { yield JSON.parse(line.slice(6)); } catch {}
          }
        }
      }
    },
  },
  documents: {
    upload: (file: File, token: string) => {
      const formData = new FormData();
      formData.append("file", file);
      return fetch(API_BASE + "/api/v1/documents/upload", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      }).then((r) => r.json());
    },
    search: (query: string, token: string) =>
      fetchAPI("/api/v1/documents/search?query=" + encodeURIComponent(query), {
        headers: { Authorization: "Bearer " + token },
      }),
  },
  analytics: {
    getUsage: (token: string) =>
      fetchAPI("/api/v1/analytics/usage", {
        headers: { Authorization: "Bearer " + token },
      }),
  },
};
