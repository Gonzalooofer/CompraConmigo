<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e_rxfIumHhpM6o6a6CmMYI0dezC8nHYt

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies for the frontend:
   ```bash
   npm install
   ```
2. (Optional) set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Start the frontend:
   ```bash
   npm run dev
   ```

---

## Backend

A simple Express/Mongoose API lives in the `server/` folder. It exposes CRUD endpoints for users, groups, items and settlements and stores data in MongoDB.

### Setup

1. Go into the server directory:
   ```bash
   cd server
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (there is an example in `server/.env`) and set `MONGO_URI` to your MongoDB connection string.
4. Run the development server with automatic reload:
   ```bash
   npm run dev
   ```
   The API will listen on `http://localhost:5000` by default.

### Notes

- The frontend is configured to call the API base URL from `VITE_API_BASE`. You can override this in an `.env` file at the project root (e.g. `VITE_API_BASE=http://localhost:5000/api`).
- All data fetched via the API replaces the previous mock/localStorage implementation.

### Email‑based authentication

Se ha añadido soporte para registro e inicio de sesión mediante un código enviado a través de
Gmail. Para habilitarlo hay que configurar las credenciales de correo en el backend:

```env
GMAIL_USER=tu_cuenta@gmail.com
GMAIL_PASS=tu_contraseña_o_app_password
```

Instala el paquete `nodemailer` en el subdirectorio `server`:

```bash
cd server
npm install nodemailer
npm install -D @types/nodemailer
```

El servidor ofrece nuevas rutas bajo `/api/auth` (`register`, `login`, `verify`) y gestiona
la lógica de envío del código y verificación. El campo `email` del modelo `User` es opcional
para usuarios creados manualmente, pero los que pasan por el flujo de correo deben tenerlo.

En el frontend la interacción se realiza en el modal de autenticación (`components/AuthModal.tsx`),
que ahora pide correo (y nombre opcional) y después el código recibido. La experiencia principal
(y la base de datos Mongo) siguen funcionando igual para el resto de la aplicación.
