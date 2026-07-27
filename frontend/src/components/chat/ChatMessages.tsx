import type React from "react";
import type { UserProfile, Message } from "../../types";
import chatBackground from "../../assets/img/fondo.jpg";
import MessageItem from "../chat/MessageItem";

interface ChatMessagesProps {
  messages: Message[];
  user: UserProfile;
  themeMode: "classic" | "modern";
  scrollRef: React.RefObject<HTMLDivElement | null>;
  ttsReadyMap: Record<string, string>;
  isTTSLoading: string | null;
  getTranslation: (msg: Message) => void;
  handleSpeak: (text: string, messageId?: string) => void;
}

export default function ChatMessages({
  messages,
  user,
  themeMode,
  scrollRef,
  ttsReadyMap,
  isTTSLoading,
  getTranslation,
  handleSpeak,
}: ChatMessagesProps) {
  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative transition-colors duration-300 ${
        themeMode === "classic" ? "bg-[#efeae2]/85" : "bg-[#f4f3f0]"
      }`}
      style={
        themeMode === "classic"
          ? {
              backgroundImage: `url(${chatBackground})`,
              backgroundRepeat: "repeat",
              backgroundSize: "180px",
            }
          : undefined
      }
    >
      {messages.map((message) => (
        <MessageItem
          key={message.id || (message as any)._id}
          message={message}
          user={user}
          handleSpeak={handleSpeak}
          getTranslation={getTranslation}
          isTTSLoading={isTTSLoading}
          ttsReadyMap={ttsReadyMap}
        />
      ))}
    </div>
  );
}
