<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1e_rxfIumHhpM6o6a6CmMYI0dezC8nHYt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

---

## Despliegue en AWS

Este proyecto está configurado para desplegarse fácilmente en AWS usando dos métodos principales:

### Opción 1: AWS Amplify (Recomendado para Frontend)
1. Conecta tu repositorio de GitHub/GitLab a **AWS Amplify**.
2. Amplify detectará automáticamente el archivo `amplify.yml`.
3. Configura la variable de entorno `VITE_GEMINI_API_KEY` en la consola de Amplify.
4. ¡Listo! El despliegue será automático en cada commit.

### Opción 2: AWS App Runner o ECS (Docker)
1. El proyecto incluye un `Dockerfile` y `nginx.conf`.
2. Sube la imagen a **Amazon ECR**.
3. Despliega en **AWS App Runner** o **Amazon ECS**.
4. Recuerda pasar la variable `VITE_GEMINI_API_KEY` durante el proceso de build.

### Notas sobre Variables de Entorno
Para que las variables de entorno funcionen en el cliente:
- Deben empezar con `VITE_` (ej. `VITE_GEMINI_API_KEY`).
- Se acceden mediante `import.meta.env.VITE_GEMINI_API_KEY`.


