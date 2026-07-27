import type { Room } from "../../types";

interface RoomCardProps {
  room: Room;
  selectedRoomId?: string;
  onSelectRoom: (room: Room) => void;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  selectedRoomId,
  onSelectRoom,
}) => {
  const roomId = room.id;
  const isActive = roomId === selectedRoomId;
  const initials = room.name ? room.name.slice(0, 2).toUpperCase() : "BD";

  return (
    /* Roster Rooms List (Full-Bleed layout like WhatsApp chats) */
    <button
      key={roomId}
      onClick={() => onSelectRoom(room)}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors cursor-pointer group border-l-3 ${
        isActive
          ? "bg-[#005c53] hover:bg-[#004e46] border-[#005c53]"
          : "hover:bg-[#f5f6f6] focus:bg-[#f0f2f5] border-transparent focus:border-l-[#0a3d70]"
      }`}
    >
      {/* WhatsApp-style round group icon */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-105 ${
          isActive
            ? "bg-white text-[#005c53] border-white/10"
            : "bg-gradient-to-br from-[#0a3d70]/10 to-[#ff6000]/10 text-[#0a3d70] border-gray-100/50"
        }`}
      >
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p
            className={`text-sm font-semibold truncate leading-tight transition-colors ${
              isActive
                ? "text-white"
                : "text-gray-800 group-hover:text-[#0a3d70]"
            }`}
          >
            {room.name}
          </p>
          <span
            className={`text-[10px] font-medium whitespace-nowrap ml-1 shrink-0 px-1.5 py-0.5 rounded-md ${
              isActive
                ? "bg-[#004d45] text-teal-100"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {room.theme || "General"}
          </span>
        </div>
        <p
          className={`text-xs truncate mt-1 ${
            isActive ? "text-[#c4eae6]" : "text-gray-400"
          }`}
        >
          Código de sala:{" "}
          <span
            className={`font-mono font-medium tracking-tight ${isActive ? "text-white/90" : "text-[#0a3d70]/75"}`}
          >
            {roomId || "---"}
          </span>
        </p>
      </div>
    </button>
  );
};

export default RoomCard;
