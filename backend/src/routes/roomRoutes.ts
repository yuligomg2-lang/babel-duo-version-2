import { Router } from "express";
import {
  createRoom,
  getRooms,
  joinRoom,
} from "../controllers/roomController.js";

const router = Router();

router.post("/create", createRoom);
router.get("/list", getRooms);
router.post("/join", joinRoom);

export default router;
