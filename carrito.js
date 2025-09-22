console.log("Script cargado")
console.log("carrito.js cargado correctamente");

const listaCarrito = document.getElementById("lista-carrito");
function actualizarCarrito() {
    console.log('Actualizando carrito...');
    listaCarrito.innerHTML = "";
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    console.log('Productos en carrito:', carrito);

    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p class='text-center'>El carrito está vacío.</p>";
    } else {
        carrito.forEach((producto, index) => {
            const item = document.createElement("div");
            item.classList.add("carrito-item", "mb-3");
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${producto.imagen}" alt="${producto.nombre}" width="100" class="img-thumbnail me-3">
                    <div class="flex-grow-1">
                        <h5 class="mb-0">${producto.nombre}</h5>
                        <p class="mb-1">Precio: $${producto.precio.toFixed(2)}</p>
                        <div class="d-flex align-items-center">
                            <input type="number" class="form-control cantidad-producto me-2" 
                                style="width: 80px" data-index="${index}" 
                                value="${producto.cantidad}" min="1" max="${producto.stock}">
                            <button class="btn btn-danger eliminar-producto" data-index="${index}">
                                <i class="fas fa-trash"></i> Eliminar
                            </button>
                        </div>
                    </div>
                </div>
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
                Swal.fire({
                    title: 'Stock insuficiente',
                    text: `La cantidad no puede superar el stock disponible (${producto.stock}) para ${producto.nombre}.`,
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
                event.target.value = producto.stock;
                producto.cantidad = producto.stock;
            } else if (nuevaCantidad < 1) {
                Swal.fire({
                    title: 'Cantidad inválida',
                    text: 'La cantidad mínima es 1.',
                    icon: 'warning',
                    confirmButtonText: 'Entendido'
                });
                event.target.value = 1;
                producto.cantidad = 1;
            } else {
                producto.cantidad = nuevaCantidad;
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Cantidad actualizada',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            
            localStorage.setItem("carrito", JSON.stringify(carrito));
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

