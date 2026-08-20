import type { Request, Response } from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

// lógica del registro
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 1. Verificar que lleguen los campos necesarios
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Todos los campos son obligatorios.",
      });
    }

    // 2. Normalizar el correo
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Verificar si el correo ya está registrado
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Este correo electrónico ya está registrado.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Crear el usuario
    const newUser = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      language: "es",
      interests: [],
      isGuest: false,
    });

    // 5. Responder al frontend
    return res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        language: newUser.language,
        interests: newUser.interests,
        isGuest: newUser.isGuest,
      },
    });
  } catch (error) {
    console.error("Error al registrar usuario:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

// lógica del incio de sesion
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Verificar que lleguen los datos necesarios
    if (!email || !password) {
      return res.status(400).json({
        message: "El correo y la contraseña son obligatorios.",
      });
    }

    // 2. Normalizar el correo
    const normalizedEmail = email.trim().toLowerCase();

    // 3. Buscar el usuario en MongoDB
    const user = await User.findOne({
      email: normalizedEmail,
    });

    // 4. Verificar que el usuario exista
    if (!user) {
      return res.status(401).json({
        message: "Correo electrónico o contraseña incorrectos.",
      });
    }

    //5. Verificar que el usuario tenga una contraseña
    if (!user.password) {
      return res.status(401).json({
        message: "Correo electrónico o contraseña incorrectos.",
      });
    }

    // 6. Comparar la contraseña ingresada con el hash almacenado
    const passwordMatch = await bcrypt.compare(password, user.password);

    // 7. Verificar que la contraseña sea correcta
    if (!passwordMatch) {
      return res.status(401).json({
        message: "Correo electrónico o contraseña incorrectos.",
      });
    }

    // 7. Usuario autenticado correctamente
    return res.status(200).json({
      message: "Inicio de sesion exitoso",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        language: user.language,
        interests: user.interests,
        isGuest: user.isGuest,
      },
    });
  } catch (error) {
    console.error("Error al iniciar sesion:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

// logica de inicio de sesion como invitado
/**
 * Permite el acceso como usuario invitado.
 *
 * Si el invitado ya existe y su sesión de 24 horas
 * todavía está vigente, se reutiliza.
 *
 * Si no existe o ya expiró, se crea un nuevo usuario invitado.
 */

export const guestLogin = async (req: Request, res: Response) => {
  try {
    const { guestId } = req.body;

    let guestUser = null;

    // 1. Si el frontend tiene un ID de invitado,
    // buscamos ese usuario en MongoDB.

    if (guestId) {
      guestUser = await User.findOne({
        _id: guestId,
        isGuest: true,
      });

      // 2. Si encontramos el invitado,
      // comprobamos si todavía está vigente.
      if (guestUser) {
        const expirationTime = guestUser.expiresAt?.getTime();

        if (!expirationTime || expirationTime <= Date.now()) {
          //El invitado ya expiró
          await User.deleteOne({
            _id: guestUser.id,
          });

          guestUser = null;
        }
      }
    }

    // 3. Si no existe un invitado válido,
    // creamos uno nuevo.
    if (!guestUser) {
      const now = new Date();

      guestUser = await User.create({
        username: `Invitado_${Math.floor(Math.random() * 100000)}`,
        language: "es",
        interests: [],
        isGuest: true,
        createdAt: now,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      });
    }

    // 4. Enviar la información necesaria al frontend.
    return res.status(200).json({
      user: {
        id: guestUser._id,
        username: guestUser.username,
        language: guestUser.language,
        interests: guestUser.interests,
        isGuest: guestUser.isGuest,
        createdAt: guestUser.createdAt,
        expiresAt: guestUser.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error al ingresar como invitado:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};
