import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../types";
import { useAuthForm } from "../hooks/useAuthForm";
import LoginForm from "../components/auth/LoginForm";
import { API_URL } from "../services/api";
import { GUEST_SESSION_DURATION } from "../helpers/constants";
import AuthLayout from "../components/Layout/AuthLayout";

interface LoginProps {
  user: UserProfile | null;
  onUserUpdate: (user: UserProfile | null) => void;
}

const Login = ({ user, onUserUpdate }: LoginProps) => {
  const navigate = useNavigate();

  const {
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    email,
    setEmail,
    password,
    setPassword,
  } = useAuthForm();

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
        navigate("/chat");
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

      // Ir a la página principal de la aplicación
      navigate("/chat");

      // Mostrar mensaje de confirmación
      setSuccessMessage("Has ingresado como invitado.");
      setTimeout(() => {
        onUserUpdate(guestUser);
        navigate("/chat");
      }, 2000);
    } catch (err: any) {
      // Capturar cualquier error durante el proceso
      setError(err.message || "Error al ingresar como invitado.");
    } finally {
      // Quitar indicador de carga
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
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
        onRegister={() => navigate("/register")}
        onForgotPassword={() => navigate("/forgot-password")}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    </AuthLayout>
  );
};

export default Login;
