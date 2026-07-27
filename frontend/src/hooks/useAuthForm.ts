import { useState } from "react";

/**
 * Hook personalizado encargado de administrar los estados
 * compartidos por los formularios del módulo de autenticación.
 * Centraliza la información utilizada por los componentes
 * LoginForm, RegisterForm y ForgotPasswordForm.
 */

export function useAuthForm() {
  // Estados utilizados para controlar la interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Estado encargado de controlar el formulario activo
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot">(
    "login",
  );

  // Estados utilizados para almacenar la información
  // ingresada por el usuario en los formularios
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  /**
   * Retorna todos los estados y funciones necesarios
   * para ser reutilizados por los componentes del
   * módulo de autenticación.
   */
  return {
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
  };
}
