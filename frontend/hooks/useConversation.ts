import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { api } from "@/lib/api";

export function useConversation(conversationId: string | null) {
  const { token, addMessage, clearMessages, setIsLoading } = useStore();

  useEffect(() => {
    if (!conversationId || !token) return;

    async function loadMessages() {
      setIsLoading(true);
      clearMessages();
      try {
        const messages = await api.chat.getMessages(conversationId!, token!);
        messages.forEach((msg: any) => {
          addMessage({
            role: msg.role,
            content: msg.content,
            tokens: msg.tokens_used,
            cost: msg.cost_usd,
          });
        });
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMessages();
  }, [conversationId, token]);
}

