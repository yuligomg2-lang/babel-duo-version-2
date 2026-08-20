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
   * en mongo - db.
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

      // Enviar las credenciales al backend
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      // Obtener la respuesta del backend
      const data = await response.json();

      // Verificar si el login fue rechazado
      if (!response.ok) {
        throw new Error(data.message || "No fue posible iniciar sesión.");
      }

      // Usuario devuelto por el backend
      const user: UserProfile = {
        ...data.user,
        displayName: data.user.username,
      };

      console.log("Usuario recibido del backend:", data.user);

      //Guardar la sesion activa
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
   * Permite el acceso como usuario invitado creando u                                                                                                                                                                                                                                    na sesión temporal.
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

      let guestId: string | undefined;

      // --------------------------------------------------
      // CASO 1:
      // Existe un invitado creado anteriormente
      // --------------------------------------------------
      if (savedGuest) {
        // Convertimos el texto guardado en un objeto JavaScript
        const oldGuest: UserProfile = JSON.parse(savedGuest);
        guestId = oldGuest.id;
      }

      console.log("Guest ID enviado:", guestId);
      console.log("URL:", `${API_URL}/api/auth/guest`);

      //Solicitar al backend el acceso como invitado
      const response = await fetch(`${API_URL}/api/auth/guest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guestId,
        }),
      });

      const data = await response.json();

      console.log("status:", response.status);
      console.log("Respuesta:", data);
      // Verificar si el backend rechazó la petición
      if (!response.ok) {
        throw new Error(
          data.message || "No fue posible ingresar como invitado.",
        );
      }

      // Adaptar el usuario del backend al formato del frontend
      const guestUser: UserProfile = {
        ...data.user,
        displayName: data.user.username,
      };

      // Guardar sesión activa
      localStorage.setItem("babel_duo_user", JSON.stringify(guestUser));

      // Guardar la identidad del invitado
      // para poder reutilizarlo durante las 24 horas
      localStorage.setItem("babel_duo_guest", JSON.stringify(guestUser));

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
