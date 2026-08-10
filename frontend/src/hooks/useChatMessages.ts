import { useState } from "react";
import type { Message } from "../types";

export const useChatMessages = () => {
  // Mensajes que se muestran actualmente en el chat
  const [messages, setMessages] = useState<Message[]>([]);

  // Texto que el usuario está escribiendo
  const [inputText, setInputText] = useState("");

  // Usuarios que actualmente están escribiendo
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  // Error relacionado con el manejo de mensajes
  const [error, setError] = useState<string | null>(null);

  return {
    messages,
    setMessages,
    inputText,
    setInputText,
    typingUsers,
    setTypingUsers,
    error,
    setError,
  };
};
