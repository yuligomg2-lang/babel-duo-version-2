import React, { useState, useEffect, useRef } from "react";
import type { Room, UserProfile, Message } from "../../types";
import { LANGUAGES } from "../../types";
import {
  Send,
  Mic,
  Square,
  Loader2,
  X,
  Share2,
  Trash2,
  LogOut,
  Copy,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import { API_URL } from "../../services/api";

interface ChatRoomProps {
  room: Room;
  user: UserProfile;
  onBack: () => void;
  onUserUpdate: (user: UserProfile | null) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({
  room,
  user,
  onBack,
  onUserUpdate,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState<string | null>(null); // messageId
  const [ttsReadyMap, setTtsReadyMap] = useState<Record<string, string>>({}); // messageId -> blobUrl
  const [micStatus, setMicStatus] = useState<
    "prompt" | "granted" | "denied" | "unknown"
  >("unknown");

  // Custom right sidebar and aesthetic styling states modeled after your Canva mock
  const [themeMode, setThemeMode] = useState<"classic" | "modern">("classic");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copiedCodeFeedback, setCopiedCodeFeedback] = useState(false);
  const [isUpdatingLang, setIsUpdatingLang] = useState(false);

  const handleUpdateUserLanguage = async (newCode: string) => {
    if (isUpdatingLang) return;
    setIsUpdatingLang(true);
    try {
      const updated = await api.updateUser(user.id, {
        ...user,
        language: newCode,
      });
      if (onUserUpdate) {
        onUserUpdate(updated);
      }
    } catch (err) {
      console.error("Failed to update user language:", err);
    } finally {
      setIsUpdatingLang(false);
    }
  };

  // Miembros de la sala
  const [roomMembers, setRoomMembers] = useState<UserProfile[]>([]);
  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Audio Unlocker for browser policies
    const unlockAudio = () => {
      const audio = new Audio();
      audio.src =
        "data:audio/wav;base64,UklGRigAAABXQVZFWm51bQAAAAADAAEAQO8AAEAfAABAAgAAAgAAAA==";
      audio
        .play()
        .then(() => {
          window.removeEventListener("click", unlockAudio);
          window.removeEventListener("touchstart", unlockAudio);
        })
        .catch(() => {});
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
    };
  }, []);

  /**
   * Obtiene la información de los usuarios que pertenecen
   * a la sala de conversación a partir de los identificadores
   * almacenados en room.members.
   */
  useEffect(() => {
    const loadRoomMembers = async () => {
      try {
        const response = await fetch(`${API_URL}/users`);
        const users: UserProfile[] = await response.json();

        // Filtrar únicamente los usuarios que pertenecen a la sala
        const members = users.filter((u) => room.members.includes(u.id));

        setRoomMembers(members);
      } catch (error) {
        console.error("Error al cargar los miembros de la sala:", error);
      }
    };

    loadRoomMembers();
  }, [room]);

  // Id de la sala actual
  const roomId = room.id;
  // Verifica si el usuario autenticado es el creador de la sala
  const isOwner = room.createdBy === user.id;

  useEffect(() => {
    const isInIframe = window.self !== window.top;
    console.log(
      "Mic system initialized. Context:",
      isInIframe ? "Iframe" : "Main Tab",
    );

    if (navigator.permissions && (navigator.permissions as any).query) {
      navigator.permissions
        .query({ name: "microphone" as any })
        .then((permissionStatus) => {
          setMicStatus(permissionStatus.state as any);
          console.log("Mic status initial state:", permissionStatus.state);
          permissionStatus.onchange = () => {
            console.log("Mic status changed to:", permissionStatus.state);
            setMicStatus(permissionStatus.state as any);
          };
        })
        .catch((e) => {
          console.warn("navigator.permissions.query failed:", e);
          // Don't set to denied automatically, let's keep it unknown
          setMicStatus("unknown");
        });
    }
  }, []);

  const requestMicPermissionManually = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicStatus("granted");
      alert("✅ Micrófono activado con éxito.");
    } catch (err: any) {
      console.error("Manual permission request failed:", err);
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setMicStatus("denied");
        alert(
          "❌ El permiso fue denegado. Por favor, actívalo en los ajustes de tu navegador.",
        );
      } else {
        alert("❌ No se pudo activar el micrófono: " + err.message);
      }
    }
  };

  /**
   * Mantiene el chat desplazado automáticamente
   * al último mensaje cuando cambia la conversación.
   */
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /**
   * Maneja el envío de mensajes desde el formulario.
   * Temporalmente esta función únicamente valida el contenido
   * del mensaje y limpia el campo de entrada. El envío en
   * tiempo real mediante Socket.io será implementado en una
   * fase posterior del proyecto.
   */
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputText.trim() || !roomId) return;

    // Crear un mensaje temporal
    const newMessage: Message = {
      id: crypto.randomUUID(),
      roomId,
      senderId: user.id,
      senderName: user.displayName,
      senderLanguage: user.language,
      text: inputText,
      createdAt: new Date().toISOString(),
      translations: {},
    };

    // Mostrarlo inmediatamente en el chat
    setMessages((prev) => [...prev, newMessage]);

    // Limpiar el input
    setInputText("");

    console.log("Mensaje simulado:", newMessage);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.inviteCode);
    // Visual feedback handled by state or just keep simple for now
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const startRecording = async () => {
    const isInIframe = window.self !== window.top;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "Tu navegador no soporta la grabación de audio o está bloqueada por la configuración de seguridad.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // GRABACIÓN DE AUDIO
      const mimeTypes = ["audio/webm", "audio/ogg", "audio/mp4"];
      const supportedType =
        mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";

      const mediaRecorder = new MediaRecorder(
        stream,
        supportedType ? { mimeType: supportedType } : {},
      );

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: supportedType || "audio/webm",
        });

        await handleAudioSend(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      // RECONOCIMIENTO DE VOZ LOCAL
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();

        recognition.lang = user.language || "es-ES";
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onstart = () => {
          console.log("SpeechRecognition iniciado");
        };

        recognition.onerror = (event: any) => {
          console.error("SpeechRecognition error:", event);
        };

        recognition.onend = () => {
          console.log("SpeechRecognition finalizado");
        };

        recognition.onresult = (event: any) => {
          let finalText = "";

          for (let i = 0; i < event.results.length; i++) {
            finalText += event.results[i][0].transcript + " ";
          }

          console.log("RECONOCIMIENTO:", finalText);

          setCurrentTranscript(finalText.trim());
        };

        recognition.start();

        recognitionRef.current = recognition;
      }

      setIsRecording(true);
      setRecordDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Mic access denied:", err);

      const isSecurityError =
        err.name === "NotAllowedError" ||
        err.name === "SecurityError" ||
        err.name === "PermissionDeniedError";

      if (isSecurityError) {
        setMicStatus("denied");
      }

      if (isInIframe && isSecurityError) {
        console.warn("Recording blocked by iframe security policy.");
      } else if (isSecurityError) {
        setError(
          "Acceso al micrófono denegado. Revisa los permisos del navegador.",
        );

        setTimeout(() => setError(null), 5000);
      } else {
        alert("No se pudo acceder al micrófono: " + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsRecording(false);

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    console.log("Texto reconocido:", currentTranscript);
  };

  /**
   * Convierte una duración en segundos al formato mm:ss.
   */
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const handleSpeak = async (text: string, _messageId?: string) => {
    try {
      speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = "es-ES";
      utterance.rate = 1;
      utterance.pitch = 1;

      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("TTS failed:", err);
    }
  };

  const playReadyAudio = (messageId: string) => {
    const url = ttsReadyMap[messageId];
    if (!url) return;

    const audio = new Audio(url);
    audio.play().catch((err) => {
      console.error("Manual play failed:", err);
      if (err.name === "NotAllowedError") {
        alert("Haz clic una vez en la página y vuelve a intentar el sonido.");
      }
    });
  };

  const handleDeleteRoom = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar esta sala? Esta acción no se puede deshacer.",
      )
    )
      return;

    setLoadingAction(true);
    try {
      await api.deleteRoom(room.id, user.id);
      onBack();
      // Optimization: we might want to tell other users if they are in the room,
      // but for now simple delete is fine as it's a prototype.
    } catch (err) {
      alert("Error al eliminar la sala");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeaveRoom = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas salir de esta sala? Ya no tendrás acceso a menos que uses el código de invitación de nuevo.",
      )
    )
      return;

    setLoadingAction(true);
    try {
      await api.deleteRoom(room.id, user.id);
      onBack();
    } catch (err: any) {
      console.error("Error leaving room:", err);
      alert("Error al salir de la sala");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSendInviteCodeToChat = () => {
    if (!roomId) return;
    socket.emit("send-message", {
      roomId: roomId,
      senderId: user.id,
      senderName: user.displayName,
      senderLanguage: user.language,
      text: `🎟️ ¡SALA DE CHAT! El código de invitación para unirse a esta conversación es: ${room.inviteCode || room.id}. Compártelo con quienes quieras traducir en tiempo real.`,
    });
  };

  return (
    <div className="flex-1 flex flex-row h-full overflow-hidden bg-white">
      {/* Área principal donde se muestra la conversación activa */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AnimatePresence>
          {isShareModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
              >
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#0a3d70]/5 to-[#ff6000]/5 rounded-2xl flex items-center justify-center">
                      <Share2 className="w-8 h-8 text-[#0a3d70]" />
                    </div>
                    <button
                      onClick={() => setIsShareModalOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Compartir Sala
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Cualquiera con este código puede unirse a la conversación.
                  </p>

                  <div className="bg-gray-50/70 border border-gray-100/50 rounded-2xl p-6 flex flex-col items-center gap-4 relative group">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                      Código de Invitación
                    </span>
                    <div className="text-4xl font-black text-gray-900 tracking-wider">
                      {room.inviteCode}
                    </div>

                    <div className="grid grid-cols-2 gap-2 w-full mt-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(room.inviteCode);
                          const btn = document.getElementById("copy-btn");
                          if (btn) btn.innerText = "¡Copiado!";
                          setTimeout(() => {
                            if (btn) btn.innerText = "Copiar Código";
                          }, 2000);
                        }}
                        id="copy-btn"
                        className="py-3 bg-white border border-gray-200/50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar Código
                      </button>

                      <button
                        onClick={() => {
                          handleSendInviteCodeToChat();
                          setIsShareModalOpen(false);
                        }}
                        className="py-3 bg-[#0a3d70] hover:bg-[#082a4d] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Send className="w-3.5 h-3.5 fill-white text-white" />
                        Enviar al Chat
                      </button>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => {
                        const text = `¡Únete a mi sala "${room.name}" en BabelDuo!\nCódigo: ${room.inviteCode}\n${window.location.origin}`;
                        navigator.clipboard.writeText(text);
                        setIsShareModalOpen(false);
                        alert("Enlace e invitación completos copiados.");
                      }}
                      className="w-full bg-[#0a3d70] text-white rounded-2xl py-3.5 text-xs font-bold shadow-lg shadow-sky-100 hover:bg-[#082a4d] transition-all active:scale-95"
                    >
                      Copiar Invitación Completa
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Header (with WhatsApp mock Phone, Video, Share, Exit/Delete, and Sidebar toggle Info button styled in deep green/teal) */}
        <ChatHeader
          room={room}
          isOwner={isOwner}
          isSidebarOpen={isSidebarOpen}
          loadingAction={loadingAction}
          onBack={onBack}
          onShare={() => setIsShareModalOpen(true)}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onDeleteRoom={handleDeleteRoom}
          onLeaveRoom={handleLeaveRoom}
        />

        {/* Messages Scroll Area with classic Doodle Wallpaper or modern minimalist backdrops */}
        <ChatMessages
          messages={messages}
          user={user}
          themeMode="classic"
          scrollRef={scrollRef}
          ttsReadyMap={{}}
          isTTSLoading={null}
          getTranslation={() => {}}
          handleSpeak={handleSpeak}
        />
        {/* const color = getUserColor(msg.senderId); */}
        {/* Typing Indicator */}
        <AnimatePresence>
          {Object.keys(typingUsers).length > 0 && (
            <motion.div className="px-6 py-1 bg-white/70 backdrop-blur-sm text-[10px] text-gray-500 italic select-none">
              {Object.values(typingUsers).join(", ")} está escribiendo...
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Input Drawer styled like WhatsApp Input Dock */}
        <div className="p-3 bg-[#f0f2f5] border-t border-gray-205/30 safe-area-bottom">
          {window.self !== window.top ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mb-2 p-2.5 bg-[#e1f3ff] border border-sky-100 rounded-xl flex items-start gap-2.5 text-sky-950 text-xs"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#0a3d70]" />
              <div className="flex-1">
                <p className="font-bold mb-0.5">
                  Casi listo para traducir voz...
                </p>
                <p className="leading-relaxed mb-1.5 opacity-80 text-[10px]">
                  Los navegadores bloquean el micrófono en previsualizaciones.
                  Abre la app en su propia pestaña para hablar:
                </p>
                <button
                  onClick={() => window.open(window.location.href, "_blank")}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0a3d70] hover:bg-[#082a4d] text-white rounded-lg font-bold transition-all text-[9px]"
                >
                  <Share2 className="w-2.5 h-2.5" />
                  ABRIR EN PESTAÑA NUEVA
                </button>
              </div>
            </motion.div>
          ) : (
            micStatus === "denied" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-2 p-2.5 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-950 text-xs"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="font-bold mb-0.5">
                    Permiso del Micrófono Denegado
                  </p>
                  <p className="leading-relaxed opacity-80 text-[10px] mb-2">
                    Desbloquea pulsando el candado 🔒 en tu navegador y permite
                    el micrófono.
                  </p>
                  <button
                    onClick={requestMicPermissionManually}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all text-[10px]"
                  >
                    Reintentar
                  </button>
                </div>
              </motion.div>
            )
          )}

          {isRecording ? (
            <div className="flex items-center justify-between bg-red-50 border border-red-100 p-1.5 rounded-xl animate-pulse">
              <div className="flex items-center gap-2 px-2 select-none">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-xs font-bold text-red-600 animate-pulse">
                  Grabando audio... {formatDuration(recordDuration)}
                </span>
              </div>
              <button
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
              <button
                type="button"
                onClick={startRecording}
                title="Grabar mensaje de voz con traducción automática"
                className="p-2.5 bg-white text-gray-500 rounded-full hover:bg-gray-100 hover:text-[#ff6000] border border-gray-200/50 transition-all shrink-0"
              >
                <Mic className="w-4.5 h-4.5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 h-12 bg-white border border-gray-200/60 rounded-full px-5 py-3 text-sm outline-none focus:ring-1 focus:ring-[#0a3d70]/30 transition-shadow text-gray-800 placeholder-[#767676]"
                placeholder="Escribe un mensaje..."
                disabled={loadingAction}
              />

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
      </div>

      {/* Panel lateral derecho con detalles de la sala */}
      {isSidebarOpen && (
        <div className="hidden md:flex w-[320px] lg:w-[345px] border-l border-gray-200/25 bg-white flex-col h-full overflow-y-auto shrink-0 animate-in slide-in-from-right-10 duration-200 shadow-sm">
          {/* Header of details sidebar corresponding to Canva clean theme */}
          <div className="p-4 bg-[#f0f2f5] border-b border-gray-200/25 flex items-center justify-between select-none">
            <span className="text-xs font-bold text-gray-700 font-sans tracking-wide">
              Información y Ajustes
            </span>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xs font-semibold px-2 py-1 rounded hover:bg-gray-200/40"
            >
              Cerrar
            </button>
          </div>

          <div className="p-5 flex flex-col gap-6">
            {/* Cambiar el fondo del chat */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Theme
              </span>
              <div className="flex items-center justify-between p-3.5 bg-gray-50/70 border border-gray-100 rounded-2xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-800">
                    Doodle clásico
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium font-sans">
                    Fondo estilo WhatsApp
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setThemeMode((prev) =>
                      prev === "classic" ? "modern" : "classic",
                    )
                  }
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none relative shrink-0 ${
                    themeMode === "classic" ? "bg-[#005c53]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-md transform duration-200 ${
                      themeMode === "classic"
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Selección del idioma de traducción */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Translation Language
              </span>
              <div className="relative">
                <select
                  value={user.language}
                  onChange={(e) => handleUpdateUserLanguage(e.target.value)}
                  disabled={isUpdatingLang}
                  className="w-full bg-white border border-gray-200/80 text-gray-800 text-xs rounded-xl px-3.5 py-3 h-[45px] outline-none focus:ring-1 focus:ring-[#005c53] font-semibold cursor-pointer transition-shadow shadow-sm"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.code.toUpperCase()})
                    </option>
                  ))}
                </select>
                {isUpdatingLang && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-450" />
                  </div>
                )}
              </div>
            </div>

            {/* Información de los participantes de la sala */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Room Members
              </span>
              {/* Lista de usuarios que pertenecen a la sala */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3">
                {roomMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 py-2 border-b last:border-b-0"
                  >
                    {/* Avatar generado a partir de la inicial del usuario */}
                    <div className="w-8 h-8 rounded-full bg-[#005c53] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {member.displayName.charAt(0).toUpperCase()}
                    </div>

                    {/* Información del miembro */}
                    <div>
                      <p className="text-xs font-semibold text-gray-800">
                        {member.displayName}
                      </p>

                      <p className="text-[10px] text-gray-500">
                        {member.language.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Código de invitación */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Room Code
              </span>
              {/* Código para compartir la sala */}
              <div className="flex flex-col gap-2.5">
                <div className="bg-gray-50 border border-gray-150/50 rounded-xl p-3 text-center select-all font-mono font-bold text-[12px] tracking-wider text-gray-600 shadow-inner">
                  {room.inviteCode || room.id}
                </div>
                {/* Copiar el código */}
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(room.inviteCode);
                      setCopiedCodeFeedback(true);
                      setTimeout(() => setCopiedCodeFeedback(false), 2000);
                    }}
                    className={`w-full py-2.5 border rounded-xl font-bold text-xs transition-all active:scale-[0.98] select-none flex items-center justify-center gap-1.5 ${
                      copiedCodeFeedback
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : "border-gray-200/50 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCodeFeedback ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>

            {/* Separador */}
            <div className="w-full h-[1px] bg-gray-100/30 my-1" />

            {/* Ajustes de la sala */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
                Ajustes de Sala
              </span>
              {/* Si el usuario es el creador de la sala, puede eliminarla */}
              <div className="flex flex-col gap-2">
                {isOwner ? (
                  <button
                    type="button"
                    onClick={handleDeleteRoom}
                    disabled={loadingAction}
                    className="w-full py-2.5 px-3 border border-red-150 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Eliminar Sala
                  </button>
                ) : (
                  /* Los demás participantes solo pueden abandonar la sala */
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    disabled={loadingAction}
                    className="w-full py-2.5 px-3 border border-red-100 bg-red-55/10 hover:bg-red-50 text-red-550 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {loadingAction ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                    ) : (
                      <LogOut className="w-4 h-4" />
                    )}
                    Salir del Grupo / Sala
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
