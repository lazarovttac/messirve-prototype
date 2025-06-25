# Mesirve - Prototipo

Este proyecto es un prototipo de sistema de gestión de reservas para restaurantes.

## Estructura del Proyecto

- `frontend/`: Aplicación Next.js para el frontend
- `backend/`: Servidor Node.js para el backend

## Firebase Configuration

Para conectar la aplicación con Firebase, crea un archivo `.env.local` en la carpeta `frontend/` con la siguiente configuración:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

Reemplaza los valores de ejemplo con tus credenciales reales de Firebase.

## Funcionalidades Implementadas

- Gestión de mesas (CRUD)
- Gestión de reservas (CRUD)
- Visualización de reservas por fecha
- Generación de datos de prueba

## Instalación

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o pnpm
- Cuenta de Firebase
- API Key de Google Gemini AI

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd "Mesirve - Prototipo"
```

### 2. Configurar el Backend

#### Instalar dependencias

```bash
cd backend
npm install
```

#### Configurar archivos de entorno

##### Archivo `.env`

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```env
# Puerto del servidor
PORT=7001

# API Key de Google Gemini AI
GEMINI_API_KEY=tu_api_key_de_gemini_aqui

# Configuración de Firebase
FIREBASE_SERVICE_ACCOUNT_KEY_PATH="./firebase_key.json"

# Configuración de Telegram Bot (si aplica)
TELEGRAM_BOT_TOKEN=tu_bot_token_aqui
```

##### Archivo `firebase_key.json`

Este archivo contiene las credenciales de servicio de Firebase. Para obtenerlo:

1. Ve a la [Consola de Firebase](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a "Configuración del proyecto" > "Cuentas de servicio"
4. Haz clic en "Generar nueva clave privada"
5. Descarga el archivo JSON y renómbralo a `firebase_key.json`
6. Colócalo en la carpeta `backend/`

**⚠️ IMPORTANTE**: Este archivo contiene información sensible y ya está incluido en `.gitignore`. Nunca lo subas al repositorio.

#### Ejecutar el backend

```bash
# Modo desarrollo (con recarga automática)
npm run dev

# O usando nodemon
npm run watch

# Modo producción
npm run build
npm start
```

El backend se ejecutará en `http://localhost:3001` (o el puerto configurado en `.env`).

### 3. Configurar el Frontend

#### Instalar dependencias

```bash
cd frontend
npm install
```

#### Configurar variables de entorno (opcional)

Si necesitas configurar variables de entorno para el frontend, crea un archivo `.env.local` en la carpeta `frontend/`:

```env
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:3001

# Otras variables públicas que necesites
NEXT_PUBLIC_FIREBASE_CONFIG=tu_config_aqui
```

#### Ejecutar el frontend

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

El frontend se ejecutará en `http://localhost:3000`.

## 🔧 Scripts Disponibles

### Backend

- `npm run dev` - Ejecuta el servidor en modo desarrollo con ts-node
- `npm run watch` - Ejecuta el servidor con nodemon (recarga automática)
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Ejecuta el servidor compilado

### Frontend

- `npm run dev` - Ejecuta Next.js en modo desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm start` - Ejecuta la aplicación en modo producción
- `npm run lint` - Ejecuta el linter

## 📁 Estructura del Proyecto

```
Mesirve - Prototipo/
├── backend/
│   ├── src/                 # Código fuente del backend
│   ├── firebase_key.json    # Credenciales de Firebase (no incluir en git)
│   ├── .env                 # Variables de entorno (no incluir en git)
│   └── package.json
├── frontend/
│   ├── app/                 # Páginas de Next.js
│   ├── components/          # Componentes React
│   ├── .env.local          # Variables de entorno del frontend (opcional)
│   └── package.json
└── README.md
```

## 🔐 Seguridad

- **Nunca subas** los archivos `.env`, `.env.local` o `firebase_key.json` al repositorio
- Estos archivos están incluidos en `.gitignore` para tu protección
- Mantén tus API keys y credenciales seguras
- En producción, usa variables de entorno del servidor en lugar de archivos

## 🛠️ Tecnologías Utilizadas

### Frontend

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Radix UI Components
- React Hook Form
- Zod (validación)

### Backend

- Node.js
- Express.js
- TypeScript
- Firebase Admin SDK
- Google Gemini AI
- Telegraf (Telegram Bot)
- CORS, Helmet (seguridad)

## 📝 Notas Adicionales

1. Asegúrate de que ambos servidores (frontend y backend) estén ejecutándose para que la aplicación funcione correctamente
2. El backend debe iniciarse antes que el frontend si hay dependencias entre ellos
3. Revisa los logs de la consola para cualquier error de configuración
4. Si tienes problemas con las dependencias, intenta eliminar `node_modules` y `package-lock.json`, luego ejecuta `npm install` nuevamente
