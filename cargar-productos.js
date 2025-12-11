// Cargar productos dinámicamente desde la base de datos
const API_URL = 'http://localhost:3001/api';

async function cargarProductos() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const productos = await response.json();

        // Agrupar productos por categoría
        const conservas = productos.filter(p => p.categoria === 'conservas');
        const artesanias = productos.filter(p => p.categoria === 'artesanias');
        const cuidadoPersonal = productos.filter(p => p.categoria === 'cuidado_personal');

        // Renderizar cada categoría
        renderizarProductos('productos-conservas', conservas);
        renderizarProductos('productos-artesanias', artesanias);
        renderizarProductos('productos-cuidado', cuidadoPersonal);

        // Reinicializar event listeners del carrito después de cargar productos
        if (typeof inicializarCarrito === 'function') {
            inicializarCarrito();
        }

    } catch (error) {
        console.error('Error al cargar productos:', error);
    }
}

function renderizarProductos(contenedorId, productos) {
    const contenedor = document.getElementById(contenedorId);
    if (!contenedor) return;

    // Limpiar contenedor
    contenedor.innerHTML = '';

    productos.forEach((producto, index) => {
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto';
        productoDiv.setAttribute('data-id', producto.id);
        productoDiv.setAttribute('data-stock', producto.stock);
        productoDiv.setAttribute('data-aos', 'flip-up');
        productoDiv.setAttribute('data-aos-delay', (index * 50 + 100).toString());

        productoDiv.innerHTML = `
            <img src="imagenes/${producto.imagen}" class="producto-imagen" alt="${producto.nombre}">
            <div class="info">
                <h4>${producto.nombre}</h4>
                <p>${producto.descripcion || ''}</p>
                <p>Precio: $${producto.precio}</p>
                <button class="carrito">Agregar al carrito</button>
            </div>
        `;

        contenedor.appendChild(productoDiv);
    });
}

// Cargar productos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', cargarProductos);

