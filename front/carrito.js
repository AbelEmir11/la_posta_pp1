document.addEventListener("DOMContentLoaded", function () {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const listaCarrito = document.getElementById("lista-carrito");
    const btnVaciarCarrito = document.getElementById("vaciar-carrito");

    function actualizarCarrito() {
        listaCarrito.innerHTML = "";
       

        if (carrito.length === 0) {
            listaCarrito.innerHTML = "<p>El carrito está vacío.</p>";
        } else {
            carrito.forEach((producto, index) => {
                const item = document.createElement("div");
                item.classList.add("carrito-item");
                item.innerHTML = `
                    <p><strong>${producto.nombre}</strong> - $${producto.precio}</p>
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
            actualizarCarrito();
        }
    });

    btnVaciarCarrito.addEventListener("click", function () {
        localStorage.removeItem("carrito");
        carrito.length = 0; // Asegurar que la variable local también se vacía
        actualizarCarrito();


    });

    actualizarCarrito();
});
// Función para calcular el total del carrito
function calcularTotal() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    let total = carrito.reduce((sum, producto) => sum + Number(producto.precio), 0); 
    
    // Mostrar el total en la página
    document.getElementById("total-carrito").textContent = `Total: $${total.toFixed(2)}`;
}

// Llamar a la función cuando se cargue el carrito
document.addEventListener("DOMContentLoaded", actualizarCarrito);

