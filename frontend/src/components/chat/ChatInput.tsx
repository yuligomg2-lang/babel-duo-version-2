import { Loader2, Mic, Send, Square } from "lucide-react";
import type React from "react";

interface ChatInputProps {
  inputText: string;
  setInputText: (value: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
  loadingAction: boolean;

  // Funciones y datos relacionados con la grabación de audio
  isRecording: boolean;
  recordDuration: number;
  startRecording: () => void;
  stopRecording: () => void;
  formatDuration: (seconds: number) => string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputText,
  setInputText,
  handleSendMessage,
  loadingAction,
  isRecording,
  recordDuration,
  startRecording,
  stopRecording,
  formatDuration,
}) => {
  return (
    <div className="p-3 bg-[#f0f2f5] border-t border-gray-205/30 safe-area-bottom">
      {isRecording ? (
        /* Mientras se graba mostramos el tiempo y el botón para detener */
        <div className="flex items-center justify-between bg-red-50 border border-red-100 p-1.5 rounded-xl animate-pulse">
          <div className="flex items-center gap-2 px-2 select-none">
            <div className="w-2 h-2 bg-red-500 rounded-full" />

            <span className="text-xs font-bold text-red-600 animate-pulse">
              Grabando audio... {formatDuration(recordDuration)}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
          >
            <Square className="w-4 h-4 fill-current" />
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSendMessage}
          className="flex gap-2.5 items-center"
        >
          {/* Botón para iniciar la grabación */}
          <button
            type="button"
            onClick={startRecording}
            title="Grabar mensaje de voz"
            className="p-2.5 bg-white text-gray-500 rounded-full hover:bg-gray-100 hover:text-[#ff6000] border border-gray-200/50 transition-all shrink-0"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Campo donde se escribe el mensaje */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 h-12 bg-white border border-gray-200/60 rounded-full px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-[#0a3d70]/30 transition-shadow text-gray-800 placeholder-[#767676]"
            placeholder="Escribe un mensaje..."
            disabled={loadingAction}
          />

          {/* Botón para enviar el mensaje */}
          <button
            type="submit"
            disabled={!inputText.trim() || loadingAction}
            className="p-2.5 bg-[#0a3d70] text-white rounded-full hover:bg-[#082a4d] transition-transform disabled:opacity-40 disabled:hover:bg-[#0a3d70] disabled:scale-100 shrink-0 shadow-sm"
          >
            {loadingAction ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4 fill-white" />
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatInput;
