import { API_URL } from "../../services/api";
import React, { useState, useEffect } from "react";
import type { Room, UserProfile } from "../../types";
import { MessageSquare } from "lucide-react";
import { AnimatePresence } from "motion/react";
import RoomSearch from "./RoomSearch";
import RoomCard from "./RoomCard";
import RoomJoinModal from "./RoomJoinModal";
import RoomCreateModal from "./RoomCreateModal";

interface RoomListProps {
  user: UserProfile;
  onSelectRoom: (room: Room) => void;
  selectedRoomId?: string;
}

export const RoomList: React.FC<RoomListProps> = ({
  user,
  onSelectRoom,
  selectedRoomId,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [newRoom, setNewRoom] = useState({ name: "", theme: "" });

  /**
   * Obtiene las salas del usuario autenticado.
   */
  const fetchRooms = async () => {
    // Mostrar indicador de carga
    setLoading(true);

    try {
      // Obtener todas las salas registradas
      const response = await fetch(`${API_URL}/rooms`);

      // Verificar que la petición fue exitosa
      if (!response.ok) {
        throw new Error("Error al obtener las salas");
      }

      // Convertir la respuesta en un arreglo de salas
      const data: Room[] = await response.json();

      // Filtrar únicamente las salas donde el usuario pertenece
      const userRooms = data.filter((room) => room.members.includes(user.id));

      // Actualizar el listado de salas
      setRooms(userRooms);
    } catch (error) {
      setError("Error al cargar salas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [user.id]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;

    try {
      setLoading(true);

      // Crear la nueva sala
      const room = {
        id: crypto.randomUUID(),
        name: newRoom.name,
        description: "",
        theme: newRoom.theme || "General",
        languages: [user.language],
        createdBy: user.id,
        createdAt: new Date(),
        isPrivate: false,
        inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        members: [user.id],
      };

      const response = await fetch(`${API_URL}/rooms`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(room),
      });

      if (!response.ok) {
        throw new Error("No fue posible crear la sala");
      }

      const createdRoom = await response.json();

      // Actualizar la lista local
      setRooms((prev) => [createdRoom, ...prev]);

      // Actualizar la lista local
      setIsModalOpen(false);

      // Limpiar formulario
      setNewRoom({ name: "", theme: "" });
      // Seleccionar la sala creada
      onSelectRoom(createdRoom);
    } catch (err) {
      alert("Error al crear la sala");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Permite a un usuario unirse a una sala utilizando
   * un código de invitación.
   */
  const handleJoinRoom = async (e: React.FormEvent) => {
    // Evitar que el formulario recargue la página
    e.preventDefault();

    // Verificar que el usuario haya escrito un código
    if (!joinCode.trim()) return;

    try {
      // Mostrar indicador de carga
      setLoading(true);

      // Obtener todas las salas registradas en json-server
      const response = await fetch(`${API_URL}/rooms`);

      // Verificar que la petición fue exitosa
      if (!response.ok) {
        throw new Error("No fue posible obtener las salas.");
      }

      // Convertir la respuesta en un arreglo de salas
      const rooms: Room[] = await response.json();

      // Buscar una sala cuyo código de invitación coincida
      const room = rooms.find(
        (r) => r.inviteCode.toUpperCase() === joinCode.trim().toUpperCase(),
      );

      // Si no existe la sala, mostrar un error
      if (!room) {
        throw new Error("El código de invitación no es válido.");
      }

      // Verificar si el usuario ya pertenece a la sala
      if (!room.members.includes(user.id)) {
        // Agregar el usuario al listado de miembros
        const updatedMembers = [...room.members, user.id];

        // Actualizar únicamente el arreglo de miembros
        const updateResponse = await fetch(`${API_URL}/rooms/${room.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            members: updatedMembers,
          }),
        });

        // Verificar que la actualización fue exitosa
        if (!updateResponse.ok) {
          throw new Error("No fue posible unirse a la sala.");
        }

        // Actualizar el objeto local para trabajar con la información más reciente
        room.members = updatedMembers;
      }

      // Agregar la sala al listado local solamente si aún no existe
      setRooms((prev) => {
        if (prev.some((r) => r.id === room.id)) {
          return prev;
        }

        return [room, ...prev];
      });

      // Cerrar el modal de ingreso
      setIsJoinModalOpen(false);

      // Limpiar el campo del código
      setJoinCode("");

      // Seleccionar la sala para abrir la conversación
      onSelectRoom(room);
    } catch (error: any) {
      // Mostrar el mensaje de error correspondiente
      setError(error.message || "Error al unirse a la sala.");
    } finally {
      // Ocultar el indicador de carga
      setLoading(false);
    }
  };

  const filteredRooms = Array.isArray(rooms)
    ? rooms.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.theme.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];
  return (
    <div className="flex flex-col h-full bg-[#f8f9fa]">
      <RoomSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onJoin={() => setIsJoinModalOpen(true)}
        onCreate={() => setIsModalOpen(true)}
        isGuest={user.isGuest ?? false}
      />

      <div className="flex-1 overflow-y-auto divide-y divide-[#f0f2f5] bg-white custom-scrollbar">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            selectedRoomId={selectedRoomId}
            onSelectRoom={onSelectRoom}
          />
        ))}

        {filteredRooms.length === 0 && !loading && (
          <div className="text-center py-16 px-4 bg-gray-50/50">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-gray-400">No se encontraron salas</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isJoinModalOpen && (
          <RoomJoinModal
            loading={loading}
            joinCode={joinCode}
            setJoinCode={setJoinCode}
            onClose={() => setIsJoinModalOpen(false)}
            onSubmit={handleJoinRoom}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <RoomCreateModal
            loading={loading}
            newRoom={newRoom}
            setNewRoom={setNewRoom}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateRoom}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
