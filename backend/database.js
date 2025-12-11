// ============================================
// DATABASE.JS - LA POSTA CAMPESINA
// Configuración de SQLite con better-sqlite3
// ============================================

const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const path = require('path');

// Crear/abrir base de datos
// Crear/abrir base de datos
const db = new Database(path.join(__dirname, 'lapostacampesina.db'), { verbose: console.log });

// ============================================
// CREAR TABLAS
// ============================================

function initializeDatabase() {
    console.log('📦 Inicializando base de datos...');

    // Tabla de usuarios
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            telefono TEXT,
            direccion TEXT,
            rol TEXT NOT NULL CHECK(rol IN ('admin', 'cliente')) DEFAULT 'cliente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla de productos
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            categoria TEXT NOT NULL,
            imagen TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Tabla de pedidos
    db.exec(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            total REAL NOT NULL,
            estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'despachado', 'entregado', 'cancelado')) DEFAULT 'pendiente',
            mercadopago_id TEXT,
            mercadopago_status TEXT,
            nombre_cliente TEXT NOT NULL,
            email_cliente TEXT NOT NULL,
            telefono_cliente TEXT NOT NULL,
            direccion_cliente TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Tabla de items de pedidos
    db.exec(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            nombre_producto TEXT NOT NULL,
            precio REAL NOT NULL,
            cantidad INTEGER NOT NULL,
            subtotal REAL NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Tabla de mensajes de contacto
    db.exec(`
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            mensaje TEXT NOT NULL,
            leido INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Tablas creadas correctamente');

    // Agregar campos de comprobante si no existen
    try {
        db.exec(`ALTER TABLE orders ADD COLUMN comprobante TEXT`);
        console.log('✅ Campo comprobante agregado');
    } catch (e) {
        // El campo ya existe, ignorar error
    }

    try {
        db.exec(`ALTER TABLE orders ADD COLUMN comprobante_nombre TEXT`);
        console.log('✅ Campo comprobante_nombre agregado');
    } catch (e) {
        // El campo ya existe, ignorar error
    }

    // Inicializar queries después de crear las tablas
    initializeQueries();

    // Crear usuario administrador por defecto si no existe
    createDefaultAdmin();

    // Migrar productos existentes si no hay productos en la BD
    migrateProducts();
}

// ============================================
// CREAR ADMIN POR DEFECTO
// ============================================

function createDefaultAdmin() {
    const adminExists = db.prepare('SELECT id FROM users WHERE rol = ?').get('admin');

    if (!adminExists) {
        const hashedPassword = bcrypt.hashSync('Admin123!', 10);
        const stmt = db.prepare(`
            INSERT INTO users (nombre, email, password, rol)
            VALUES (?, ?, ?, ?)
        `);

        stmt.run('Administrador', 'admin@lapostacampesina.com', hashedPassword, 'admin');
        console.log('👤 Usuario administrador creado:');
        console.log('   Email: admin@lapostacampesina.com');
        console.log('   Password: Admin123!');
        console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');
    }
}

// ============================================
// MIGRAR PRODUCTOS EXISTENTES
// ============================================

function migrateProducts() {
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();

    if (productCount.count === 0) {
        console.log('📦 Migrando productos iniciales...');

        const productos = [
            // Conservas
            { nombre: 'Durazno', descripcion: 'Los Duraznos más dulces y jugosos los encontrás en nuestro local.', precio: 1500, stock: 10, categoria: 'conservas', imagen: 'durazno hijas.jpg' },
            { nombre: 'Dulce', descripcion: 'Disfruta de las mejores mermeladas en nuestro local.', precio: 700, stock: 10, categoria: 'conservas', imagen: 'dulce2.jpg' },
            { nombre: 'Vino Ramona', descripcion: 'El vino tinto perfecto para acompañar tus comidas.', precio: 3000, stock: 10, categoria: 'conservas', imagen: 'vinoramora.jpg' },
            { nombre: 'Pan de membrillo', descripcion: 'Los panes de membrillo mas deliciosos que vas a probar.', precio: 2000, stock: 10, categoria: 'conservas', imagen: 'dulces.jpg' },
            { nombre: 'Verdura', descripcion: 'Bolsones de verdura surtida, sin conservantes y al mejor precio.', precio: 1200, stock: 10, categoria: 'conservas', imagen: 'verdura.jpg' },
            { nombre: 'Turrón', descripcion: 'Compuestos por almendras, miel y azúcar, sin conservantes ni aditivos químicos.', precio: 2500, stock: 10, categoria: 'conservas', imagen: 'turron.jpg' },
            { nombre: 'Gin ManGin', descripcion: 'Elaborado con ingredientes naturales ofreciendo un sabor único y refrescante.', precio: 1800, stock: 10, categoria: 'conservas', imagen: 'gin.jpg' },
            { nombre: 'Talitas', descripcion: 'El aperitivo perfecto.', precio: 1200, stock: 10, categoria: 'conservas', imagen: 'turron1.jpg' },

            // Artesanías
            { nombre: 'Atrapasueños', descripcion: 'Para decorar tu habitación.', precio: 1000, stock: 10, categoria: 'artesanias', imagen: 'atrapasueños.jpg' },
            { nombre: 'Lana', descripcion: 'Lana de oveja y/o cabra.', precio: 1500, stock: 10, categoria: 'artesanias', imagen: 'lana.jpg' },
            { nombre: 'Chupalla', descripcion: 'Lo mejor para el calor.', precio: 2000, stock: 10, categoria: 'artesanias', imagen: 'chupalla.jpg' },
            { nombre: 'Jarrón', descripcion: 'Los mejores jarrones de arcilla, hermosos para decorar tu casa.', precio: 2500, stock: 10, categoria: 'artesanias', imagen: 'jaron.jpg' },
            { nombre: 'Cherrys picantes', descripcion: 'Cherrys picantes para los mas picantes.', precio: 3000, stock: 10, categoria: 'artesanias', imagen: 'cpiko.jpg' },
            { nombre: 'Pelero', descripcion: 'Perfecto para ubicar al lado de tu cama', precio: 3500, stock: 10, categoria: 'artesanias', imagen: 'pelero.jpg' },
            { nombre: 'Tela', descripcion: 'La mejor tela para tu casa.', precio: 4000, stock: 10, categoria: 'artesanias', imagen: 'tela.jpg' },
            { nombre: 'Mimbre', descripcion: 'Lo mejor para tu hogar.', precio: 4500, stock: 10, categoria: 'artesanias', imagen: 'mimbre.jpg' },
            { nombre: 'Mimbre Artesanal', descripcion: 'Todo tipo de artesania en mimbre.', precio: 4500, stock: 10, categoria: 'artesanias', imagen: 'mimbre1.jpg' },
            { nombre: 'Artesanía Decorativa', descripcion: 'Para decorar tu hogar.', precio: 4500, stock: 10, categoria: 'artesanias', imagen: 'artesania.jpg' },

            // Cuidado Personal
            { nombre: 'Crema', descripcion: 'Disfruta de las mejores mascarillas en nuestro local.', precio: 500, stock: 10, categoria: 'cuidado_personal', imagen: 'crema.jpg' },
            { nombre: 'Aceite', descripcion: 'Disfruta de los mejores aceites en nuestro local.', precio: 1000, stock: 10, categoria: 'cuidado_personal', imagen: 'aceitenatural.jpg' },
            { nombre: 'Shampoo', descripcion: 'Disfruta de los mejores shampoos en nuestro local.', precio: 2000, stock: 10, categoria: 'cuidado_personal', imagen: 'shampoo.jpg' },
            { nombre: 'Acondicionador Sólido', descripcion: 'Disfruta de los mejores acondicionadores sólidos en nuestro local.', precio: 3000, stock: 10, categoria: 'cuidado_personal', imagen: 'acondicionadorsolido.jpg' },
            { nombre: 'Desodorante', descripcion: 'Disfruta de los mejores desodorantes en nuestro local.', precio: 4000, stock: 10, categoria: 'cuidado_personal', imagen: 'desodorante.jpg' },
            { nombre: 'Crema Corporal', descripcion: 'Disfruta de las mejores cremas corporales en nuestro local.', precio: 5000, stock: 10, categoria: 'cuidado_personal', imagen: 'cremacorporal.jpg' }
        ];

        const stmt = db.prepare(`
            INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagen)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((productos) => {
            for (const producto of productos) {
                stmt.run(
                    producto.nombre,
                    producto.descripcion,
                    producto.precio,
                    producto.stock,
                    producto.categoria,
                    producto.imagen
                );
            }
        });

        insertMany(productos);
        console.log(`✅ ${productos.length} productos migrados correctamente`);
    }
}

// ============================================
// FUNCIONES HELPER
// ============================================

let userQueries, productQueries, orderQueries, orderItemQueries, contactQueries;

function initializeQueries() {
    // Usuarios
    userQueries = {
        create: db.prepare(`
            INSERT INTO users (nombre, email, password, telefono, direccion, rol)
            VALUES (?, ?, ?, ?, ?, ?)
        `),
        findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
        findById: db.prepare('SELECT * FROM users WHERE id = ?'),
        updatePassword: db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
        getAll: db.prepare('SELECT id, nombre, email, telefono, direccion, rol, created_at FROM users WHERE rol = ?')
    };

    // Productos
    productQueries = {
        getAll: db.prepare('SELECT * FROM products ORDER BY categoria, nombre'),
        getById: db.prepare('SELECT * FROM products WHERE id = ?'),
        getByCategory: db.prepare('SELECT * FROM products WHERE categoria = ? ORDER BY nombre'),
        create: db.prepare(`
            INSERT INTO products (nombre, descripcion, precio, stock, categoria, imagen)
            VALUES (?, ?, ?, ?, ?, ?)
        `),
        update: db.prepare(`
            UPDATE products 
            SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, imagen = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `),
        delete: db.prepare('DELETE FROM products WHERE id = ?'),
        updateStock: db.prepare('UPDATE products SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    };

    // Pedidos
    orderQueries = {
        create: db.prepare(`
            INSERT INTO orders (user_id, total, estado, nombre_cliente, email_cliente, telefono_cliente, direccion_cliente, mercadopago_id, mercadopago_status, comprobante, comprobante_nombre)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `),
        getById: db.prepare('SELECT * FROM orders WHERE id = ?'),
        getByUserId: db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'),
        getAll: db.prepare('SELECT * FROM orders ORDER BY created_at DESC'),
        updateStatus: db.prepare('UPDATE orders SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
        updateMercadoPago: db.prepare('UPDATE orders SET mercadopago_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    };

    // Items de pedidos
    orderItemQueries = {
        create: db.prepare(`
            INSERT INTO order_items (order_id, product_id, nombre_producto, precio, cantidad, subtotal)
            VALUES (?, ?, ?, ?, ?, ?)
        `),
        getByOrderId: db.prepare('SELECT * FROM order_items WHERE order_id = ?')
    };

    // Mensajes de contacto
    contactQueries = {
        create: db.prepare(`
            INSERT INTO contact_messages (nombre, email, mensaje)
            VALUES (?, ?, ?)
        `),
        getAll: db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC'),
        markAsRead: db.prepare('UPDATE contact_messages SET leido = 1 WHERE id = ?')
    };
}

// ============================================
// EXPORTAR
// ============================================

module.exports = {
    db,
    initializeDatabase,
    get userQueries() { return userQueries; },
    get productQueries() { return productQueries; },
    get orderQueries() { return orderQueries; },
    get orderItemQueries() { return orderItemQueries; },
    get contactQueries() { return contactQueries; }
};

