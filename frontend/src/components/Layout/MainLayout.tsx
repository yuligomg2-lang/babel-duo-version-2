import { API_URL } from "../../services/api";
import { useRef, useState } from "react";
import type { Room, UserProfile } from "../../types";
import HeaderAuth from "./HeaderAuth";
import { RoomList } from "../rooms/RoomList";
import { ChatRoom } from "../chat/ChatRoom";

interface MainLayoutProps {
  user: UserProfile;
  onUserUpdate: (user: UserProfile | null) => void;
}

const MainLayout = ({ user, onUserUpdate }: MainLayoutProps) => {
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState(user?.language || "es");
  const [interests, setInterests] = useState(user?.interests?.join(", ") || "");
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  //Metodos
  /**
   * Actualiza la configuración del perfil del usuario
   * en json-server y en la sesión actual.
   */
  const handleSaveSettings = async () => {
    // Verificar que exista un usuario autenticado
    if (!user) return;

    // Mostrar indicador de carga
    setLoading(true);

    try {
      // Crear el objeto con los datos actualizados
      const updatedUser: UserProfile = {
        ...user,
        language,
        interests: interests
          .split(",")
          .map((i) => i.trim())
          .filter((i) => i !== ""),
      };

      // Actualizar el usuario en json-server
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      // Verificar que la actualización fue exitosa
      if (!response.ok) {
        throw new Error("No fue posible actualizar la información del usuario");
      }

      // Actualizar la sesión almacenada en el navegador
      localStorage.setItem("babel_duo_user", JSON.stringify(updatedUser));

      // Actualizar el estado de la aplicación
      onUserUpdate(updatedUser);

      // Cerrar el panel de configuración
      setShowSettings(false);

      // Mostrar mensaje de éxito
      setSuccessMessage("Configuración actualizada correctamente.");
    } catch (error: any) {
      setError(error.message || "Error al guardar cambios");
    } finally {
      // Ocultar indicador de carga
      setLoading(false);
    }
  };

  /**
   * Cierra la sesión del usuario autenticado
   * eliminando la sesión de localStorage.
   */
  const handleSignOut = async () => {
    // Eliminar únicamente la sesión actual
    localStorage.removeItem("babel_duo_user");
    localStorage.removeItem("babel_duo_room_id");

    // Limpiar el estado de la aplicación
    onUserUpdate(null);

    // Limpiar mensajes
    setError("");
    setSuccessMessage("");
  };

  /**
   * Maneja la selección de una sala desde el listado.
   * Temporalmente solo muestra la sala seleccionada.
   */
  const handleSelectRoom = (room: Room) => {
    console.log("Sala seleccionada:", room);
    setSelectedRoom(room);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-16 bg-white border-r border-gray-200">Sidebar</div>

      {/* Segunda columna */}
      <div className="w-95 h-screen border-r border-gray-200  flex flex-col bg-white">
        <div className="srink-0">
          <HeaderAuth
            user={user}
            showSettings={showSettings}
            language={language}
            interests={interests}
            loading={loading}
            setShowSettings={setShowSettings}
            setLanguage={setLanguage}
            setInterests={setInterests}
            handleSaveSettings={handleSaveSettings}
            handleSignOut={handleSignOut}
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          <RoomList
            user={user}
            onSelectRoom={handleSelectRoom}
            selectedRoomId={selectedRoom?.id}
          />
        </div>
      </div>

      {/* Tercera columna */}
      <div className="flex-1 bg-[#efeae2] overflow-hidden">
        {selectedRoom ? (
          <ChatRoom
            room={selectedRoom}
            user={user}
            onUserUpdate={onUserUpdate}
            onBack={() => setSelectedRoom(null)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Selecciona una sala para comenzar.
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
