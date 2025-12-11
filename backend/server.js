// ============================================
// SERVER.JS - LA POSTA CAMPESINA
// Backend con integración de Mercado Pago y Autenticación
// ============================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Importar configuración de base de datos
const { initializeDatabase } = require('./database');

// Importar rutas
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const publicRoutes = require('./routes/public');

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// INICIALIZAR BASE DE DATOS
// ============================================
initializeDatabase();

// ============================================
// CONFIGURACIÓN DE MERCADO PAGO (v2.x)
// ============================================
const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
});

// ============================================
// MIDDLEWARES
// ============================================
app.use(cors({
    origin: ['http://localhost:5500', 'http://127.0.0.1:5500', process.env.FRONTEND_URL].filter(Boolean),
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// RUTAS
// ============================================

// Rutas públicas
app.use('/api', publicRoutes);

// Rutas de autenticación
app.use('/api/auth', authRoutes);

// Rutas de administrador
app.use('/api/admin', adminRoutes);

// Rutas de pedidos
app.use('/api/orders', orderRoutes);

// ============================================
// ENDPOINT: Crear preferencia de pago (MODIFICADO - requiere autenticación)
// ============================================
const { authenticateToken } = require('./middleware/auth');

app.post('/api/create-preference', authenticateToken, async (req, res) => {
    try {
        const { items, payer } = req.body;

        // Validar que vengan los items
        if (!items || items.length === 0) {
            return res.status(400).json({
                error: 'No se recibieron productos para procesar'
            });
        }

        console.log('📦 Creando preferencia para:', {
            productos: items.length,
            cliente: payer?.nombre || req.user.nombre
        });

        // Crear la preferencia de pago
        const preference = new Preference(client);

        const body = {
            items: items.map(item => ({
                title: item.nombre,
                unit_price: parseFloat(item.precio),
                quantity: parseInt(item.cantidad),
                currency_id: 'ARS',
                picture_url: item.imagen || undefined
            })),
            payer: {
                name: payer?.nombre || req.user.nombre,
                email: payer?.email || req.user.email,
                phone: {
                    area_code: '',
                    number: payer?.telefono || ''
                },
                address: {
                    street_name: payer?.direccion || '',
                    zip_code: ''
                }
            },
            back_urls: {
                success: `${process.env.FRONTEND_URL}/resultado.html?status=success`,
                failure: `${process.env.FRONTEND_URL}/resultado.html?status=failure`,
                pending: `${process.env.FRONTEND_URL}/resultado.html?status=pending`
            },
            notification_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/webhook`,
            statement_descriptor: 'La Posta Campesina',
            external_reference: `orden_${Date.now()}_user_${req.user.id}`,
            payment_methods: {
                excluded_payment_types: [],
                installments: 12
            }
        };

        // Crear la preferencia en Mercado Pago
        const response = await preference.create({ body });

        console.log('✅ Preferencia creada:', response.id);

        res.json({
            id: response.id,
            init_point: response.init_point,
            sandbox_init_point: response.sandbox_init_point
        });

    } catch (error) {
        console.error('❌ Error al crear preferencia:', error);
        res.status(500).json({
            error: 'Error al procesar la solicitud',
            details: error.message
        });
    }
});

// ============================================
// ENDPOINT: Webhook para notificaciones de MP
// ============================================
app.post('/api/webhook', async (req, res) => {
    try {
        const { type, data } = req.query;

        console.log('📩 Webhook recibido:', { type, data });

        // Solo procesar pagos
        if (type === 'payment') {
            const paymentId = data.id;

            // Consultar el estado del pago
            const payment = new Payment(client);
            const paymentData = await payment.get({ id: paymentId });

            console.log('💰 Estado del pago:', {
                id: paymentData.id,
                status: paymentData.status,
                status_detail: paymentData.status_detail,
                external_reference: paymentData.external_reference
            });

            // Actualizar estado del pedido en la base de datos
            if (paymentData.external_reference) {
                const { orderQueries } = require('./database');
                const orderId = paymentData.external_reference.split('_')[1];

                if (orderId) {
                    orderQueries.updateMercadoPago.run(paymentData.status, orderId);
                    console.log(`✅ Pedido ${orderId} actualizado con estado de MP: ${paymentData.status}`);
                }
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('❌ Error en webhook:', error);
        res.sendStatus(500);
    }
});

// ============================================
// ENDPOINT: Consultar estado de un pago
// ============================================
app.get('/api/payment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const payment = new Payment(client);
        const paymentData = await payment.get({ id });

        res.json({
            id: paymentData.id,
            status: paymentData.status,
            status_detail: paymentData.status_detail,
            transaction_amount: paymentData.transaction_amount,
            external_reference: paymentData.external_reference,
            payer: paymentData.payer
        });
    } catch (error) {
        console.error('❌ Error al consultar pago:', error);
        res.status(500).json({ error: 'Error al consultar el pago' });
    }
});

// ============================================
// ENDPOINT: Health check
// ============================================
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString(),
        mercadopago: process.env.MP_ACCESS_TOKEN ? 'Configurado' : 'No configurado',
        database: 'SQLite - Conectado'
    });
});

// ============================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error no manejado:', err);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🚀 SERVIDOR LA POSTA CAMPESINA - INICIADO EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`🔗 URL: http://localhost:${PORT}`);
    console.log(`💳 Mercado Pago: ${process.env.MP_ACCESS_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`🗄️  Base de Datos: ✅ SQLite Conectado`);
    console.log(`🌐 Frontend permitido: ${process.env.FRONTEND_URL || 'http://127.0.0.1:5500'}`);
    console.log('='.repeat(60));
    console.log('📍 Endpoints disponibles:');
    console.log('');
    console.log('   PÚBLICOS:');
    console.log(`   GET  http://localhost:${PORT}/api/products`);
    console.log(`   GET  http://localhost:${PORT}/api/products/:id`);
    console.log(`   POST http://localhost:${PORT}/api/contact`);
    console.log('');
    console.log('   AUTENTICACIÓN:');
    console.log(`   POST http://localhost:${PORT}/api/auth/register`);
    console.log(`   POST http://localhost:${PORT}/api/auth/login`);
    console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
    console.log(`   PUT  http://localhost:${PORT}/api/auth/change-password`);
    console.log(`   POST http://localhost:${PORT}/api/auth/logout`);
    console.log('');
    console.log('   PEDIDOS (requiere autenticación):');
    console.log(`   POST http://localhost:${PORT}/api/orders`);
    console.log(`   GET  http://localhost:${PORT}/api/orders/my-orders`);
    console.log(`   GET  http://localhost:${PORT}/api/orders/:id`);
    console.log('');
    console.log('   ADMIN (requiere rol admin):');
    console.log(`   GET  http://localhost:${PORT}/api/admin/products`);
    console.log(`   POST http://localhost:${PORT}/api/admin/products`);
    console.log(`   PUT  http://localhost:${PORT}/api/admin/products/:id`);
    console.log(`   DELETE http://localhost:${PORT}/api/admin/products/:id`);
    console.log(`   GET  http://localhost:${PORT}/api/admin/orders`);
    console.log(`   PUT  http://localhost:${PORT}/api/admin/orders/:id/status`);
    console.log(`   GET  http://localhost:${PORT}/api/admin/customers`);
    console.log(`   GET  http://localhost:${PORT}/api/admin/contacts`);
    console.log(`   GET  http://localhost:${PORT}/api/admin/stats`);
    console.log('');
    console.log('   MERCADO PAGO:');
    console.log(`   POST http://localhost:${PORT}/api/create-preference`);
    console.log(`   POST http://localhost:${PORT}/api/webhook`);
    console.log(`   GET  http://localhost:${PORT}/api/payment/:id`);
    console.log('');
    console.log('   UTILIDADES:');
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log('='.repeat(60));
    console.log('');
    console.log('👤 Usuario Admin por defecto:');
    console.log('   Email: admin@lapostacampesina.com');
    console.log('   Password: Admin123!');
    console.log('   ⚠️  CAMBIA ESTA CONTRASEÑA DESPUÉS DEL PRIMER LOGIN');
    console.log('='.repeat(60));
});
