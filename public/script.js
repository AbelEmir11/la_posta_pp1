// Desplazamiento suave en el menú
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth'
        });
    });
});
//envio de formulario y cartel de exito
document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("contactoForm");
    
    formulario.addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que la página se recargue

        // Obtener los valores del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const email = document.getElementById("email").value.trim();
        const mensaje = document.getElementById("mensaje").value.trim();

        if (!nombre || !email || !mensaje) {
            Swal.fire({
                title: "¡nono",
                text: "Por favor, completa todos los campos, bobi.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        // Enviar los datos al backend
       fetch('/api/contacto'), {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nombre, email, mensaje }),
        }
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del servidor:", data);
          
            Swal.fire({
                title: "¡Consulta realizada con éxito!",
                text: "En cuanto leamos tu mensaje lo responderemos al correo que adjuntaste.",
                icon: "success",
                confirmButtonText: "Aceptar" 
            });// Muestra el cartel emergente
            formulario.reset(); // Limpia el formulario
        })
        .catch(error => {
            console.error("Error:", error);
            Swal.fire({
                title: "¡Error!",
                text: "Ocurrió un error al enviar el pedido. Por favor, intenta nuevamente.",
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        });
    });
});


document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
})
function cargarProductos() {
    fetch('/api/productos') 

        .then(response => response.json())
        .then(data => {
            console.log("Productos obtenidos:", data);
       
            const contenedorConservas = document.getElementById("productos-conservas"); 
            const contenedorBebidas = document.getElementById("productos-bebidas");
            const contenedorArtesanias = document.getElementById("productos-artesanias"); 
            const contenedorCuidadoPersonal = document.getElementById("productos-cuidado-personal"); 

            // Limpiar antes de agregar nuevos productos
            contenedorConservas.innerHTML = "";
            contenedorBebidas.innerHTML = "";
            contenedorArtesanias.innerHTML = "";
            contenedorCuidadoPersonal.innerHTML = "";

            data.forEach(producto => {
                const productoElement = document.createElement('div');
                productoElement.classList.add("producto");
                productoElement.setAttribute("data-id", producto.id);
                productoElement.setAttribute("data-precio", producto.precio); // ✅ Agregar precio como atributo

                productoElement.innerHTML = `
                    <img class="producto-imagen" src="imagenes/${producto.imagen}" alt="${producto.nombre}">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p><strong>Precio:</strong> $${producto.precio}</p>
                    <p><strong>Stock:</strong> ${producto.stock}</p>
                    <p><strong>Categoría:</strong> ${producto.categoria_1}</p>
                    <button class="agregar-carrito">Agregar al carrito</button>
                `; 
                // Insertar en el contenedor correspondiente según la categoría
                if (producto.categoria_1.toLowerCase() === "conservas") {
                    contenedorConservas.appendChild(productoElement);
                } else if (producto.categoria_1.toLowerCase() === "bebidas") {
                    contenedorBebidas.appendChild(productoElement);

                } else if (producto.categoria_1.toLowerCase() === "artesanias") {
                    contenedorArtesanias.appendChild(productoElement);
                } else if (producto.categoria_1.toLowerCase() === "cuidado personal") {
                    contenedorCuidadoPersonal.appendChild(productoElement);
                }
            });

            // Añadir evento para agregar al carrito
            document.querySelectorAll(".agregar-carrito").forEach(boton => {
                boton.addEventListener("click", function () {
                    const productoElement = this.closest(".producto");
                    const productoId = productoElement.getAttribute("data-id");
                    const productoNombre = productoElement.querySelector("h3").innerText;
                    const productoImagen = productoElement.querySelector("img").getAttribute("src");
                    const productoPrecio = parseFloat(productoElement.getAttribute("data-precio"));
                    const productoStock = parseInt(productoElement.querySelector("p:nth-of-type(3) strong").nextSibling.nodeValue.trim());

                    
                    const producto = {
                        id: productoId,
                        nombre: productoNombre,
                        precio: productoPrecio,
                        imagen: productoImagen,
                        stock: productoStock
                    };

                    agregarAlCarrito(producto);
                });
            });
        })
        .catch(error => console.error("Error al cargar productos:", error));
}

function agregarAlCarrito(producto) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    let productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        if (productoExistente.cantidad < producto.stock) {
            productoExistente.cantidad++;
        
    } else {
            Swal.fire({
                title: "¡Stock insuficiente!",
                text: "En caso de precisar más unidades, por favor, comuníquese con nosotros a traves de la sección de contacto", 
                icon: "error",
                confirmButtonText: "Aceptar"
            });
        return; // ❌ No agregamos más si se supera el stock
    }
    
}else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: parseFloat(producto.precio), 
            imagen: producto.imagen,
            cantidad: 1,
            stock: producto.stock
        });
    }
    
    localStorage.setItem("carrito", JSON.stringify(carrito));
    
    mostrarMensaje(`${producto.nombre} se agregó al carrito`);

    mostrarCarrito();
}

function mostrarMensaje(mensaje) {
    const notificacion = document.createElement("div");
    notificacion.innerText = mensaje;
    notificacion.style.position = "fixed";
    notificacion.style.top = "10px";
    notificacion.style.right = "10px";
    notificacion.style.backgroundColor = "#28a745";
    notificacion.style.color = "white";
    notificacion.style.padding = "20px";
    notificacion.style.borderRadius = "25px";
    notificacion.style.boxShadow = "0px 0px 10px rgba(77, 207, 73, 0.9)";
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 2000);
}

function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const listaCarrito = document.getElementById("lista-carrito");
    listaCarrito.innerHTML = "";

    carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="${item.imagen}" width="50">
            ${item.nombre} - $${item.precio.toFixed(2)}
            <button onclick="eliminarDelCarrito(${index})">❌</button>
        `;
        listaCarrito.appendChild(li);
    });

    calcularTotal();
}

function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

document.getElementById("vaciar-carrito").addEventListener("click", () => {
    localStorage.removeItem("carrito");
    mostrarCarrito();
});              
/*
document.addEventListener("click", function(event) {
    if (event.target.classList.contains("agregar-carrito")) {
        const productoElement = event.target.closest(".producto");
        const productoId = productoElement.getAttribute("data-id");
        const productoNombre = productoElement.querySelector("h3").innerText;
        const productoPrecio = productoElement.querySelectorAll("p")[2].innerText.replace("Precio: $", "");


        const producto = {
            id: productoId,
            nombre: productoNombre,
            precio: parseFloat(productoPrecio)
        };

        carrito.push(producto);
        localStorage.setItem("carrito", JSON.stringify(carrito));
        

        console.log("Producto agregado al carrito:", producto);
        console.log("Carrito actual:", carrito);
    }
});
*/
// Validación del formulario de contacto
document.getElementById('contactForm').onsubmit = function(event) {
    event.preventDefault();
    this.submit();
};
