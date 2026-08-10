import React, { useState, useEffect, useRef } from "react";
import type { Room, UserProfile, Message } from "../../types";
import { Share2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import { API_URL } from "../../services/api";
import ShareRoomModal from "./ShareRoomModal";
import ChatInput from "./ChatInput";
import RoomDetails from "./RoomDetails";
import { useChatMessages } from "../../hooks/useChatMessages";

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
  const {
    messages,
    setMessages,
    inputText,
    setInputText,
    typingUsers,
    setTypingUsers,
    error,
    setError,
  } = useChatMessages();

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
          {/* Modal para compartir la sala */}
          <ShareRoomModal
            isOpen={isShareModalOpen}
            room={room}
            onClose={() => setIsShareModalOpen(false)}
            onSendInviteCode={handleSendInviteCodeToChat}
          />
        </AnimatePresence>

        {/* Header del chat */}
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

        {/* Mensajes */}
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
        <div>
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

          {/* Campo para escribir y enviar mensajes */}
          <ChatInput
            inputText={inputText}
            setInputText={setInputText}
            handleSendMessage={handleSendMessage}
            loadingAction={loadingAction}
            isRecording={isRecording}
            recordDuration={recordDuration}
            startRecording={startRecording}
            stopRecording={stopRecording}
            formatDuration={formatDuration}
          />
        </div>
      </div>

      {/* Panel lateral derecho con detalles de la sala */}
      <RoomDetails
        isOpen={isSidebarOpen}
        room={room}
        user={user}
        roomMembers={roomMembers}
        isOwner={isOwner}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
        isUpdatingLang={isUpdatingLang}
        handleUpdateUserLanguage={handleUpdateUserLanguage}
        copiedCodeFeedback={copiedCodeFeedback}
        setCopiedCodeFeedback={setCopiedCodeFeedback}
        loadingAction={loadingAction}
        handleDeleteRoom={handleDeleteRoom}
        handleLeaveRoom={handleLeaveRoom}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};
