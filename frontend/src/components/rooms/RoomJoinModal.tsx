import { Key } from "lucide-react";
import { motion } from "motion/react";
import type React from "react";

interface RoomJoinModalProps {
  loading: boolean;
  joinCode: string;
  setJoinCode: (value: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const RoomJoinModal: React.FC<RoomJoinModalProps> = ({
  loading,
  joinCode,
  setJoinCode,
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
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
            <Key className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Unirse a una Sala
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            Introduce el código de invitación que te compartieron.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                Código de Invitación
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="Ej: AB12CD"
                className="w-full bg-gray-50 border-none rounded-2xl p-4 text-center text-2xl font-black tracking-widest focus:ring-2 focus:ring-amber-500 transition-all uppercase"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
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
              disabled={loading || !joinCode.trim()}
              className="flex-[2] bg-amber-600 text-white rounded-2xl px-6 py-4 text-sm font-bold shadow-lg shadow-amber-100 hover:bg-amber-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? "Buscando..." : "Unirse ahora"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RoomJoinModal;
