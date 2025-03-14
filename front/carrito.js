document.addEventListener("DOMContentLoaded", function () {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    console.log("Contenido del carrito al cargar:", carrito); // Agregar este log para depuración
    const listaCarrito = document.getElementById("lista-carrito");
    const btnVaciarCarrito = document.getElementById("vaciar-carrito");


    function actualizarCarrito() {
        listaCarrito.innerHTML = "";

        if (carrito.length === 0) {
            listaCarrito.innerHTML = "<p>El carrito está vacío.</p>";
        } else {
            carrito.forEach((producto, index) => {
                // Asegurarse de que cada producto tenga una cantidad definida
                if (!producto.cantidad) {
                    producto.cantidad = 1;
                }
                console.log(`Producto ${index}: ${producto.nombre}, Cantidad: ${producto.cantidad}`); // Agregar este log para depuración
                const item = document.createElement("div");
                item.classList.add("carrito-item");
                item.innerHTML = `
                    <img src="${producto.imagen}" width="50">
                    <p><strong>${producto.nombre}</strong></p>
                    <p>Precio: ${producto.precio.toFixed(2)}</p>
                    <p>Stock disponible: ${producto.stock}</p>
                    <p>Cantidad en carrito: ${producto.cantidad}</p>
                    <input type="number" class="cantidad-producto" data-index="${index}" value="${producto.cantidad}" min="1">
                    <button class="eliminar-producto" data-index="${index}">Eliminar</button>
                `;
                listaCarrito.appendChild(item);
            });
        }
        calcularTotal();
    }

    listaCarrito.addEventListener("click", function (event) {
        if (event.target.classList.contains("eliminar-producto")) {
            const index = event.target.getAttribute("data-index");
            carrito.splice(index, 1);
            localStorage.setItem("carrito", JSON.stringify(carrito));
            console.log("Carrito después de eliminar un producto:", carrito); // Agregar este log para depuración
            actualizarCarrito();
        }
    });

    listaCarrito.addEventListener("change", function (event) {
        if (event.target.classList.contains("cantidad-producto")) {
            const index = event.target.getAttribute("data-index");
            const nuevaCantidad = parseInt(event.target.value);
            carrito[index].cantidad = nuevaCantidad;
            localStorage.setItem("carrito", JSON.stringify(carrito));
            console.log("Carrito después de cambiar la cantidad:", carrito); // Agregar este log para depuración
            actualizarCarrito();
        }
    });

    btnVaciarCarrito.addEventListener("click", function () {
        localStorage.removeItem("carrito");
        carrito.length = 0; // Asegurar que la variable local también se vacía
        console.log("Carrito después de vaciar:", carrito); // Agregar este log para depuración
        actualizarCarrito();
    });

    actualizarCarrito();
});

function calcularTotal() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let total = carrito.reduce((sum, producto) => {
        console.log(`Calculando total - Producto: ${producto.nombre}, Precio: ${producto.precio}, Cantidad: ${producto.cantidad}`); // Agregar este log para depuración
        return sum + (producto.precio * producto.cantidad);
    }, 0); 
    
    // Mostrar el total en la página
    document.getElementById("total-carrito").textContent = `Total: $${total.toFixed(2)}`;
}

