<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e_rxfIumHhpM6o6a6CmMYI0dezC8nHYt

## Run Locally

**Prerequisites:**
- Node.js
- MongoDB ejecutándose en `mongodb://localhost:27017`

1. Instala dependencias:
   `npm install`
2. Arranca la API + frontend:
   `npm run dev:full`
3. Abre la app en:
   `http://localhost:3000`

### Base de datos

- Por defecto, la API usa `mongodb://127.0.0.1:27017/compra_conmigo`.
- Si quieres cambiarla, define `MONGO_URI` antes de arrancar la API.

