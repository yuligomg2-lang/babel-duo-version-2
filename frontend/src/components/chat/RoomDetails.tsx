import { Copy, Loader2, LogOut, Trash2 } from "lucide-react";
import type React from "react";
import { LANGUAGES, type Room, type UserProfile } from "../../types";

interface RoomDetailsProps {
  isOpen: boolean;
  room: Room;
  user: UserProfile;
  roomMembers: UserProfile[];

  isOwner: boolean;

  themeMode: "classic" | "modern";
  setThemeMode: React.Dispatch<React.SetStateAction<"classic" | "modern">>;

  isUpdatingLang: boolean;
  handleUpdateUserLanguage: (newCode: string) => void;

  copiedCodeFeedback: boolean;
  setCopiedCodeFeedback: React.Dispatch<React.SetStateAction<boolean>>;

  loadingAction: boolean;
  handleDeleteRoom: () => void;
  handleLeaveRoom: () => void;

  onClose: () => void;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
  isOpen,
  room,
  user,
  roomMembers,
  isOwner,
  themeMode,
  setThemeMode,
  isUpdatingLang,
  handleUpdateUserLanguage,
  copiedCodeFeedback,
  setCopiedCodeFeedback,
  loadingAction,
  handleDeleteRoom,
  handleLeaveRoom,
  onClose,
}) => {
  // Si el panel está cerrado, no se muestra.
  if (!isOpen) return null;
  return (
    <div className="hidden md:flex w-[320px] lg:w-[345px] border-l border-gray-200/25 bg-white flex-col h-full overflow-y-auto shrink-0 animate-in slide-in-from-right-10 duration-200 shadow-sm">
      {/* Encabezado del panel */}
      <div className="p-4 bg-[#f0f2f5] border-b border-gray-200/25 flex items-center justify-between select-none">
        <span className="text-xs font-bold text-gray-700 tracking-wide">
          Información y Ajustes
        </span>

        <button
          type="button"
          onClick={onClose}
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

              <span className="text-[10px] text-gray-400 font-medium">
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
              className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 relative shrink-0 ${
                themeMode === "classic" ? "bg-[#005c53]" : "bg-gray-200"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform duration-200 ${
                  themeMode === "classic" ? "translate-x-5" : "translate-x-0"
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
              className="w-full bg-white border border-gray-200/80 text-gray-800 text-xs rounded-xl px-3.5 py-3 h-[45px] outline-none focus:ring-1 focus:ring-[#005c53] font-semibold cursor-pointer shadow-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code.toUpperCase()})
                </option>
              ))}
            </select>

            {isUpdatingLang && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Información de los participantes de la sala */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
            Room Members
          </span>

          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-3">
            {roomMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 py-2 border-b last:border-b-0"
              >
                {/* Inicial del usuario como avatar */}
                <div className="w-8 h-8 rounded-full bg-[#005c53] flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>

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

          <div className="flex flex-col gap-2.5">
            <div className="bg-gray-50 border border-gray-150/50 rounded-xl p-3 text-center select-all font-mono font-bold text-[12px] tracking-wider text-gray-600 shadow-inner">
              {room.inviteCode || room.id}
            </div>

            {/* Copiar el código */}
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(room.inviteCode);
                setCopiedCodeFeedback(true);

                setTimeout(() => setCopiedCodeFeedback(false), 2000);
              }}
              className={`w-full py-2.5 px-3 border rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
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

        {/* Separador */}
        <div className="w-full h-[1px] bg-gray-100/30 my-1" />

        {/* Acciones de la sala */}
        <div className="flex flex-col gap-2.5">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">
            Ajustes de Sala
          </span>

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
              <button
                type="button"
                onClick={handleLeaveRoom}
                disabled={loadingAction}
                className="w-full py-2.5 px-3 border border-red-100 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
  );
};

export default RoomDetails;
