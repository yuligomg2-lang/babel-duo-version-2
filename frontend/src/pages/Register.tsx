import { useNavigate } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";
import AuthLayout from "../components/Layout/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";
import { API_URL } from "../services/api";
import type { UserProfile } from "../types";

function Register() {
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
    displayName,
    setDisplayName,
  } = useAuthForm();

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
        createdAt: new Date().toISOString(),
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
      setTimeout(() => {
        navigate("/login");
      }, 1500);
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
   * Gestiona el inicio de sesión mediante una cuenta de Google.
   * Actualmente esta función se encuentra pendiente de implementación,
   */
  const handleGoogleSignIn = () => {
    setError("El inicio de sesión con Google estará disponible próximamente.");
  };

  return (
    <AuthLayout>
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
        onLogin={() => navigate("/login")}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    </AuthLayout>
  );
}

export default Register;
