import { motion } from "motion/react";
import { Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import googleLogo from "../../assets/img/logogoogle.png";

/**
 * Propiedades que recibe el componente LoginForm
 * desde Auth.tsx para controlar el formulario
 * y ejecutar las diferentes opciones de autenticación.
 */
interface LoginFormProps {
  // Datos del formulario
  email: string;
  password: string;
  // Estados de la interfaz
  loading: boolean;
  error: string | null;
  successMessage: string | null;

  // Funciones para actualizar los campos del formulario
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;

  // Métodos de autenticación
  handleEmailSignIn: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
  handleGuestSignIn: () => void;

  onRegister: () => void;
  onForgotPassword: () => void;

  // Métodos para administrar los mensajes mostrados al usuario
  setError: (value: string | null) => void;
  setSuccessMessage: (value: string | null) => void;
}

/**
 * Componente encargado de mostrar el formulario de inicio de sesión.
 * Permite autenticarse mediante correo y contraseña, acceder
 * a las opciones de Google, invitado y recuperación de contraseña.
 */
export default function LoginForm({
  // Desestructuración de las propiedades recibidas
  email,
  password,
  loading,
  error,
  successMessage,
  setEmail,
  setPassword,
  handleEmailSignIn,
  handleGoogleSignIn,
  handleGuestSignIn,
  onRegister,
  onForgotPassword,
  setError,
  setSuccessMessage,
}: LoginFormProps) {
  return (
    /**
     * Contenedor animado del formulario mediante Motion.
     * Controla la animación de entrada y salida del Login.
     */
    <motion.div
      key="login-form"
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Título y descripción del formulario */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a3d70] tracking-tight font-display mb-1 text-left">
        Welcome Back
      </h2>
      <p className="text-xs text-gray-400 mb-6 font-medium text-left">
        Sign in to your account below.
      </p>

      {/* Formulario principal de inicio de sesión */}
      <form
        onSubmit={handleEmailSignIn}
        className="flex flex-col w-full text-left"
      >
        {/* Mensaje de éxito mostrado después de una acción completada */}
        {successMessage && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Mensaje de error mostrado durante la autenticación */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-semibold animate-pulse">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Campo para ingresar el correo electrónico */}
        <div className="relative mb-3.5">
          <Mail className="w-4.5 h-4.5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200/80 rounded-full text-xs sm:text-sm outline-none focus:border-[#0a3d70] focus:ring-1 focus:ring-[#0a3d70]/30 transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm hover:border-gray-300"
            required
            disabled={loading}
          />
        </div>

        {/* Campo para ingresar la contraseña */}
        <div className="relative">
          <Lock className="w-4.5 h-4.5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200/80 rounded-full text-xs sm:text-sm outline-none focus:border-[#0a3d70] focus:ring-1 focus:ring-[#0a3d70]/30 transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm hover:border-gray-300"
            required
            disabled={loading}
          />
        </div>

        {/* Enlace para cambiar al formulario de recuperación de contraseña */}
        <div className="flex justify-end mt-2.5 mb-5">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
              onForgotPassword();
            }}
            className="text-xs font-bold text-[#ff6000] hover:text-[#e05300] hover:underline cursor-pointer transition-colors"
            disabled={loading}
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0a3d70] text-white font-bold rounded-full text-xs sm:text-sm hover:bg-[#082a4d] active:scale-[0.98] transition-all shadow-md shadow-[#0a3d70]/15 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Separador entre métodos de autenticación */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <span className="relative px-3 bg-white text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Botón para iniciar sesión con Google (pendiente de implementación) */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 bg-white border border-gray-200/95 text-gray-600 rounded-full font-bold flex items-center justify-center gap-2.5 hover:bg-gray-50 active:scale-[0.98] transition-all text-xs sm:text-sm shadow-sm cursor-pointer hover:border-gray-300"
        >
          <img src={googleLogo} alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {/* Botón para continuar como usuario invitado */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleGuestSignIn}
            disabled={loading}
            className="text-xs font-semibold text-gray-500 hover:text-[#0a3d70] hover:underline cursor-pointer transition-colors"
          >
            Continue as Guest
          </button>
        </div>

        {/* Enlace para cambiar al formulario de registro */}
        <div className="text-center mt-5">
          <p className="text-xs text-gray-400 font-semibold direct-action">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setError(null);
                setSuccessMessage(null);
                onRegister();
              }}
              className="text-[#ff6000] font-bold hover:text-[#e05300] hover:underline transition-all cursor-pointer"
              disabled={loading}
            >
              Create an account
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
