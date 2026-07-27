import { Copy, Send, Share2, X } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import type { Room } from "../../types";

/**
 * Propiedades que recibe el modal para compartir una sala.
 */
interface ShareRoomModalProps {
  isOpen: boolean;
  room: Room;
  onClose: () => void;
  onSendInviteCode: () => void;
}

const ShareRoomModal: React.FC<ShareRoomModalProps> = ({
  isOpen,
  room,
  onClose,
  onSendInviteCode,
}) => {
  // Si el modal está cerrado no se renderiza ningún elemento.
  if (!isOpen) return null;
  return (
    /* Fondo oscuro que bloquea la interacción con el resto de la aplicación */
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      {/* Contenedor principal del modal con animación de apertura */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
      >
        <div className="p-8">
          {/* Encabezado del modal */}
          <div className="flex justify-between items-start mb-6">
            {/* Icono representativo de compartir */}
            <div className="w-16 h-16 bg-gradient-to-br from-[#0a3d70]/5 to-[#ff6000]/5 rounded-2xl flex items-center justify-center">
              <Share2 className="w-8 h-8 text-[#0a3d70]" />
            </div>

            {/* Botón para cerrar el modal */}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Información principal del modal */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Compartir Sala
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Cualquiera con este código puede unirse a la conversación.
          </p>

          {/* Tarjeta que muestra el código de invitación */}
          <div className="bg-gray-50/70 border border-gray-100/50 rounded-2xl p-6 flex flex-col items-center gap-4 relative group">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
              Código de Invitación
            </span>

            {/* Código único de la sala */}
            <div className="text-4xl font-black text-gray-900 tracking-wider">
              {room.inviteCode}
            </div>
            {/* Botones principales para compartir la sala */}
            <div className="grid grid-cols-2 gap-2 w-full mt-2">
              {/* Copia únicamente el código de invitación */}
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

              {/* Envía el código directamente al chat y cierra el modal */}
              <button
                onClick={() => {
                  onSendInviteCode();
                  onClose();
                }}
                className="py-3 bg-[#0a3d70] hover:bg-[#082a4d] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-3.5 h-3.5 fill-white text-white" />
                Enviar al Chat
              </button>
            </div>
          </div>

          {/* Copia una invitación completa con el nombre de la sala, código y enlace */}
          <div className="mt-6">
            <button
              onClick={() => {
                const text = `¡Únete a mi sala "${room.name}" en BabelDuo!\nCódigo: ${room.inviteCode}\n${window.location.origin}`;
                navigator.clipboard.writeText(text);
                onClose();
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
  );
};

export default ShareRoomModal;
