import { motion } from "motion/react";
import { Mail, AlertCircle, ArrowLeft } from "lucide-react";

/*+
 * Propiedades recibidas por el componente ForgotPasswordForm.
 * Incluye el estado del formulario, los mensajes informativos
 * y las funciones necesarias para gestionar la recuperación
 * de contraseña.
 */
interface ForgotPasswordFormProps {
  // Datos del formulario
  email: string;

  // Estados de la interfaz
  loading: boolean;
  error: string | null;
  successMessage: string | null;

  // Funciones para actualizar los datos del formulario
  setEmail: (value: string) => void;

  // Método encargado de iniciar la recuperación de contraseña
  handleForgotPassword: (e: React.FormEvent) => void;

  // Cambia entre Login, Registro y Recuperación de contraseña
  onLogin: () => void;

  // Métodos para administrar los mensajes mostrados al usuario
  setError: (value: string | null) => void;
  setSuccessMessage: (value: string | null) => void;
}

/**
 * Componente encargado de mostrar el formulario de recuperación
 * de contraseña. Permite al usuario ingresar su correo electrónico
 * para solicitar el restablecimiento de su contraseña.
 */
export default function ForgotPasswordForm({
  email,
  loading,
  error,
  successMessage,
  setEmail,
  handleForgotPassword,
  onLogin,
  setError,
  setSuccessMessage,
}: ForgotPasswordFormProps) {
  return (
    <motion.div
      key="forgot-form"
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Título y descripción del formulario */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a3d70] tracking-tight font-display mb-1 text-left">
        Recover Password
      </h2>
      <p className="text-xs text-gray-400 mb-6 font-medium text-left">
        Enter your email below to receive reset instructions.
      </p>

      {/* Formulario para solicitar la recuperación de la contraseña */}
      <form
        onSubmit={handleForgotPassword}
        className="flex flex-col w-full text-left"
      >
        {/* Mensaje de error mostrado durante el proceso de recuperación */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Campo para ingresar el correo electrónico del usuario */}
        <div className="relative mb-5">
          <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200/90 rounded-full text-xs sm:text-sm outline-none focus:border-[#0a3d70] focus:ring-1 focus:ring-[#0a3d70]/30 transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm hover:border-gray-300"
            required
            disabled={loading}
          />
        </div>

        {/* Botón para enviar la solicitud de recuperación de contraseña */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0a3d70] text-white font-bold rounded-full text-xs sm:text-sm hover:bg-[#082a4d] active:scale-[0.98] transition-all shadow-md shadow-[#0a3d70]/15 flex items-center justify-center gap-2"
        >
          {loading ? "Sending..." : "Send Recovery Details"}
        </button>

        <div className="text-center mt-6">
          {/* Botón para regresar al formulario de inicio de sesión */}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              onLogin();
            }}
            className="text-xs font-bold text-[#ff6000] hover:text-[#e05300] hover:underline transition-all flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </button>
        </div>
      </form>
    </motion.div>
  );
}
