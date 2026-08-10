import { useNavigate } from "react-router-dom";
import { useAuthForm } from "../hooks/useAuthForm";
import AuthLayout from "../components/Layout/AuthLayout";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

function ForgotPassword() {
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
  } = useAuthForm();

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
      // Aquí irá posteriormente la lógica real
      // para enviar el correo de recuperación.

      setSuccessMessage(
        "Se ha enviado un correo para restablecer tu contraseña.",
      );

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <ForgotPasswordForm
        email={email}
        loading={loading}
        error={error}
        successMessage={successMessage}
        setEmail={setEmail}
        handleForgotPassword={handleForgotPassword}
        onLogin={() => navigate("/login")}
        setError={setError}
        setSuccessMessage={setSuccessMessage}
      />
    </AuthLayout>
  );
}

export default ForgotPassword;
