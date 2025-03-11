const express = require("express");
const Contacto = require("../models/contactModels");

const router = express.Router();
router.use(express.json());
// Ruta para guardar el mensaje
router.post("/contacto", async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);

        const { nombre, email, mensaje } = req.body;

        if (!nombre ||!email ||!mensaje) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }
        const nuevoMensaje = await Contacto.create({ nombre, email, mensaje });
        res.status(201).json({ mensaje: "Mensaje guardado correctamente", nuevoMensaje });
    } catch (error) {
        console.error("Error al guardar mensaje:", error);
        res.status(500).json({ error: "Error al guardar el mensaje" });
    }
});

module.exports = router;
