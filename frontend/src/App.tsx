import "./App.css";
import { useState } from "react";
import type { UserProfile } from "./types";
import MainLayout from "./components/Layout/MainLayout";
import Login from "./pages/Login";
import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

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

  return (
    <Routes>
      {/* Autenticación */}
      <Route
        path="/login"
        element={<Login user={user} onUserUpdate={setUser} />}
      />

      <Route path="/register" element={<Register />} />

      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Aplicación principal */}
      <Route
        path="/chat"
        element={
          user ? (
            <MainLayout user={user} onUserUpdate={setUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Ruta por defecto */}
      <Route
        path="*"
        element={<Navigate to={user ? "/chat" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
