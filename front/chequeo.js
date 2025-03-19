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
            Swal.fire({
                title: "uupss",
                text: "Por favor, completa todos los campos y agrega productos al carrito.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });


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
                Swal.fire({
                    title: "¡Pedido realizado con éxito!",
                    text: "En breve nos comunicaremos con usted para coordinar la entrega.",
                    icon: "success",
                    confirmButtonText: "Aceptar"
                  
                });
                
                localStorage.removeItem("carrito"); // Vaciar el carrito después de la compra
           
            } else {
                alert("Hubo un problema al procesar el pedido: " + resultado.error);
            }
        } catch (error) {
            console.error("Error al enviar el pedido:", error);
            Swal.fire({
                title: "¡Error!",
                text: "Ocurrió un error al enviar el pedido. Por favor, intenta nuevamente.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const metodoPagoSelect = document.getElementById('metodo_pago');
    const contenedorPago = document.getElementById('contenedor-pago');

    metodoPagoSelect.addEventListener('change', () => {
        const metodoSeleccionado = metodoPagoSelect.value;
        contenedorPago.innerHTML = ''; // Limpiar contenido previo
        contenedorPago.style.display = 'none'; // Ocultar contenedor por defecto

        if (metodoSeleccionado === 'tarjeta' || metodoSeleccionado === 'debito') {
            contenedorPago.style.display = 'block';
            contenedorPago.innerHTML = `
                <h3>Detalles de la Tarjeta</h3>
                <div class="mb-3">
                    <label for="numero_tarjeta" class="form-label">Número de la Tarjeta</label>
                    <input type="text" class="form-control" id="numero_tarjeta" placeholder="XXXX XXXX XXXX XXXX" required>
                </div>
                <div class="mb-3">
                    <label for="nombre_tarjeta" class="form-label">titular de la tarjeta</label>
                    <input type="text" class="form-control" id="nombre_tarjeta" placeholder="Como aparece en la tarjeta" required>
                </div>
                <div class="mb-3">
                    <label for="fecha_vencimiento" class="form-label">Fecha de Vencimiento</label>
                    <input type="text" class="form-control" id="fecha_vencimiento" placeholder="MM/AA" required>
                </div>
                <div class="mb-3">
                    <label for="codigo_cvv" class="form-label">Código CVV</label>
                    <input type="text" class="form-control" id="codigo_cvv" placeholder="XXX" required>
                </div>
                
            `;
        } else if (metodoSeleccionado === 'efectivo') {
            contenedorPago.style.display = 'block';
            contenedorPago.innerHTML = `
                <h3>Pago en Efectivo</h3>
                <p>Usted ha seleccionado pagar en efectivo. Por favor, prepare el monto exacto para el momento de la entrega.</p>
               
            `;
        }
    });
});
