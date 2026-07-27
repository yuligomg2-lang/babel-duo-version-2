import "./App.css";
import { useState } from "react";
import { Auth } from "./components/auth/Auth";
import type { UserProfile } from "./types";
import MainLayout from "./components/Layout/MainLayout";

function App() {
  // Inicializar el usuario desde localStorage (persistencia de sesión)
  const [user, setUser] = useState<UserProfile | null>(() => {
    // Obtener el usuario que tiene la sesión iniciada
    const savedUser = localStorage.getItem("babel_duo_user");

    // Si existe, convertirlo nuevamente a objeto
    if (savedUser) {
      return JSON.parse(savedUser);
    }

    // Si no existe, iniciar sin usuario autenticado
    return null;
  });

  if (!user) {
    return <Auth user={user} onUserUpdate={setUser} />;
  }

  return <MainLayout user={user} onUserUpdate={setUser} />;
}

export default App;
