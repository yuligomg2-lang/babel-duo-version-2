import { motion } from "motion/react";
import { Mail, Lock, AlertCircle, User as UserIcon } from "lucide-react";
import googleLogo from "../../assets/img/logogoogle.png";

/**
 * Propiedades recibidas por el componente RegisterForm.
 * Incluye el estado del formulario, funciones para actualizar los campos
 * y manejadores de los diferentes eventos de autenticación.
 */

interface RegisterFormProps {
  // Datos del formulario
  displayName: string;
  email: string;
  password: string;
  // Estados de la interfaz
  loading: boolean;
  error: string | null;
  successMessage: string | null;

  // Funciones para actualizar los campos del formulario
  setDisplayName: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;

  // Métodos de autenticación disponibles
  handleEmailSignUp: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;

  onLogin: () => void;

  // Métodos para administrar los mensajes mostrados al usuario
  setError: (value: string | null) => void;
  setSuccessMessage: (value: string | null) => void;
}

/**
 * Componente encargado de mostrar el formulario de registro.
 * Permite crear una nueva cuenta mediante correo electrónico y contraseña,
 * así como acceder a la futura autenticación con Google.
 */
export default function RegisterForm({
  // Desestructuración de las propiedades recibidas
  displayName,
  email,
  password,
  loading,
  error,
  successMessage,
  setDisplayName,
  setEmail,
  setPassword,
  handleEmailSignUp,
  handleGoogleSignIn,
  onLogin,
  setError,
  setSuccessMessage,
}: RegisterFormProps) {
  return (
    <motion.div
      key="register-form"
      initial={{ opacity: 0, x: 15 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -15 }}
      transition={{ duration: 0.2 }}
      className="w-full"
    >
      {/* Título y descripción del formulario */}
      <h2 className="text-xl sm:text-2xl font-extrabold text-[#0a3d70] tracking-tight font-display mb-1 text-left">
        Create Account
      </h2>
      <p className="text-xs text-gray-400 mb-6 font-medium text-left">
        Join Babel Duo to bridge languages seamlessly.
      </p>

      {/* Formulario de registro */}
      <form
        onSubmit={handleEmailSignUp}
        className="flex flex-col w-full text-left"
      >
        {/* Mensaje de error mostrado durante el proceso de registro */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl flex items-center gap-2 font-semibold">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Campo para ingresar el nombre del usuario */}
        <div className="relative mb-3.5">
          <UserIcon className="w-4.5 h-4.5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name or username"
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200/90 rounded-full text-xs sm:text-sm outline-none focus:border-[#0a3d70] focus:ring-1 focus:ring-[#0a3d70]/30 transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm hover:border-gray-300"
            required
            disabled={loading}
          />
        </div>

        {/* Campo para ingresar el correo electrónico */}
        <div className="relative mb-3.5">
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

        {/* Campo para ingresar la contraseña */}
        <div className="relative mb-5">
          <Lock className="w-4.5 h-4.5 text-gray-400 absolute left-4.5 top-1/2 -translate-y-1/2 stroke-[1.5]" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-12 pr-5 py-3 bg-white border border-gray-200/90 rounded-full text-xs sm:text-sm outline-none focus:border-[#0a3d70] focus:ring-1 focus:ring-[#0a3d70]/30 transition-all text-gray-800 font-medium placeholder-gray-400 shadow-sm hover:border-gray-300"
            required
            disabled={loading}
          />
        </div>

        {/* Botón para registrar un nuevo usuario */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#0a3d70] text-white font-bold rounded-full text-xs sm:text-sm hover:bg-[#082a4d] active:scale-[0.98] transition-all shadow-md shadow-[#0a3d70]/15 flex items-center justify-center gap-2"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        {/* Separador entre el registro tradicional y el inicio con Google */}
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

        {/* Enlace para cambiar al formulario de inicio de sesión */}
        <div className="text-center mt-5">
          <p className="text-xs text-gray-400 font-semibold animate-fade-in">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onLogin();
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-[#ff6000] font-bold hover:text-[#e05300] hover:underline transition-all cursor-pointer"
              disabled={loading}
            >
              Login
            </button>
          </p>
        </div>
      </form>
    </motion.div>
  );
}
