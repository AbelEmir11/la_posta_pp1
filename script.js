document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM cargado');

    // Inicializar los event listeners del carrito
    inicializarCarrito();
});

// Función para inicializar los event listeners del carrito
function inicializarCarrito() {
    console.log('Inicializando carrito...');

    // Seleccionar todos los botones de agregar al carrito
    const botonesAgregar = document.querySelectorAll('.carrito');
    console.log('Botones encontrados:', botonesAgregar.length);

    // Agregar evento click a cada botón
    botonesAgregar.forEach(boton => {
        // Remover listeners anteriores si existen (clonando el nodo)
        const nuevoBoton = boton.cloneNode(true);
        boton.parentNode.replaceChild(nuevoBoton, boton);

        nuevoBoton.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Botón clickeado');

            // Obtener el contenedor del producto
            const productoDiv = this.closest('.producto');
            console.log('Contenedor del producto:', productoDiv);

            if (!productoDiv) {
                console.error('No se encontró el contenedor del producto');
                return;
            }

            // Extraer datos del producto
            const producto = {
                id: productoDiv.dataset.id,
                nombre: productoDiv.querySelector('h4').textContent,
                precio: parseFloat(productoDiv.querySelector('p:nth-of-type(2)').textContent.replace(/[^\d.]/g, '')),
                imagen: productoDiv.querySelector('img').src,
                cantidad: 1,
                stock: parseInt(productoDiv.dataset.stock || '10')
            };

            console.log('Datos del producto:', producto);

            // Obtener carrito actual
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

            // Buscar si el producto ya existe
            const productoExistente = carrito.find(item => item.id === producto.id);

            if (productoExistente) {
                if (productoExistente.cantidad < producto.stock) {
                    productoExistente.cantidad++;
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Producto actualizado en el carrito',
                        showConfirmButton: false,
                        timer: 1500
                    });
                } else {
                    Swal.fire({
                        icon: 'warning',
                        title: 'Stock insuficiente',
                        text: 'No hay más unidades disponibles de este producto'
                    });
                    return;
                }
            } else {
                carrito.push(producto);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Producto agregado al carrito',
                    showConfirmButton: false,
                    timer: 1500
                });
            }

            // Guardar carrito actualizado
            localStorage.setItem('carrito', JSON.stringify(carrito));
            console.log('Carrito actualizado:', carrito);
        });
    });
}


// Desplazamiento suave en el menú
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        window.scrollTo({
            top: targetElement.offsetTop,
            behavior: 'smooth'
        });
    });
});
// ===== REEMPLAZA EL CÓDIGO DEL FORMULARIO EN TU script.js =====

// Envío de formulario y cartel de éxito - SIN BACKEND
document.addEventListener("DOMContentLoaded", function () {
    const formulario = document.getElementById("contactoForm");

    if (formulario) {
        formulario.addEventListener("submit", function (event) {
            event.preventDefault(); // Evita que la página se recargue

            // Obtener los valores del formulario
            const nombre = document.getElementById("nombre").value.trim();
            const email = document.getElementById("email").value.trim();
            const mensaje = document.getElementById("mensaje").value.trim();

            // Validar que todos los campos estén completos
            if (!nombre || !email || !mensaje) {
                Swal.fire({
                    title: "¡Campos incompletos!",
                    text: "Por favor, completa todos los campos.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                Swal.fire({
                    title: "Email inválido",
                    text: "Por favor, ingresa un email válido.",
                    icon: "error",
                    confirmButtonText: "Aceptar"
                });
                return;
            }

            // Crear objeto con los datos del contacto
            const contacto = {
                id: Date.now(), // ID único basado en timestamp
                nombre: nombre,
                email: email,
                mensaje: mensaje,
                fecha: new Date().toLocaleString('es-AR', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                })
            };

            // Guardar en localStorage
            let contactos = JSON.parse(localStorage.getItem("contactos")) || [];
            contactos.push(contacto);
            localStorage.setItem("contactos", JSON.stringify(contactos));

            console.log("✅ Contacto guardado:", contacto);
            console.log("📋 Todos los contactos:", contactos);

            // Mostrar mensaje de éxito
            Swal.fire({
                title: "¡Consulta realizada con éxito!",
                html: `
                    <p>Gracias <strong>${nombre}</strong> por contactarnos.</p>
                    <p>En cuanto leamos tu mensaje lo responderemos al correo:</p>
                    <p><strong>${email}</strong></p>
                    <p>
                    También puedes comunicarte con nosotros a través del boton de WhatsApp  </p>
                `,
                icon: "success",
                confirmButtonText: "Aceptar",
                confirmButtonColor: "#4a7c4a"
            }).then(() => {
                // Opcional: Mostrar en consola el mensaje guardado
                mostrarContactosEnConsola();
            });

            // Limpiar el formulario
            formulario.reset();

            // Opcional: Guardar también en sessionStorage para esta sesión
            sessionStorage.setItem("ultimoContacto", JSON.stringify(contacto));
        });
    }
});

// Función para mostrar los contactos guardados en la consola (útil para debug)
function mostrarContactosEnConsola() {
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];
    console.log("=================================");
    console.log("📬 MENSAJES DE CONTACTO GUARDADOS");
    console.log("=================================");
    contactos.forEach((contacto, index) => {
        console.log(`\nMensaje #${index + 1}:`);
        console.log(`Fecha: ${contacto.fecha}`);
        console.log(`Nombre: ${contacto.nombre}`);
        console.log(`Email: ${contacto.email}`);
        console.log(`Mensaje: ${contacto.mensaje}`);
        console.log("---------------------------------");
    });
}

// Función para ver todos los contactos (puedes llamarla desde la consola)
function verContactos() {
    const contactos = JSON.parse(localStorage.getItem("contactos")) || [];
    if (contactos.length === 0) {
        console.log("No hay mensajes guardados.");
        return;
    }
    mostrarContactosEnConsola();
    return contactos;
}

// Función para limpiar todos los contactos (útil para testing)
function limpiarContactos() {
    localStorage.removeItem("contactos");
    console.log("✅ Todos los contactos han sido eliminados.");
}

// Hacer las funciones disponibles globalmente para poder usarlas en la consola
window.verContactos = verContactos;
window.limpiarContactos = limpiarContactos;

// Mensaje de bienvenida en consola
console.log("💡 Funciones disponibles:");
console.log("- verContactos() - Ver todos los mensajes guardados");
console.log("- limpiarContactos() - Borrar todos los mensajes");


document.addEventListener("DOMContentLoaded", function () {
    cargarProductos();
})
function cargarProductos() {
    fetch("http://localhost:3001/api/productos")
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

    } else {
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

document.getElementById('contactForm').onsubmit = function (event) {
    event.preventDefault();
    this.submit();
};





// Animaciones adicionales para la página nosotros.html
document.addEventListener('DOMContentLoaded', function () {
    // Detectar si estamos en nosotros.html
    if (window.location.pathname.includes('nosotros.html')) {

        // Animación de contador para elementos con números
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, observerOptions);

        // Observar las tarjetas de características
        document.querySelectorAll('.feature-card').forEach(card => {
            observer.observe(card);
        });

        // Efecto hover mejorado para las redes sociales
        document.querySelectorAll('.social-icon').forEach(icon => {
            icon.addEventListener('mouseenter', function () {
                // Agregar un pequeño efecto de escala a la imagen
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1.1) rotate(5deg)';
                }

                const fontIcon = this.querySelector('i');
                if (fontIcon) {
                    fontIcon.style.transform = 'scale(1.2) rotate(-10deg)';
                }
            });

            icon.addEventListener('mouseleave', function () {
                const img = this.querySelector('img');
                if (img) {
                    img.style.transform = 'scale(1) rotate(0deg)';
                }

                const fontIcon = this.querySelector('i');
                if (fontIcon) {
                    fontIcon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });

        // Efecto de texto typewriter para el título principal (opcional)
        function typeWriter(element, text, speed = 100) {
            let i = 0;
            element.innerHTML = '';
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                }
            }
            type();
        }

        // Efecto parallax suave para elementos de la página
        window.addEventListener('scroll', function () {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.feature-card');

            parallaxElements.forEach((element, index) => {
                const speed = 0.1 + (index * 0.05);
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });

        // Animación de aparición progresiva para párrafos
        const paragraphs = document.querySelectorAll('.about-text p');
        paragraphs.forEach((p, index) => {
            p.style.opacity = '0';
            p.style.transform = 'translateY(30px)';

            setTimeout(() => {
                p.style.transition = 'all 0.8s ease';
                p.style.opacity = '1';
                p.style.transform = 'translateY(0)';
            }, 200 * (index + 1));
        });

        // Efecto de brillo en las tarjetas al pasar el mouse
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mouseenter', function () {
                this.style.background = 'linear-gradient(135deg, #ffffff, #f8faf8)';
                this.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
            });

            card.addEventListener('mouseleave', function () {
                this.style.background = 'white';
                this.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
            });
        });

        // Animación del mapa cuando entra en viewport
        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const map = entry.target;
                    map.style.transform = 'scale(0.8)';
                    map.style.transition = 'transform 0.8s ease';
                    setTimeout(() => {
                        map.style.transform = 'scale(1)';
                    }, 100);
                }
            });
        });

        const mapElement = document.querySelector('.map');
        if (mapElement) {
            mapObserver.observe(mapElement);
        }

        // Efecto de ondas en el botón flotante de WhatsApp
        const whatsappBtn = document.querySelector('.whatsapp-float');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', function (e) {
                // Crear efecto de ondas
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.height, rect.width);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple');

                this.appendChild(ripple);

                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        }

        // Efecto de desplazamiento suave mejorado para enlaces internos
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });

        // Lazy loading mejorado para imágenes
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.6s ease';

                    img.onload = () => {
                        img.style.opacity = '1';
                    };

                    observer.unobserve(img);
                }
            });
        });

        // Observar todas las imágenes
        document.querySelectorAll('img').forEach(img => {
            imageObserver.observe(img);
        });

        console.log('✅ Efectos adicionales para nosotros.html cargados correctamente');
    }
});

// Función utilitaria para crear efectos de partículas (opcional)
function createParticleEffect(container, particleCount = 50) {
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(139, 178, 143, 0.6);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${5 + Math.random() * 10}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(particle);
    }
}

// CSS para las ondas del botón WhatsApp
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .particle {
        z-index: -1;
    }
    
    @keyframes float {
        0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 1;
        }
        50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.5;
        }
    }
`;
document.head.appendChild(rippleStyle);



// Mejoras adicionales para la página de productos
document.addEventListener('DOMContentLoaded', function () {
    // Detectar si estamos en productos.html
    if (window.location.pathname.includes('productos.html')) {

        // Animación de entrada para los productos
        const productos = document.querySelectorAll('.producto');

        // Configurar intersection observer para animaciones
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Agregar delay progresivo para efecto cascada
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 100);
                }
            });
        }, observerOptions);

        // Inicializar productos con estado inicial para animación
        productos.forEach(producto => {
            producto.style.opacity = '0';
            producto.style.transform = 'translateY(30px)';
            producto.style.transition = 'all 0.6s ease';
            observer.observe(producto);
        });

        // Efecto de carga mejorado para imágenes
        const imagenes = document.querySelectorAll('.producto-imagen');
        imagenes.forEach(img => {
            img.addEventListener('load', function () {
                this.style.opacity = '1';
            });

            // Si la imagen ya está cargada
            if (img.complete) {
                img.style.opacity = '1';
            } else {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.5s ease';
            }
        });

        // Efecto de contador para mostrar cantidad de productos
        function mostrarContadorProductos() {
            const conservas = document.querySelectorAll('#productos-conservas .producto').length;
            const artesanias = document.querySelectorAll('#productos-artesanias .producto').length;
            const cuidadoPersonal = document.querySelectorAll('#productos-cuidado-personal .producto').length;

            // Actualizar títulos con contador (opcional)
            const tituloConservas = document.querySelector('#productos h3');
            const tituloArtesanias = document.querySelectorAll('#productos h3')[1];
            const tituloCuidado = document.querySelectorAll('#productos h3')[2];

            if (tituloConservas) {
                tituloConservas.setAttribute('data-count', `(${conservas} productos)`);
            }
            if (tituloArtesanias) {
                tituloArtesanias.setAttribute('data-count', `(${artesanias} productos)`);
            }
            if (tituloCuidado) {
                tituloCuidado.setAttribute('data-count', `(${cuidadoPersonal} productos)`);
            }
        }

        // Ejecutar contador
        mostrarContadorProductos();

        // Efecto de filtro suave al hacer scroll entre secciones
        const secciones = document.querySelectorAll('#productos');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            let current = '';
            secciones.forEach(seccion => {
                const sectionTop = seccion.offsetTop;
                const sectionHeight = seccion.clientHeight;
                if (pageYOffset >= (sectionTop - 200)) {
                    current = seccion.getAttribute('id');
                }
            });
        });

        // Mejorar la experiencia del carrito con feedback visual
        document.querySelectorAll('.carrito').forEach(boton => {
            boton.addEventListener('click', function (e) {
                e.preventDefault();

                // Efecto de ondas en el botón
                const rect = this.getBoundingClientRect();
                const ripple = document.createElement('span');
                const size = Math.max(rect.height, rect.width);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('ripple-effect');

                this.appendChild(ripple);

                // Cambiar texto temporalmente
                const textoOriginal = this.textContent;
                this.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
                this.style.background = 'linear-gradient(135deg, #28a745, #20c997)';

                setTimeout(() => {
                    this.textContent = textoOriginal;
                    this.style.background = '';
                    ripple.remove();
                }, 1500);
            });
        });

        console.log('✅ Mejoras de productos.html cargadas correctamente');
    }
});

// Función para smooth scroll mejorado
function smoothScrollTo(element, duration = 1000) {
    const targetPosition = element.offsetTop - 80; // 80px offset para el header
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    // Función de easing para suavizar la animación
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
}

// === FUNCIONES PARA MOSTRAR PRODUCTOS COMPRADOS EN CONSOLA ===

// Mostrar historial de compras en consola
function mostrarComprasEnConsola() {
    const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
    if (pedidos.length === 0) {
        console.log("No hay compras realizadas.");
        return;
    }
    console.log("=================================");
    console.log("🛒 HISTORIAL DE COMPRAS REALIZADAS");
    console.log("=================================");
    pedidos.forEach((pedido, idx) => {
        console.log(`\nCompra #${idx + 1} - Fecha: ${pedido.fecha}`);
        console.log(`Nombre: ${pedido.nombre}`);
        console.log(`Dirección: ${pedido.direccion}`);
        console.log(`Email: ${pedido.email}`);
        console.log(`Teléfono: ${pedido.telefono}`);
        console.log(`Método de pago: ${pedido.metodo_pago}`);
        console.log("Productos:");
        pedido.productos.forEach((prod, i) => {
            console.log(`  ${i + 1}. ${prod.nombre} - Cantidad: ${prod.cantidad} - Precio: $${prod.precio}`);
        });
        console.log("---------------------------------");
    });
}

// Función global para ver compras desde consola
function verCompras() {
    mostrarComprasEnConsola();
    return JSON.parse(localStorage.getItem("pedidos")) || [];
}

// Función para limpiar historial de compras (opcional)
function limpiarCompras() {
    localStorage.removeItem("pedidos");
    console.log("✅ Historial de compras eliminado.");
}

// Hacer funciones globales
window.verCompras = verCompras;
window.limpiarCompras = limpiarCompras;

// Mensaje de ayuda en consola
console.log("💡 Funciones disponibles:");
console.log("- verContactos() - Ver todos los mensajes guardados");
console.log("- limpiarContactos() - Borrar todos los mensajes");
console.log("- verCompras() - Ver historial de compras realizadas");
console.log("- limpiarCompras() - Borrar historial de compras");
