import { Search, Key, Plus } from "lucide-react";

interface RoomSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onJoin: () => void;
  onCreate: () => void;
  isGuest: boolean;
}
const RoomSearch: React.FC<RoomSearchProps> = ({
  searchTerm,
  setSearchTerm,
  onJoin,
  onCreate,
  isGuest,
}) => {
  return (
    /* Encabezado de la sección de salas con buscador y acciones rápidas */
    <div className="px-4 py-4 bg-white border-r border-gray-200 flex items-center gap-3">
      {/* Contenedor del campo de búsqueda */}
      <div className="relative flex-1">
        {/* Icono de búsqueda */}
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 stroke-[1.5]" />

        {/* Campo para buscar salas por nombre o tema */}
        <input
          type="text"
          placeholder="Buscar salas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#f0f2f5] border-none rounded-lg pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[#0a3d70]/30 transition-all text-[#767676] placeholder-[#767676] font-medium"
        />
      </div>

      {/* Botones de acciones rápidas */}
      <div className="flex gap-1 shrink-0">
        {/* Botón para unirse a una sala mediante un código de invitación */}
        <button
          onClick={onJoin}
          title="Ingresar código de invitación"
          className="p-1.5 text-gray-500 hover:text-[#ff6000] hover:bg-gray-100 rounded-lg transition-colors active:scale-95"
        >
          <Key className="w-4 h-4" />
        </button>

        {/* Botón para crear una nueva sala */}
        {!isGuest && (
          <button
            onClick={onCreate}
            title="Crear nueva sala"
            className="p-1.5 bg-[#0a3d70] text-white rounded-lg hover:bg-[#082a4d] transition-colors active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomSearch;
