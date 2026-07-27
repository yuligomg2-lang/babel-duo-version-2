import type React from "react";
import { motion } from "motion/react";
import { MessageSquare } from "lucide-react";

interface RoomCreateModalProps {
  loading: boolean;
  newRoom: {
    name: string;
    theme: string;
  };
  setNewRoom: React.Dispatch<
    React.SetStateAction<{
      name: string;
      theme: string;
    }>
  >;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RoomCreateModal: React.FC<RoomCreateModalProps> = ({
  loading,
  newRoom,
  setNewRoom,
  onClose,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl"
      >
        <form onSubmit={onSubmit} className="p-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Nueva Sala</h3>
          <p className="text-gray-500 text-sm mb-6">
            Crea un espacio para chatear y traducir en tiempo real.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Nombre de la sala
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="Ej: Desarrollo Web"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Tema o Propósito
              </label>
              <input
                type="text"
                placeholder="Ej: Feedback de UI/UX"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                value={newRoom.theme}
                onChange={(e) =>
                  setNewRoom((prev) => ({
                    ...prev,
                    theme: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !newRoom.name.trim()}
              className="flex-[2] bg-indigo-600 text-white rounded-2xl px-6 py-4 text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Creando..." : "Crear Sala"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RoomCreateModal;
