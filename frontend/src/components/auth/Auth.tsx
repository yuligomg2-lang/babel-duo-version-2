import { API_URL } from "../../services/api";
import React, { useState } from "react";
import logo from "../../assets/img/logo.png";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { useAuthForm } from "../../hooks/useAuthForm";
import type { UserProfile } from "../../types";
import { AnimatePresence } from "motion/react";
import MainLayout from "../Layout/MainLayout";
import { GUEST_SESSION_DURATION } from "../../helpers/constants";

/**
 * Define las propiedades que el componente Auth
 * recibe desde App.tsx para administrar la sesión
 * del usuario autenticado.
 */
interface AuthProps {
  user: UserProfile | null;
  onUserUpdate: (user: UserProfile | null) => void;
}

//Componente encargado de mostrar el logo oficial de la aplicación Babel Duo
export const BabelDuoLogo: React.FC<{ className?: string }> = ({
  className = "w-44 h-32",
}) => {
  return <img src={logo} alt="Babel Duo" className={className} />;
};

//Componente principal del módulo de autenticación.
export const Auth: React.FC<AuthProps> = ({ user, onUserUpdate }) => {
  /**
   * Hook personalizado encargado de administrar los
   * estados compartidos por los formularios de autenticación.
   */
  const {
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    authMode,
    setAuthMode,
    email,
    setEmail,
    password,
    setPassword,
    displayName,
    setDisplayName,
  } = useAuthForm();

  /**
   * Gestiona el inicio de sesión mediante una cuenta de Google.
   * Actualmente esta función se encuentra pendiente de implementación,
   */
  const handleGoogleSignIn = async () => {
    setError("El inicio de sesión con Google estará disponible próximamente.");
  };

  /**
   * Permite el acceso como usuario invitado creando una sesión temporal.
   */
  const handleGuestSignIn = async () => {
    // Activar indicador de carga mientras se realiza el proceso
    setLoading(true);

    // Limpiar mensajes anteriores
    setError(null);
    setSuccessMessage(null);

    try {
      // Buscar si ya existe un usuario invitado guardado
      // Esta clave NO se elimina al cerrar sesión,
      // porque contiene la identidad temporal del invitado
      const savedGuest = localStorage.getItem("babel_duo_guest");

      let guestUser: UserProfile | null = null;

      // --------------------------------------------------
      // CASO 1:
      // Existe un invitado creado anteriormente
      // --------------------------------------------------
      if (savedGuest) {
        // Convertimos el texto guardado en un objeto JavaScript
        const oldGuest: UserProfile = JSON.parse(savedGuest);

        // Consultamos si ese invitado todavía existe en la base de datos
        const response = await fetch(`${API_URL}/users/${oldGuest.id}`);

        if (response.ok) {
          // Recuperamos la información actual desde json-server
          const databaseGuest: UserProfile = await response.json();

          // Convertimos la fecha de expiración a milisegundos
          const expirationTime = new Date(databaseGuest.expiresAt!).getTime();

          // Verificamos si las 24 horas todavía no han pasado
          if (expirationTime > Date.now()) {
            // El invitado sigue siendo válido,
            // entonces reutilizamos el mismo usuario
            guestUser = databaseGuest;
          } else {
            // El invitado ya expiró,
            // eliminamos ese registro de la base de datos
            await fetch(`${API_URL}/users/${databaseGuest.id}`, {
              method: "DELETE",
            });

            // Eliminamos también la referencia local
            localStorage.removeItem("babel_duo_guest");
          }
        } else {
          // Si el usuario no existe en la base de datos,
          // limpiamos la referencia local
          localStorage.removeItem("babel_duo_guest");
        }
      }

      // --------------------------------------------------
      // CASO 2:
      // No existe invitado o el anterior expiró
      // Creamos uno nuevo
      // --------------------------------------------------
      if (!guestUser) {
        // Momento actual para calcular la expiración
        const now = Date.now();

        // Crear nuevo usuario invitado
        guestUser = {
          id: crypto.randomUUID(),

          displayName: `Invitado_${Math.floor(Math.random() * 10000)}`,

          language: "es",

          interests: [],

          isGuest: true,

          // Fecha de creación
          createdAt: new Date(now).toISOString(),

          // Fecha límite:
          // ahora + 24 horas
          expiresAt: new Date(now + GUEST_SESSION_DURATION).toISOString(),
        };

        // Guardar el nuevo invitado en json-server
        const response = await fetch(`${API_URL}/users`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(guestUser),
        });

        if (!response.ok) {
          throw new Error("No fue posible crear el usuario invitado");
        }
      }

      // --------------------------------------------------
      // Guardar sesión activa
      // --------------------------------------------------

      // Esta clave representa el usuario actualmente conectado
      // Se elimina cuando el usuario hace logout
      localStorage.setItem("babel_duo_user", JSON.stringify(guestUser));

      // --------------------------------------------------
      // Guardar identidad del invitado
      // --------------------------------------------------

      // Esta clave mantiene el mismo invitado durante 24 horas
      // aunque cierre sesión
      localStorage.setItem("babel_duo_guest", JSON.stringify(guestUser));

      // Actualizar el estado global de la aplicación
      onUserUpdate(guestUser);

      // Mostrar mensaje de confirmación
      setSuccessMessage("Has ingresado como invitado.");
    } catch (err: any) {
      // Capturar cualquier error durante el proceso
      setError(err.message || "Error al ingresar como invitado.");
    } finally {
      // Quitar indicador de carga
      setLoading(false);
    }
  };

  /**
   * Registra un nuevo usuario validando la información
   * y almacenándola en json-server.
   */
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !displayName) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validar formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        throw { code: "auth/invalid-email" };
      }

      // Validar longitud de la contraseña
      if (password.length < 6) {
        throw { code: "auth/weak-password" };
      }

      /// Obtener la lista de usuarios registrados desde json-server
      const response = await fetch(`${API_URL}/users`);

      // Verificar que la petición se realizó correctamente
      if (!response.ok) {
        throw new Error("No fue posible obtener los usuarios.");
      }

      // Convertir la respuesta JSON en un arreglo de usuarios
      const users: UserProfile[] = await response.json();

      // Normalizar el correo
      const normalizedEmail = email.trim().toLowerCase();

      // Verificar si el correo ya existe
      const userExists = users.some(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail,
      );

      if (userExists) {
        throw { code: "auth/email-already-in-use" };
      }

      // Crear usuario
      const newUser: UserProfile = {
        id: crypto.randomUUID(),
        displayName,
        email: normalizedEmail,
        password,
        language: "es",
        interests: [],
        isGuest: false,
        createdAt: new Date(),
      };

      console.log("Nuevo usuario:", newUser);

      // Enviar el nuevo usuario al servidor mediante una petición POST
      const saveResponse = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      // Verificar que el usuario fue registrado correctamente
      if (!saveResponse.ok) {
        throw new Error("No fue posible registrar el usuario");
      }

      // Mostrar mensaje de éxito
      setSuccessMessage(
        "Cuenta creada correctamente. Ya puedes iniciar sesión.",
      );

      // Limpiar los campos del formulario
      setDisplayName("");
      setEmail("");
      setPassword("");

      // Cambiar al formulario de inicio de sesión
      setAuthMode("login");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError("Este correo electrónico ya está registrado.");
      } else if (err.code === "auth/weak-password") {
        setError("La contraseña debe tener al menos 6 caracteres.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError(err.message || "Error al registrar la cuenta.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Inicia sesión verificando las credenciales del usuario
   * en json-server.
   */
  const handleEmailSignIn = async (e: React.FormEvent) => {
    // Evitar que el formulario recargue la página
    e.preventDefault();

    // Validar que el usuario haya ingresado el correo y la contraseña
    if (!email || !password) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    // Mostrar el indicador de carga
    setLoading(true);

    // Limpiar mensajes anteriores
    setError(null);
    setSuccessMessage(null);

    try {
      // Normalizar el correo para evitar diferencias por mayúsculas o espacios
      const normalizedEmail = email.trim().toLowerCase();

      // Validar que el formato del correo sea correcto
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        throw { code: "auth/invalid-email" };
      }

      // Obtener los usuarios registrados desde json-server
      const response = await fetch(`${API_URL}/users`);

      // Verificar que la petición se realizó correctamente
      if (!response.ok) {
        throw new Error("No fue posible obtener los usuarios.");
      }

      // Convertir la respuesta en un arreglo de usuarios
      const users: UserProfile[] = await response.json();

      // Buscar el usuario por su correo electrónico
      const user = users.find(
        (user) => user.email?.trim().toLowerCase() === normalizedEmail,
      );

      // Verificar si el usuario existe
      if (!user) {
        throw { code: "auth/user-not-found" };
      }

      // Verificar que la contraseña sea correcta
      if (user.password !== password) {
        throw { code: "auth/wrong-password" };
      }

      // Guardar la sesión del usuario autenticado
      localStorage.setItem("babel_duo_user", JSON.stringify(user));

      // Mostrar mensaje de éxito
      setSuccessMessage("Inicio de sesión exitoso.");
      setTimeout(() => {
        // Actualizar el estado de la aplicación con el usuario autenticado
        onUserUpdate(user);
      }, 2000);
    } catch (err: any) {
      // Mostrar los mensajes de error correspondientes
      if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        setError("Correo electrónico o contraseña incorrectos.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError(err.message || "Error al iniciar sesión.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gestiona la recuperación de contraseña.
   * Esta funcionalidad se implementará cuando la aplicación
   * cuente con un servicio de autenticación y envío de correos.
   */
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage(
        "Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.",
      );
      setAuthMode("login");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No existe una cuenta registrada con este correo.");
      } else if (err.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido.");
      } else {
        setError(err.message || "Error al enviar el correo de recuperación.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Si no existe un usuario autenticado, mostrar la interfaz de autenticación
  if (!user) {
    return (
      <div className="w-full flex items-center justify-center min-h-[100dvh] md:min-h-0 py-6 px-4">
        {/* Contenedor principal que divide la pantalla en dos paneles */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-row min-h-[540px] border border-gray-100/90">
          {/* Panel izquierdo: Identidad visual de Babel Duo (logo, nombre y descripción) */}
          <div className="w-1/2 bg-[#071324] bg-gradient-to-br from-[#071324] via-[#0b1e38] to-[#142e54] p-4 sm:p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden border-r border-[#152a47]/30">
            {/* Efectos decorativos de fondo */}
            <div className="absolute top-[-40px] left-[-40px] w-60 h-60 rounded-full bg-[#ff6000]/12 blur-[70px] pointer-events-none animate-pulse duration-[6s]" />
            <div className="absolute bottom-[-30px] right-[-30px] w-72 h-72 rounded-full bg-[#1e4f8a]/20 blur-[90px] pointer-events-none animate-pulse duration-[8s]" />

            {/* Logo de la aplicación */}
            <div className="relative group transition-transform duration-500 hover:scale-105">
              <div className="absolute inset-x-0 -bottom-2 bg-[#ff6000]/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-10" />
              <BabelDuoLogo className="w-20 h-15 xs:w-24 xs:h-18 sm:w-36 sm:h-28 md:w-48 md:h-36 relative z-10 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]" />
            </div>

            {/* Nombre de la aplicación */}
            <h1 className="text-xl sm:text-2.5xl md:text-4xl font-black text-white tracking-tight font-display mt-4 mb-2 sm:mt-5 drop-shadow-md">
              Babel Duo
            </h1>

            <p className="text-[#a5b9cc] text-[10px] sm:text-xs md:text-sm max-w-[280px] leading-relaxed font-semibold mt-1">
              Communicate without barriers. Real-time translation for your
              conversations.
            </p>
          </div>

          {/* Panel derecho: Formularios de autenticación */}
          <div className="w-1/2 bg-white p-4 sm:p-8 md:p-12 flex flex-col justify-center relative min-h-[460px]">
            {/* Renderiza el formulario correspondiente según el estado de autenticación */}
            <AnimatePresence mode="wait">
              {/* Formulario de inicio de sesión */}
              {authMode === "login" && (
                <LoginForm
                  email={email}
                  password={password}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  handleEmailSignIn={handleEmailSignIn}
                  handleGoogleSignIn={handleGoogleSignIn}
                  handleGuestSignIn={handleGuestSignIn}
                  setAuthMode={setAuthMode}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}

              {/* Formulario de registro */}
              {authMode === "register" && (
                <RegisterForm
                  displayName={displayName}
                  email={email}
                  password={password}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  setDisplayName={setDisplayName}
                  setEmail={setEmail}
                  setPassword={setPassword}
                  handleEmailSignUp={handleEmailSignUp}
                  handleGoogleSignIn={handleGoogleSignIn}
                  setAuthMode={setAuthMode}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}

              {/* Formulario de recuperación de contraseña */}
              {authMode === "forgot" && (
                <ForgotPasswordForm
                  email={email}
                  loading={loading}
                  error={error}
                  successMessage={successMessage}
                  setEmail={setEmail}
                  handleForgotPassword={handleForgotPassword}
                  setAuthMode={setAuthMode}
                  setError={setError}
                  setSuccessMessage={setSuccessMessage}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }

  // Si existe una sesión activa, mostrar la interfaz principal
  return <MainLayout user={user} onUserUpdate={onUserUpdate} />;
};
