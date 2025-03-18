const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Habilitar CORS para evitar problemas con solicitudes
app.use(cors());

// Servir archivos estáticos desde la carpeta "visualizacion"
app.use(express.static(path.join(__dirname, "visualizacion")));

// Ruta para la página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "visualizacion", "index.html"));
});

// Ruta para obtener los datos de conciertos desde un JSON
app.get("/datos/:filename", (req, res) => {
    const filePath = path.join(__dirname, "visualizacion", "datos", req.params.filename);
    res.sendFile(filePath);
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
