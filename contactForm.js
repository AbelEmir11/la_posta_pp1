document.addEventListener('DOMContentLoaded', function() {
    const contactoForm = document.getElementById('contactoForm');

    contactoForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const mensaje = document.getElementById('mensaje').value;

        if (!nombre || !email || !mensaje) {
            Swal.fire({
                title: "¡Campos incompletos!",
                text: "Por favor, completa todos los campos.",
                icon: "warning",
                confirmButtonText: "Aceptar"
            });
            return;
        }

        // Crear objeto con los datos del mensaje
        const nuevoMensaje = {
            id: Date.now(),
            nombre,
            email,
            mensaje,
            fecha: new Date().toISOString()
        };

        // Obtener mensajes existentes o inicializar array
        const mensajes = JSON.parse(localStorage.getItem('mensajes')) || [];
        
        // Agregar nuevo mensaje
        mensajes.push(nuevoMensaje);
        
        // Guardar en localStorage
        localStorage.setItem('mensajes', JSON.stringify(mensajes));

        // Mostrar alerta de éxito
        Swal.fire({
            title: '¡Mensaje enviado!',
            text: 'Gracias por contactarnos. Te responderemos pronto.',
            icon: 'success',
            confirmButtonText: 'Aceptar'
        }).then(() => {
            contactoForm.reset();
        });
    });
});