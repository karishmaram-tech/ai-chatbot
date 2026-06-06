import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
  tokens?: number;
  cost?: number;
  ragUsed?: boolean;
}

interface Conversation {
  id: string;
  title: string;
}

interface StoreState {
  token: string | null;
  user: any | null;
  isLoading: boolean;
  messages: Message[];
  conversations: Conversation[];
  activeConversationId: string | null;
  sidebarOpen: boolean;
  setIsLoading: (loading: boolean) => void;
  setAuth: (token: string | null, user: any | null) => void;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  setActiveConversation: (id: string | null) => void;
  setConversations: (conversations: Conversation[]) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      messages: [],
      conversations: [],
      activeConversationId: null,
      sidebarOpen: true,
      setIsLoading: (loading) => set({ isLoading: loading }),
      setAuth: (token, user) => set({ token, user }),
      setActiveConversation: (id) => set({ activeConversationId: id }),
      setConversations: (conversations) => set({ conversations }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      clearMessages: () => set({ messages: [] }),
      addMessage: (msg) =>
        set((state) => {
          const lastMsg = state.messages[state.messages.length - 1];
          if (
            lastMsg &&
            lastMsg.role === "assistant" &&
            lastMsg.isStreaming &&
            msg.role === "assistant"
          ) {
            return {
              messages: [
                ...state.messages.slice(0, -1),
                { ...lastMsg, ...msg },
              ],
            };
          }
          return { messages: [...state.messages, msg] };
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isLoading: false,
          messages: [],
          conversations: [],
          activeConversationId: null,
          sidebarOpen: true,
        }),
    }),
    {
      name: "lumora-auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
