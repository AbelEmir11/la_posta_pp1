// ============================================
// AUTH.JS - FUNCIONES DE AUTENTICACIÓN
// ============================================

const API_URL = 'http://localhost:3001/api';

// ============================================
// REGISTRO DE USUARIO
// ============================================

async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al registrar usuario');
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// LOGIN
// ============================================

async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        // Guardar token y datos del usuario en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        console.log('✅ Login exitoso:', data.user.email);

        return { success: true, user: data.user };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// LOGOUT
// ============================================

async function logout() {
    try {
        const token = getAuthToken();

        if (token) {
            // Notificar al servidor (opcional)
            await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        // Limpiar localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        console.log('✅ Logout exitoso');

        // Redirigir a la página principal
        window.location.href = 'index.html';

        return { success: true };
    } catch (error) {
        console.error('Error en logout:', error);
        // Limpiar localStorage de todas formas
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
        return { success: false, error: error.message };
    }
}

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================

async function getCurrentUser() {
    try {
        const token = getAuthToken();

        if (!token) {
            return null;
        }

        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            // Token inválido o expirado
            logout();
            return null;
        }

        const user = await response.json();

        // Actualizar datos en localStorage
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return null;
    }
}

// ============================================
// CAMBIAR CONTRASEÑA
// ============================================

async function changePassword(currentPassword, newPassword) {
    try {
        const token = getAuthToken();

        if (!token) {
            throw new Error('No estás autenticado');
        }

        const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al cambiar contraseña');
        }

        return { success: true, message: data.message };
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// VERIFICAR SI ESTÁ AUTENTICADO
// ============================================

function isAuthenticated() {
    const token = getAuthToken();
    const user = getUserFromStorage();
    return !!(token && user);
}

// ============================================
// VERIFICAR SI ES ADMIN
// ============================================

function isAdmin() {
    const user = getUserFromStorage();
    return user && user.rol === 'admin';
}

// ============================================
// OBTENER TOKEN
// ============================================

function getAuthToken() {
    return localStorage.getItem('authToken');
}

// ============================================
// OBTENER USUARIO DEL STORAGE
// ============================================

function getUserFromStorage() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (error) {
        console.error('Error al parsear usuario:', error);
        return null;
    }
}

// ============================================
// PROTEGER PÁGINA (requiere autenticación)
// ============================================

function requireAuth(redirectUrl = 'login.html') {
    if (!isAuthenticated()) {
        window.location.href = redirectUrl;
        return false;
    }
    return true;
}

// ============================================
// PROTEGER PÁGINA DE ADMIN
// ============================================

function requireAdmin(redirectUrl = 'index.html') {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return false;
    }

    if (!isAdmin()) {
        Swal.fire({
            icon: 'error',
            title: 'Acceso Denegado',
            text: 'No tienes permisos de administrador'
        }).then(() => {
            window.location.href = redirectUrl;
        });
        return false;
    }

    return true;
}

// ============================================
// ACTUALIZAR NAVBAR CON INFO DE USUARIO
// ============================================

function updateNavbar() {
    const user = getUserFromStorage();
    const navbar = document.querySelector('.navbar-nav');

    if (!navbar) return;

    // Buscar si ya existe el elemento de usuario
    let userElement = document.getElementById('navbar-user-info');

    if (user) {
        // Usuario autenticado
        if (!userElement) {
            userElement = document.createElement('li');
            userElement.id = 'navbar-user-info';
            userElement.className = 'nav-item dropdown';
            navbar.appendChild(userElement);
        }

        userElement.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                👤 ${user.nombre}
            </a>
            <ul class="dropdown-menu">
                ${user.rol === 'admin' ? '<li><a class="dropdown-item" href="admin-dashboard.html">📊 Panel Admin</a></li>' : ''}
                <li><a class="dropdown-item" href="perfil.html">👤 Mi Perfil</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" onclick="logout(); return false;">🚪 Cerrar Sesión</a></li>
            </ul>
        `;
    } else {
        // Usuario no autenticado
        if (!userElement) {
            userElement = document.createElement('li');
            userElement.id = 'navbar-user-info';
            userElement.className = 'nav-item';
            navbar.appendChild(userElement);
        }

        userElement.innerHTML = `
            <a class="nav-link" href="login.html">🔐 Iniciar Sesión</a>
        `;
    }
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Actualizar navbar en todas las páginas
    updateNavbar();
});

// ============================================
// HACER PETICIÓN AUTENTICADA
// ============================================

async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('No estás autenticado');
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        // Token inválido o sin permisos
        logout();
        throw new Error('Sesión expirada o sin permisos');
    }

    return response;
}

// Exportar funciones para uso global
window.auth = {
    register,
    login,
    logout,
    getCurrentUser,
    changePassword,
    isAuthenticated,
    isAdmin,
    getAuthToken,
    getUserFromStorage,
    requireAuth,
    requireAdmin,
    updateNavbar,
    authenticatedFetch
};
