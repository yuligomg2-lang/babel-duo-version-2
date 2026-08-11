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
