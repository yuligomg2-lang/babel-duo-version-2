import {
  ChevronLeft,
  Info,
  Loader2,
  LogOut,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type React from "react";
import type { Room } from "../../types";

/**
 * Propiedades necesarias para renderizar el encabezado del chat.
 *
 * - room: Información de la sala/conversación actual.
 * - isOwner: Determina si el usuario actual es propietario de la sala.
 * - isSidebarOpen: Controla el estado del panel lateral de información.
 * - loadingAction: Indica si existe una acción en proceso.
 * - onBack: Regresa a la lista de conversaciones.
 * - onShare: Comparte la sala actual.
 * - onToggleSidebar: Abre o cierra el panel lateral.
 * - onDeleteRoom: Elimina la sala si el usuario tiene permisos.
 * - onLeaveRoom: Permite abandonar la sala.
 */
interface ChatHeaderProps {
  room: Room;
  isOwner: boolean;
  isSidebarOpen: boolean;
  loadingAction: boolean;
  onBack: () => void;
  onShare: () => void;
  onToggleSidebar: () => void;
  onDeleteRoom: () => void;
  onLeaveRoom: () => void;
}

/**
 * Encabezado principal del chat.
 */
const ChatHeader: React.FC<ChatHeaderProps> = ({
  room,
  isOwner,
  isSidebarOpen,
  loadingAction,
  onBack,
  onShare,
  onToggleSidebar,
  onDeleteRoom,
  onLeaveRoom,
}) => {
  return (
    <div className="p-3 bg-[#f0f2f5] border-b border-gray-205/30 flex items-center justify-between pointer-events-auto select-none">
      <div className="flex items-center gap-3">
        {/* Botón para regresar al listado de salas */}
        <button
          onClick={onBack}
          className="p-2 -ml-1 text-gray-500 hover:text-[#0a3d70] outline-none transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Avatar generado automáticamente con las iniciales de la sala */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#005c53]/10 to-[#ff6000]/10 flex items-center justify-center font-bold text-[#005c53] text-xs shrink-0 select-none">
          {room.name ? room.name.slice(0, 2).toUpperCase() : "BD"}
        </div>

        <div className="min-w-0">
          <h2 className="font-bold text-gray-800 leading-tight text-sm flex items-center gap-2 truncate">
            {room.name}
            {isOwner && (
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
            )}
          </h2>
          <p className="text-[11px] text-[#005c53] font-bold">online</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pr-1 md:pr-2">
        {/* Botón para compartir el código de invitación */}
        <button
          type="button"
          title="Compartir sala (Código de invitación)"
          onClick={onShare}
          className="p-1.5 text-[#005c53] hover:bg-gray-200/40 rounded-lg transition-all"
        >
          <Share2 className="w-[18px] h-[18px] stroke-[2]" />
        </button>

        {/* Botón para eliminar la sala (propietario) o salir de ella (participante) */}
        {isOwner ? (
          <button
            type="button"
            title="Eliminar Sala"
            onClick={onDeleteRoom}
            disabled={loadingAction}
            className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          >
            {loadingAction ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <Trash2 className="w-[18px] h-[18px] stroke-[2]" />
            )}
          </button>
        ) : (
          <button
            type="button"
            title="Salir de la Sala"
            onClick={onLeaveRoom}
            disabled={loadingAction}
            className="p-1.5 text-red-650 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          >
            {loadingAction ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <LogOut className="w-[18px] h-[18px] stroke-[2]" />
            )}
          </button>
        )}

        <div className="w-[1px] h-4 bg-gray-300 mx-1 hidden md:block" />
        {/* Mostrar u ocultar el panel lateral */}
        <button
          type="button"
          onClick={onToggleSidebar}
          title={
            isSidebarOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"
          }
          className={`p-1.5 rounded-lg transition-all hidden md:block ${
            isSidebarOpen
              ? "text-[#005c53] bg-[#005c53]/5"
              : "text-gray-500 hover:bg-gray-200/40"
          }`}
        >
          <Info className="w-[19px] h-[19px] stroke-[2]" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
