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

### Autenticación con correo y contraseña

El sistema de autenticación ha sido ampliado para soportar registro/inicio con **email y contraseña**, acompañado de un código de verificación enviado por Gmail.

1. **Registro**
   - El usuario introduce email, contraseña y nombre (obligatorio).
   - Tras completar los datos se le ofrece configurar la **autenticación en dos pasos (2FA)**
     mediante QR/Google Authenticator; este paso es opcional y puede omitirse con un botón
     "Configurar más tarde", lo que permite continuar directamente al envío del código de verificación
     por email.
   - Si el correo no existe en la base de datos se crea un nuevo `User` con la contraseña
     almacenada como hash (bcrypt) y se genera un código de verificación válido 15 minutos.
   - El servidor intenta enviar dicho código al correo; si el envío falla la cuenta sigue siendo
     creada y el usuario podrá solicitar el código más tarde.
2. **Verificación**
   - Antes de acceder a la aplicación el usuario debe introducir el código recibido.
   - El modal de autenticación (`components/AuthModal.tsx`) muestra un botón **Reenviar código**
     que queda deshabilitado durante 60 s tras cada envío.
3. **Inicio de sesión posterior**
   - Una vez verificado, el usuario puede iniciar sesión con email y contraseña.
   - Si la contraseña es incorrecta se muestra un error; si el correo no estuviera verificado,
     se reenvía automáticamente un código.
   - El flujo de “olvidé mi contraseña” no está implementado en este cambio, pero el usuario siempre
     puede iniciar sesión mediante el código si no recuerda la contraseña.

El campo `email` del modelo `User` se mantiene opcional para no afectar a los usuarios existentes.

#### Rutas nuevas del API
- `POST /api/auth/register` – {name,email,password} crea la cuenta y envía código.
- `POST /api/auth/login` – {email,password} autentica si está verificado.
- `POST /api/auth/verify` – {email,code} marca como verificado y devuelve el usuario.
- `POST /api/auth/resend` – {email} genera y envía un nuevo código (límite 1/minuto).

#### Configuración de entorno
En `server/.env` (no se hace commit) deben definirse al menos:

```env
MONGO_URI=mongodb://…
PORT=5000

# credenciales de Gmail usadas para enviar los códigos
GMAIL_USER=tu_cuenta@gmail.com
GMAIL_PASS=tu_app_password_o_contraseña

# url pública donde se sirve el frontend (usada en invitaciones y emails)
# por ejemplo https://app.tudominio.com
FRONTEND_URL=https://mi-dominio.com
```

> Si `FRONTEND_URL` no está definido las URLs por defecto apuntan a `http://localhost:5173`.

Los correos de verificación ahora incluyen un enlace directo que abre la aplicación y
rellena el código automáticamente para mejorar la experiencia del usuario.

> Gmail suele rechazar intentos de envío si no se permiten aplicaciones menos seguras.
> Utiliza un *app password* desde la cuenta de Google y asegúrate de que el acceso SMTP
> esté habilitado.

#### Dependencias adicionales
Desde el directorio `server` instala:

```bash
npm install
npm install nodemailer bcrypt
npm install -D @types/nodemailer @types/bcrypt
```

Esto añade `nodemailer` (para enviar emails) y `bcrypt` (para proteger contraseñas).

#### Notas de implementación
- Todo el código relacionado está dentro de `server/src/routes/auth.ts` y `components/AuthModal.tsx`.
- El resto de la aplicación (CRUD de usuarios, grupos, listas, etc.) es compatible y no se ha tocado.

---

El texto anterior se conserva como referencia histórica, pero el flujo actual ya no se basa solo en
un simple nombre.
