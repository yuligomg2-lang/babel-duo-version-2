import type { Request, Response } from "express";
import User from "../models/User.js";

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

    // 4. Crear el usuario
    const newUser = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password,
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
