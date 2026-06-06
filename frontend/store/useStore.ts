import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

interface StoreState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  messages: Message[];
  activeConversationId: string | null;
  setIsLoading: (loading: boolean) => void;
  setAuth: (token: string | null, user: any | null) => void;
  addMessage: (msg: Message) => void;
  setActiveConversation: (id: string | null) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      token: null, // Keeps the initial bad token clear
      user: null,
      isLoading: false,
      messages: [],
      activeConversationId: null,
      setIsLoading: (loading) => set({ isLoading: loading }),
      setAuth: (token, user) => set({ token, user }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      addMessage: (msg) => set((state) => {
        const lastMsg = state.messages[state.messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant" && lastMsg.isStreaming && msg.role === "assistant") {
          return {
            messages: [...state.messages.slice(0, -1), { ...lastMsg, ...msg }]
          };
        }
        return { messages: [...state.messages, msg] };
      }),
      logout: () => set({ token: null, user: null, isLoading: false, messages: [], activeConversationId: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
