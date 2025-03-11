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
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Enviar los datos al backend
        fetch("http://localhost:3001/contacto", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nombre, email, mensaje }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Respuesta del servidor:", data);
            alert("Gracias por tu mensaje. Nos pondremos en contacto contigo pronto."); // Muestra el cartel emergente
            formulario.reset(); // Limpia el formulario
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Hubo un problema al enviar el mensaje.");
        });
    });
});


// Función para cargar productos en la página
function cargarProductos() {
    fetch("http://localhost:3001/api/productos")
        .then(response => response.json())
        .then(data => {
            console.log("Productos obtenidos:", data);

            const contenedorConservas = document.getElementById("productos-conservas"); 
            const contenedorArtesanias = document.getElementById("productos-artesanias"); 
            const contenedorCuidadoPersonal = document.getElementById("productos-cuidado-personal"); 

              // Limpiar antes de agregar nuevos productos
              contenedorConservas.innerHTML = "";
              contenedorArtesanias.innerHTML = "";
              contenedorCuidadoPersonal.innerHTML = "";

            

            data.forEach(producto => {
                const productoElement = document.createElement('div');
                productoElement.classList.add("producto");
                productoElement.setAttribute("data-id", producto.id);
                productoElement.innerHTML = `
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p><strong>Precio:</strong> $${producto.precio}</p>
                    <p><strong>Stock:</strong> ${producto.stock}</p>
                    <p><strong>Categoría:</strong> ${producto.categoria}</p>

                    <button class="agregar-carrito">Agregar al carrito</button>
                `; 
                // Insertar en el contenedor correspondiente según la categoría
                if (producto.category.toLowerCase() === "conservas") {
                    contenedorConservas.appendChild(productoElement);
                } else if (producto.category.toLowerCase() === "artesanias") {
                    contenedorArtesanias.appendChild(productoElement);
                } else if (producto.category.toLowerCase() === "cuidado personal") {
                    contenedorCuidadoPersonal.appendChild(productoElement);
                }
            });
        })
               
        
        .catch(error => console.error("Error al obtener productos:", error));
}

// Llamar a la función cuando la página cargue
document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
});

// Lógica para el carrito de compras
const carrito = JSON.parse(localStorage.getItem("carrito")) || [];


// Lógica para el sonido al añadir al carrito
document.addEventListener("DOMContentLoaded", () => {
    const botonesCarrito = document.querySelectorAll(".carrito");

    botonesCarrito.forEach(boton => {
        boton.addEventListener("click", (event) => {
            const producto = event.target.closest(".producto"); // Encuentra el div padre con clase "producto"
            agregarAlCarrito(producto);
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    mostrarCarrito();
});

function mostrarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const listaCarrito = document.getElementById("lista-carrito");
    listaCarrito.innerHTML = "";

    carrito.forEach((item, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <img src="${item.imagen}" width="50">
            ${item.nombre} - $${item.precio}
            <button onclick="eliminarDelCarrito(${index})">❌</button>
        `;
        listaCarrito.appendChild(li);
    });
}

// Función para eliminar productos
function eliminarDelCarrito(index) {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    mostrarCarrito();
}

// Vaciar carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => {
    localStorage.removeItem("carrito");
    mostrarCarrito();
});

function agregarAlCarrito(producto) {
    const id = producto.getAttribute("data-id");
    const nombre = producto.querySelector("h4").innerText;
    const precio = producto.querySelector("p:nth-of-type(2)").innerText.replace("Precio: $", "");
    const imagen = producto.querySelector(".producto-imagen").src;

    // Crear objeto del producto
    const item = {
        id,
        nombre,
        precio,
        imagen
    };

    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    // Agregar producto al carrito
    carrito.push(item);

    localStorage.setItem("carrito", JSON.stringify(carrito));

    mostrarMensaje(`${nombre} se agregó al carrito`);
}

//logiica para mostrar mensaje de producto agregado al carrito
function mostrarMensaje(mensaje) {
    const notificacion = document.createElement("div");
    notificacion.innerText = mensaje;
    notificacion.style.position = "fixed";
    notificacion.style.top = "20px";
    notificacion.style.right = "20px";
    notificacion.style.backgroundColor = "#28a745";
    notificacion.style.color = "white";
    notificacion.style.padding = "10px";
    notificacion.style.borderRadius = "5px";
    notificacion.style.boxShadow = "0px 0px 10px rgba(0,0,0,0.3)";
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.remove();
    }, 2000);
}


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

// Validación del formulario de contacto
document.getElementById('contactForm').onsubmit = function(event) {
    event.preventDefault();
    this.submit();
};
