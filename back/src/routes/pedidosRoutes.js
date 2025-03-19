const express = require("express");
const router = express.Router();
//const { Pedido } = require("../models/pedidosModels");
const Pedido = require("../models/pedidosModels");
console.log("Pedido:", Pedido); // Ver si es undefined


router.post("/crear", async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);

        const { nombre, direccion, metodo_pago, email, telefono, productos } = req.body;
        console.log("Datos recibidos:", req.body);

        const nuevoPedido = await Pedido.create({
            nombre,
            direccion,
            metodo_pago,
            email,
            telefono,
            productos: JSON.stringify(productos) // Guardar los productos en formato JSON
        });

        res.status(201).json({ mensaje: "Pedido registrado correctamente", pedido: nuevoPedido });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al registrar el pedido" });
    }
});

module.exports = router;
