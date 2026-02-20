<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CompraConmigo

**CompraConmigo** es una aplicación colaborativa para crear y comparar listas de compra en grupo. Está construida con **React + Vite** en el frontend y **Express + MongoDB** en el backend, y ofrece funciones como:

- Registro/login con email y contraseña + verificación por Gmail.
- Autenticación multifactor (2FA) opcional, con posibilidad de configurar más tarde.
- Gestión de grupos, invitaciones y chat interno.
- Compartir y comparar listas de compras entre miembros.
- Generación de códigos de respaldo y opción de recordar sesión.

La aplicación está desplegada en AWS; estos documentos cubren cómo levantarla localmente y cómo actualizar el código en el servidor.

---

## 🛠️ Desarrollo local

### Requisitos previos
- Node.js 18+ (LTS recomendado)
- MongoDB (local o Atlas)
- Cuenta de Gmail para el envío de correos (utiliza _app password_).

### Frontend
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Configura variables opcionales en `.env.local`:
   ```env
   VITE_API_BASE=http://localhost:5000/api
   GEMINI_API_KEY=…
   ```
3. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Backend
1. Entra en la carpeta `server`:
   ```bash
   cd server
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Crea un `.env` basado en `server/.env.example` con al menos:
   ```env
   MONGO_URI=mongodb://…
   PORT=5000
   GMAIL_USER=tu@gmail.com
   GMAIL_PASS=app_password
   ```
4. Inicia el servidor con recarga automática:
   ```bash
   npm run dev
   ```
5. El API escuchará en `http://localhost:5000` por defecto. Asegúrate de que el frontend apunta a esa URL.

---

## 🔐 Autenticación y 2FA

El proceso de registro e inicio de sesión está centralizado en `components/AuthModal.tsx`. Algunas notas clave:

- **Verificación de correo:** obligatorio. Se envía un código al correo que debe introducirse antes de continuar.
- **2FA:** se ofrece un paso adicional durante el registro para configurar un autenticador. Durante el registro el usuario verá una pregunta "¿Quieres configurar 2FA ahora?" y podrá elegir entre configurarlo inmediatamente o continuar sin él; en cualquier caso el flujo de verificación por email es obligatorio. Si desea activar 2FA después, podrá hacerlo desde **Ajustes → Seguridad**.
- El servidor genera secreto y códigos de respaldo al llamar a `POST /api/2fa/setup`, pero la cuenta no queda protegida hasta verificar (`POST /api/2fa/verify`).

Rutas relevantes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/verify`
- `POST /api/auth/resend`
- `POST /api/2fa/setup`
- `POST /api/2fa/verify`

---

## ☁️ Despliegue en AWS

La aplicación se ejecuta en una instancia EC2 (o similar) con Node.js y MongoDB conectada. Para actualizar el código en producción sigue estos pasos:

1. **Conecta al servidor:**
   ```bash
   ssh -i /ruta/tu-clave.pem ec2-user@tu-servidor.amazonaws.com
   ```
2. **Ve al directorio de la app:**
   ```bash
   cd /home/ec2-user/CompraConmigo
   ```
3. **Trae los últimos cambios de Git:**
   ```bash
   git fetch origin main
   git reset --hard origin/main
   ```
4. **Instala dependencias y construye:**
   ```bash
   npm install          # o npm ci para instalación limpia
   npm run build        # genera la versión de producción del frontend
   cd server && npm install
   ```
5. **Reinicia los servicios:**
   - Si usas `pm2`:
     ```bash
     pm2 reload all
     ```
   - Si corres manualmente, para y vuelve a iniciar los procesos de Node.

> Alternativamente, si la app está containerizada, actualiza la imagen y despliega mediante ECS/ECR o Docker directamente.

### Variables de entorno en AWS
Asegúrate de que las variables (`MONGO_URI`, `GMAIL_USER`, `GMAIL_PASS`, etc.) siguen presentes. Puedes exportarlas en el script de arranque (`.bashrc`/`.profile`) o gestionarlas vía `pm2 ecosystem.config.js`.


### Cargas de imagen de perfil

La aplicación ahora permite subir un fichero de imagen para el avatar del usuario en lugar de
usar cadenas `data:` en base64. Para que esto funcione necesitas instalar `multer` en el servidor:

```bash
cd server
npm install multer
npm install --save-dev @types/multer
```

El backend guarda los archivos en `uploads/avatars` y los sirve mediante `/uploads/...`.
El cliente pedirá primero la carga y luego actualizará el resto de datos del usuario.

También se ha mejorado el componente de edición de perfil para que toda el área del avatar sea
clicable y el campo de fichero acepte imágenes y envíe los datos al nuevo endpoint.


---

## 📄 Licencia & Créditos
- Proyecto open‑source bajo [MIT](LICENSE).
- Iconos de *lucide‑react*, diseño inspirado en [Tailwind UI](https://tailwindui.com/).

---

Para más detalles técnicos consulta los comentarios en el código o contáctame por email.
