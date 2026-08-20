import type { Request, Response } from "express";
import mongoose from "mongoose";
import Room from "../models/Room.js";
import User from "../models/User.js";

const generateInviteCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

//Método para crear salas
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name, description, theme, languages, createdBy, isPrivate } =
      req.body;

    // 1. Validar los datos obligatorios
    if (!name || !createdBy) {
      return res.status(400).json({
        message: "El nombre de la sala y el usuario creado son obligatorios.",
      });
    }

    //2. Verificar que el ID del usuario tenga un formato válido
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({
        message: "El ID del usuario no es válido.",
      });
    }

    //3. Buscar al usuario que esta creando a sala
    const user = await User.findById(createdBy);

    if (!user) {
      return res.status(404).json({
        message: "El usuario creador de la sala no existe",
      });
    }

    //4. Generar codigo de invitacion
    let inviteCode = generateInviteCode();

    //5. Comprobar que el código no este utilizado
    let existingRoom = await Room.findOne({ inviteCode });

    while (existingRoom) {
      inviteCode = generateInviteCode();
      existingRoom = await Room.findOne({ inviteCode });
    }

    // 6. Crear la sala
    const newRoom = await Room.create({
      name: name.trim(),
      description: description?.trim() || "",
      theme: theme || "General",
      languages: languages || ["es"],
      createdBy: user._id,
      createdAt: new Date(),
      isPrivate: Boolean(isPrivate),
      inviteCode,
      members: [user._id],
    });

    // 7. Responder al frontend
    return res.status(201).json({
      message: "Sala creada correctamente.",
      room: {
        id: newRoom._id,
        name: newRoom.name,
        description: newRoom.description,
        theme: newRoom.theme,
        languages: newRoom.languages,
        createdBy: newRoom.createdBy,
        createdAt: newRoom.createdAt,
        isPrivate: newRoom.isPrivate,
        inviteCode: newRoom.inviteCode,
        members: newRoom.members,
        expiresAt: newRoom.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error al crear la sala:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

//Método para obtener salas
export const getRooms = async (req: Request, res: Response) => {
  try {
    // Obtener todas las salas de MongoDB
    const rooms = await Room.find();

    // Adaptar la estructura de MongoDB a la estructura que utiliza el frontend
    const formattedRooms = rooms.map((room) => ({
      id: room._id.toString(),
      name: room.name,
      description: room.description,
      theme: room.theme,
      languages: room.languages,
      createdBy: room.createdBy.toString(),
      createdAt: room.createdAt,
      isPrivate: room.isPrivate,
      inviteCode: room.inviteCode,
      members: room.members.map((member) => member.toString()),
      expiresAt: room.expiresAt,
    }));

    // Devolver las salas
    return res.status(200).json(formattedRooms);
  } catch (error) {
    console.error("Error al obtener las salas:", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};

//Metodo para Unirse a una sala
/**
 * Permite a un usuario unirse a una sala mediante su código de invitación.
 */
export const joinRoom = async (req: Request, res: Response) => {
  try {
    // Obtener los datos enviados por el frontend
    const { inviteCode, userId } = req.body;

    // Validar que se hayan enviado los datos obligatorios
    if (!inviteCode || !userId) {
      return res.status(400).json({
        message: "El código de invitación y el usuario son obligatorios.",
      });
    }

    // Verificar que el ID del usuario tenga un formato válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "El ID del usuario no es válido.",
      });
    }

    // Buscar al usuario
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "El usuario no existe.",
      });
    }

    // Buscar la sala utilizando el código de invitación
    const room = await Room.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
    });

    // Verificar que la sala exista
    if (!room) {
      return res.status(400).json({
        message: "El código de invitacin no es válido.",
      });
    }

    // Convertir el ID del usuario a string para realizar la comparación
    const userIdString = user._id.toString();

    // Verificar si el usuario ya pertenece a la sala
    const alreadyMember = room.members.some(
      (member) => member.toString() === userIdString,
    );

    if (alreadyMember) {
      return res.status(400).json({
        message: "El usuario ya pertenece a esta sala",
      });
    }

    // Agregar el usuario como miembro de la sala
    room.members.push(user._id);

    // Guardar los cambios en MongoDB
    await room.save();

    // Devolver la sala actualizada
    return res.status(200).json({
      message: "Te has unido a la sala correctamente.",
      room: {
        id: room._id.toString(),
        name: room.name,
        description: room.description,
        theme: room.theme,
        languages: room.languages,
        createdBy: room.createdBy,
        createdAt: room.createdAt,
        isPrivate: room.isPrivate,
        inviteCode: room.inviteCode,
        members: room.members.map((member) => member.toString()),
        expiresAt: room.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error al usnirse a la sala", error);

    return res.status(500).json({
      message: "Error interno del servidor.",
    });
  }
};
