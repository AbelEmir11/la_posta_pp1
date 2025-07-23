console.log("Script cargado")
console.log("carrito.js cargado correctamente");

const listaCarrito = document.getElementById("lista-carrito");
function actualizarCarrito() {
        listaCarrito.innerHTML = "";
        const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p>El carrito está vacío.</p>";
    } else {
        carrito.forEach((producto, index) => {
            const item = document.createElement("div");
            item.classList.add("carrito-item");
            item.innerHTML = `
                <img src="${producto.imagen}" width="50">
                <p><strong>${producto.nombre}</strong></p>
                <p>Precio: ${producto.precio.toFixed(2)}</p>
                <p>Stock disponible: ${producto.stock}</p>
                <p>Cantidad en carrito: ${producto.cantidad}</p>
                <input type="number" class="cantidad-producto" data-index="${index}" value="${producto.cantidad}" min="1" max="${producto.stock}">
                <button class="eliminar-producto" data-index="${index}">Eliminar</button>
            `;
            listaCarrito.appendChild(item);
        });
    }
    calcularTotal();
}
document.addEventListener("DOMContentLoaded", function () {
    actualizarCarrito(); 
});

   
const btnVaciarCarrito = document.getElementById("vaciar-carrito");


   

    listaCarrito.addEventListener("click", function (event) {
        if (event.target.classList.contains("eliminar-producto")) {
            const index = event.target.getAttribute("data-index");
            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
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
            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            let producto = carrito[index];
    
            if (nuevaCantidad > producto.stock) {
                alert(`La cantidad no puede superar el stock disponible (${producto.stock}) para ${producto.nombre}.`);
                event.target.value = producto.stock;
                producto.cantidad = producto.stock;

            } else if (nuevaCantidad < 1) {
                alert("La cantidad mínima es 1.");
                event.target.value = 1;
                producto.cantidad = 1;
            } else {
                producto.cantidad = nuevaCantidad;
            }
            
            localStorage.setItem("carrito", JSON.stringify(carrito));
            console.log("Carrito después de cambiar la cantidad:", carrito);
            actualizarCarrito();
        }
    });
    

    btnVaciarCarrito.addEventListener("click", function () {
        localStorage.removeItem("carrito");
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

window.actualizarCarrito = actualizarCarrito; 

