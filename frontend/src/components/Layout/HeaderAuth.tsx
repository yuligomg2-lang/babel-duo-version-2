import { motion, AnimatePresence } from "motion/react";
import type { UserProfile } from "../../types";
import { LANGUAGES } from "../../types";
import {
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
} from "lucide-react";

interface HeaderAuthProps {
  user: UserProfile;

  showSettings: boolean;
  language: string;
  interests: string;
  loading: boolean;

  setShowSettings: (value: boolean) => void;
  setLanguage: (value: string) => void;
  setInterests: (value: string) => void;

  handleSaveSettings: () => void;
  handleSignOut: () => void;
}

/**
 * Funcion para calcular el tiempo restante antes de que expire la sesión de un usuario invitado.
 * Si la sesión ya expiró, devuelve el texto "Expirada".
 *
 * @returns Tiempo restante en días, horas o minutos.
 */
const getRemainingTime = (user: UserProfile) => {
  // Si el usuario no tiene fecha de expiración, no se muestra nada
  if (!user.expiresAt) return "";

  // Diferencia entre la fecha de expiración y la fecha actual
  const diff = new Date(user.expiresAt).getTime() - Date.now();

  // La sesión ya expiró
  if (diff <= 0) {
    return "Expirada";
  }

  // Conversión del tiempo restante
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  // Mostrar días cuando falte más de uno
  if (days > 0) {
    return `${days} d ${hours} h`;
  }

  // Mostrar horas cuando falte menos de un día
  if (hours > 0) {
    return `${hours} h`;
  }

  // Mostrar minutos cuando falte menos de una hora
  return `${minutes} min`;
};

export default function HeaderAuth({
  user,
  showSettings,
  language,
  interests,
  loading,
  setShowSettings,
  setLanguage,
  setInterests,
  handleSaveSettings,
  handleSignOut,
}: HeaderAuthProps) {
  return (
    <div className="relative">
      {/* Encabezado del usuario autenticado */}
      <div className="h-24 flex items-center gap-4 bg-white px-4 border-b border-gray-200/60 ">
        {/* Avatar del usuario o imagen generada automáticamente */}
        <img
          src={
            user.photoURL ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}&background=0a3d70&color=ffffff`
          }
          className="w-11 h-11 rounded-xl border border-gray-100 object-cover"
          alt={user.displayName}
          referrerPolicy="no-referrer"
        />

        {/* Información principal del usuario */}
        <div className="flex-1 min-w-0 text-left">
          {/* Nombre del usuario */}
          <p className="text-base font-bold text-gray-900 truncate">
            {user.displayName}
          </p>

          {/* Idioma seleccionado y estado de invitado */}
          <div className="flex items-center gap-1.5 mt-1.5">
            {/* Idioma preferido */}
            <span className="text-[11px] bg-[#edf3f8] text-[#0a3d70] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              {user.language}
            </span>

            {/* Etiqueta mostrada únicamente para usuarios invitados */}
            {user.isGuest && (
              <span className="text-[11px] bg-[#fff0eb] text-[#ff6000] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Guest • ⏱ {getRemainingTime(user)}
              </span>
            )}
          </div>
        </div>

        {/* Botón para abrir o cerrar el panel de configuración */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1.5 text-gray-400 hover:text-[#0a3d70] transition-colors rounded-lg hover:bg-gray-50"
          aria-label="Toggle user settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>

        {/* Botón para cerrar la sesión del usuario */}
        <button
          onClick={handleSignOut}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
          aria-label="Sign out"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Panel desplegable con la configuración del perfil */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full right-0 mt-2.5 w-68 bg-white rounded-2xl shadow-xl border border-gray-200/80 p-4.5 z-50 text-left"
          >
            {/* Título del panel de configuración */}
            <h3 className="font-extrabold text-[#0a3d70] font-display text-sm mb-3">
              Configuración de Perfil
            </h3>

            {/* Formulario de configuración del usuario */}
            <div className="flex flex-col gap-3.5 mb-4">
              {/* Selección del idioma preferido */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Idioma de preferencia
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0a3d70] font-semibold text-gray-700"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campo para editar los intereses del usuario */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                  Intereses (Separados por coma)
                </label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="Tecnología, Cine, Viajes..."
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:outline-none focus:border-[#0a3d70] font-semibold text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Acciones del formulario */}
            <div className="flex gap-2">
              {/* Cerrar el panel sin guardar cambios */}
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 py-2 border border-gray-200 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer text-center block"
              >
                Cancelar
              </button>

              {/* Guardar la configuración del perfil */}
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex-1 py-2 bg-[#0a3d70] text-white rounded-full text-xs font-bold hover:bg-[#082a4d] active:scale-95 transition-all cursor-pointer text-center block disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
