import type React from "react";
import type { Message, UserProfile } from "../../types";
import { motion } from "motion/react";
import { getFlag } from "../../helpers/roomHelpers";
import { CheckCheck, Globe, Loader2, Mic, Play, Volume2 } from "lucide-react";

interface MessageItemProps {
  message: Message; // Información del mensaje que se va a mostrar
  user: UserProfile; // Usuario autenticado, utilizado para saber si el mensaje es propio
  handleSpeak: (text: string, messageId: string) => void; // Función para reproducir el mensaje mediante síntesis de voz
  getTranslation: (message: Message) => void; // Función para traducir un mensaje al idioma del usuario
  isTTSLoading: string | null; // Identificador del mensaje cuya síntesis de voz está cargando
  ttsReadyMap: Record<string, string>; // // Almacena la URL (blob) del audio generado para cada mensaje
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  user,
  handleSpeak,
  getTranslation,
  isTTSLoading,
  ttsReadyMap,
}) => {
  // Determina si el mensaje fue enviado por el usuario autenticado
  const isMe = message.senderId === user.id;
  // Obtiene la traducción correspondiente al idioma del usuario
  const translation = message.translations?.[user.language];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
    >
      {/* Burbuja principal del mensaje */}
      <div
        className={`px-3 py-2 rounded-xl text-gray-800 max-w-[85%] sm:max-w-[70%] shadow-[0_1px_0.5px_rgba(0,0,0,0.08)] relative ${
          isMe ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"
        }`}
        style={{ minWidth: "110px" }}
      >
        {/* Encabezado del mensaje (remitente e idioma) */}
        <div className="flex items-center justify-between gap-6 mb-1 font-medium select-none">
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${isMe ? "text-[#005c4b]" : "text-[#0a3d70]"}`}
          >
            {isMe ? "Tú" : message.senderName}
          </span>
          <span className="text-xs shrink-0">
            {getFlag(message.senderLanguage || "es")}
          </span>
        </div>

        {/* Contenido principal del mensaje */}
        <p className="text-[13px] font-medium leading-relaxed text-gray-800 pr-5 break-words">
          {message.text}
        </p>

        {/* Reproductor para mensajes de voz enviados por el usuario */}
        {message.audioData && (
          <div className="mt-2.5 bg-gray-50/80 rounded-lg p-2 flex items-center gap-3.5 border border-gray-100">
            <button
              type="button"
              onClick={() => {
                const audio = new Audio(message.audioData);
                audio.play();
              }}
              className="p-2 bg-white hover:bg-gray-100 rounded-full border border-gray-200 transition-colors group shrink-0"
              title="Reproducir audio"
            >
              <Play className="w-3.5 h-3.5 fill-[#0a3d70]/90 text-[#0a3d70] group-active:scale-90 transition-transform" />
            </button>
            <div className="flex-1 flex flex-col gap-1 min-w-[110px]">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#0a3d70]/40 w-full" />
              </div>
              <span className="text-[8px] font-bold uppercase tracking-tight text-gray-400 flex items-center gap-1">
                <Volume2 className="w-2.5 h-2.5" /> Mensaje de voz
              </span>
            </div>
          </div>
        )}

        {/* Indicador cuando el mensaje proviene de una transcripción de audio */}
        {message.isAudioTranscription && (
          <div className="mt-1 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-wider text-gray-400 select-none">
            <Mic className="w-2.5 h-2.5 text-[#ff6000]" /> Transcrito por IA
          </div>
        )}

        {/* Botón para escuchar el mensaje mediante síntesis de voz */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() =>
              handleSpeak(message.text, message.id || (message as any)._id)
            }
            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors border select-none ${
              ttsReadyMap[message.id || (message as any)._id]
                ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600/25"
                : "bg-gray-100/90 hover:bg-gray-200/90 text-gray-600 border-gray-200/50"
            }`}
          >
            {isTTSLoading === (message.id || (message as any)._id) ? (
              <Loader2 className="w-3 h-3 animate-spin text-gray-500" />
            ) : ttsReadyMap[message.id || (message as any)._id] ? (
              <Play className="w-3 h-3 fill-current text-white" />
            ) : (
              <Volume2 className="w-3 h-3 text-gray-500" />
            )}
            {ttsReadyMap[message.id || (message as any)._id]
              ? "Reproducir"
              : "Escuchar"}
          </button>
        </div>

        {/* Traducción del mensaje al idioma del usuario */}
        {translation && translation !== message.text && (
          <div className="mt-2.5 pt-2.5 border-t border-gray-200/60 text-left">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-1 text-[10px] uppercase font-extrabold text-[#ff6000]">
                <Globe className="w-3 h-3" /> Traducción ({user.language})
              </div>
              <button
                onClick={() =>
                  handleSpeak(
                    translation,
                    (message.id || (message as any)._id) + "-tl",
                  )
                }
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider flex items-center gap-1 transition-colors border select-none ${
                  ttsReadyMap[(message.id || (message as any)._id) + "-tl"]
                    ? "bg-amber-500 text-white border-amber-500/30"
                    : "bg-gray-155/80 hover:bg-gray-200/80 text-gray-500 border-gray-200"
                }`}
              >
                {isTTSLoading ===
                (message.id || (message as any)._id) + "-tl" ? (
                  <Loader2 className="w-2 h-2 animate-spin text-gray-450" />
                ) : ttsReadyMap[
                    (message.id || (message as any)._id) + "-tl"
                  ] ? (
                  <Play className="w-2.5 h-2.5 fill-current" />
                ) : (
                  <Volume2 className="w-2.5 h-2.5" />
                )}
                {ttsReadyMap[(message.id || (message as any)._id) + "-tl"]
                  ? "Reproducir"
                  : "Oír"}
              </button>
            </div>
            <p className="text-[13px] italic text-gray-700 leading-relaxed pr-2 break-words font-medium">
              {translation}
            </p>
          </div>
        )}

        {/* Hora de envío y confirmación de lectura */}
        <div className="text-[9px] text-gray-400 font-medium float-right mt-1 ml-4 select-none flex items-center gap-1">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />}
        </div>
      </div>

      {/* Acción para traducir el mensaje cuando aún no existe traducción */}
      {!translation && !isMe && (
        <div className="mt-1 ml-2 text-[10px] text-gray-400 select-none">
          <button
            onClick={() => getTranslation(message)}
            className="text-[#0a3d70] hover:underline font-bold"
          >
            Traducir mensaje
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MessageItem;
