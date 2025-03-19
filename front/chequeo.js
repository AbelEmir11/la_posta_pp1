document.addEventListener("DOMContentLoaded", function () {
    const formularioCompra = document.getElementById("formulario-compra");
    console.log("Formulario obtenido:", formularioCompra); 

    if (!formularioCompra) {
        console.error("⚠️ Error: No se encontró el formulario en el DOM. Verifica el ID en el HTML.");
        return;
    }
    
    formularioCompra.addEventListener("submit", async function (event) {
        event.preventDefault(); // Evita que la página se recargue al enviar el formulario

        // Capturar los valores del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const direccion = document.getElementById("direccion").value.trim();
        const metodo_pago = document.getElementById("metodo_pago").value;
        const email = document.getElementById("email").value.trim();
        const telefono = document.getElementById("telefono").value.trim();

        // Obtener los productos del carrito desde localStorage
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        // Validación simple
        if (!nombre || !direccion || !email || !telefono || carrito.length === 0) {
            alert("Por favor, complete todos los campos y asegúrese de tener productos en el carrito.");
            return;
        }

        // Crear objeto con la información del pedido
        const pedido = {
            nombre,
            direccion,
            metodo_pago,
            email,
            telefono,
            productos: carrito
        };

        try {
            // Enviar los datos al backend usando fetch
            const respuesta = await fetch("http://localhost:3001/api/pedidos/crear", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pedido)
            });

            const resultado = await respuesta.json();
            if (respuesta.ok) {
                alert("¡Pedido realizado con éxito!");
                localStorage.removeItem("carrito"); // Vaciar el carrito después de la compra
                window.location.href = "confirmacion.html"; // Redirigir a página de confirmación
            } else {
                alert("Hubo un problema al procesar el pedido: " + resultado.error);
            }
        } catch (error) {
            console.error("Error al enviar el pedido:", error);
            alert("Error al conectar con el servidor. Intente nuevamente.");
        }
    });
});
