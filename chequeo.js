// ============================================
// CHEQUEO.JS - LA POSTA CAMPESINA
// Integración con Mercado Pago Checkout Pro
// ARCHIVO COMPLETO - REEMPLAZAR TODO EL CONTENIDO
// ============================================

console.log('✅ chequeo.js cargado');

// API_URL ya está definido en auth.js

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM cargado - Inicializando checkout');

    const formulario = document.getElementById('formulario-compra');

    if (!formulario) {
        console.error('❌ No se encontró el formulario de compra');
        return;
    }

    // Mostrar resumen del carrito
    mostrarResumenCarrito();

    // Probar conexión con el backend
    testBackendConnection();

    // Manejar envío del formulario
    formulario.addEventListener('submit', async function (e) {
        e.preventDefault();

        console.log('📝 Formulario enviado');

        // Obtener datos del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const direccion = document.getElementById('direccion').value.trim();
        const email = document.getElementById('email').value.trim();
        const telefono = document.getElementById('telefono').value.trim();

        // Validar campos vacíos
        if (!nombre || !direccion || !email || !telefono) {
            Swal.fire({
                icon: 'error',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos',
                confirmButtonColor: '#4a7c4a'
            });
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Email inválido',
                text: 'Por favor ingresa un email válido',
                confirmButtonColor: '#4a7c4a'
            });
            return;
        }

        // Obtener carrito del localStorage
        const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

        console.log('🛒 Carrito actual:', carrito);

        if (carrito.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Carrito vacío',
                text: 'No hay productos en el carrito',
                confirmButtonColor: '#4a7c4a'
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Procesando...',
            text: 'Preparando tu compra con Mercado Pago',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            console.log('📤 Enviando datos al backend...');

            // Crear preferencia de pago en Mercado Pago
            const response = await fetch(`${API_URL}/create-preference`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    items: carrito,
                    payer: {
                        nombre: nombre,
                        email: email,
                        telefono: telefono,
                        direccion: direccion
                    }
                })
            });

            console.log('📥 Respuesta recibida:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Error del servidor:', errorData);
                throw new Error(errorData.error || 'Error al crear la preferencia de pago');
            }

            const data = await response.json();

            console.log('✅ Preferencia creada exitosamente:', data);

            // Guardar datos del pedido antes de redirigir
            const pedido = {
                id: Date.now(),
                fecha: new Date().toLocaleString('es-AR', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }),
                nombre: nombre,
                direccion: direccion,
                email: email,
                telefono: telefono,
                productos: carrito,
                total: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
                preference_id: data.id,
                estado: 'pendiente'
            };

            // Guardar en localStorage
            let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
            pedidos.push(pedido);
            localStorage.setItem('pedidos', JSON.stringify(pedidos));

            console.log('💾 Pedido guardado:', pedido);

            // Cerrar loading
            Swal.close();

            // Pequeño delay para mejor UX
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('🔄 Redirigiendo a Mercado Pago...');
            console.log('🔗 URL:', data.sandbox_init_point);

            // Redirigir a Mercado Pago
            // En modo prueba usa sandbox_init_point
            // En producción usa init_point
            window.location.href = data.sandbox_init_point;

        } catch (error) {
            console.error('❌ Error completo:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error al procesar',
                html: `
                    <p>Hubo un problema al procesar tu compra.</p>
                    <p><small>${error.message}</small></p>
                    <p>Por favor intenta de nuevo o contacta con soporte.</p>
                `,
                confirmButtonColor: '#4a7c4a'
            });
        }
    });
});

// ============================================
// MOSTRAR RESUMEN DEL CARRITO
// ============================================
function mostrarResumenCarrito() {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const contenedor = document.getElementById('resumen-carrito');

    if (!contenedor) {
        console.warn('⚠️ No se encontró el contenedor del resumen');
        return;
    }

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="card">
                <div class="card-body text-center">
                    <i class="fas fa-shopping-cart" style="font-size: 48px; color: #ccc;"></i>
                    <p class="mt-3">No hay productos en el carrito</p>
                    <a href="productos.html" class="btn btn-primary">
                        <i class="fas fa-shopping-bag"></i> Ver productos
                    </a>
                </div>
            </div>
        `;
        return;
    }

    let total = 0;
    let html = '<div class="card shadow-sm"><div class="card-body">';
    html += '<h5 class="card-title mb-3"><i class="fas fa-shopping-cart"></i> Resumen de tu compra</h5>';
    html += '<ul class="list-group list-group-flush mb-3">';

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        html += `
            <li class="list-group-item px-0">
                <div class="d-flex align-items-center">
                    <img src="${item.imagen}" alt="${item.nombre}" 
                         class="img-thumbnail me-2" style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <strong class="d-block">${item.nombre}</strong>
                        <small class="text-muted">
                            ${item.cantidad} x $${item.precio.toFixed(2)}
                        </small>
                    </div>
                    <span class="badge bg-success rounded-pill" style="font-size: 14px;">
                        $${subtotal.toFixed(2)}
                    </span>
                </div>
            </li>
        `;
    });

    html += '</ul>';

    // Total
    html += `
        <div class="border-top pt-3">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Total:</h5>
                <h4 class="mb-0 text-success">$${total.toFixed(2)}</h4>
            </div>
        </div>
    `;

    // Info de Mercado Pago
    html += `
        <div class="alert alert-info mt-3 mb-0">
            <i class="fas fa-shield-alt"></i>
            <small>
                <strong>Pago seguro con Mercado Pago</strong><br>
                Podrás pagar con tarjeta, efectivo o transferencia
            </small>
        </div>
    `;

    html += '</div></div>';

    contenedor.innerHTML = html;

    console.log('✅ Resumen del carrito mostrado:', {
        productos: carrito.length,
        total: total
    });
}

// ============================================
// PROBAR CONEXIÓN CON EL BACKEND
// ============================================
async function testBackendConnection() {
    try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('✅ Backend conectado:', data);
        return true;
    } catch (error) {
        console.error('❌ Backend no disponible:', error);
        console.error('⚠️ Asegúrate de que el servidor esté corriendo en:', API_URL);

        // Mostrar alerta al usuario
        Swal.fire({
            icon: 'error',
            title: 'Error de conexión',
            html: `
                <p>No se pudo conectar con el servidor de pagos.</p>
                <p><small>Asegúrate de que el backend esté corriendo en el puerto 3001</small></p>
            `,
            confirmButtonColor: '#4a7c4a'
        });

        return false;
    }
}

// ============================================
// FUNCIONES AUXILIARES (DEBUGGING)
// ============================================

// Ver carrito en consola
window.verCarrito = function () {
    const carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    console.table(carrito);
    return carrito;
};

// Ver pedidos en consola
window.verPedidos = function () {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    console.table(pedidos);
    return pedidos;
};

// Limpiar carrito
window.limpiarCarrito = function () {
    localStorage.removeItem('carrito');
    console.log('✅ Carrito limpiado');
    mostrarResumenCarrito();
};

// Mensaje de ayuda en consola
console.log('💡 Funciones disponibles en consola:');
console.log('- verCarrito() - Ver productos en el carrito');
console.log('- verPedidos() - Ver historial de pedidos');
console.log('- limpiarCarrito() - Vaciar el carrito');