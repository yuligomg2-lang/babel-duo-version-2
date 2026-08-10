import { AnimatePresence } from "motion/react";
import BabelDuoLogo from "../../assets/img/logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
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
          <img
            src={BabelDuoLogo}
            alt="Babel Duo"
            className="w-36 h-auto z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
          />

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
          <AnimatePresence mode="wait">{children}</AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
