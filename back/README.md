# Contenido del archivo /online-store-backend/online-store-backend/README.md

# Proyecto Tienda Online

Este proyecto es un backend para una tienda online, construido con Node.js y Express. Utiliza MySQL como base de datos para almacenar la información de los productos.

## Estructura del Proyecto

```
online-store-backend
├── src
│   ├── controllers
│   │   └── productController.js
│   ├── models
│   │   └── productModel.js
│   ├── routes
│   │   └── productRoutes.js
│   ├── app.js
│   └── config
│       └── db.js
├── package.json
├── .env
└── README.md
```

## Requisitos

- Node.js
- MySQL

## Instalación

1. Clona el repositorio:
   ```
   git clone <URL_DEL_REPOSITORIO>
   ```
2. Navega al directorio del proyecto:
   ```
   cd online-store-backend
   ```
3. Instala las dependencias:
   ```
   npm install
   ```

## Configuración

1. Crea un archivo `.env` en la raíz del proyecto y agrega las siguientes variables:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=nombre_de_tu_base_de_datos
   ```

## Ejecución

Para iniciar el servidor, ejecuta el siguiente comando:
```
npm start
```

El servidor estará corriendo en `http://localhost:3000`.

## Endpoints

- `POST /productos`: Crear un nuevo producto.
- `GET /productos`: Obtener todos los productos.
- `GET /productos/:id`: Obtener un producto por ID.
- `PUT /productos/:id`: Actualizar un producto por ID.
- `DELETE /productos/:id`: Eliminar un producto por ID.

## Contribuciones

Las contribuciones son bienvenidas. Si deseas contribuir, por favor abre un issue o envía un pull request.

## Licencia

Este proyecto está bajo la Licencia MIT.