import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// Carga las variables del archivo .env dentro de process.env.
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("🚀 Backend de Babel Duo funcionando");
});

//Obtiene el puerto definido en el archivo .env.
//// o utiliza el puerto 3000 por defecto.
const PORT = process.env.PORT || 3000;

//Inicio del servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});
