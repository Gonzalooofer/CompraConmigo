<div align="center">
<img width="1200" height="475" alt="CompraConmigo Banner" src="https://lh3.googleusercontent.com/gg-dl/AOI_d_-UpinOCwsf1p_6R4YHN-fGHCsSDvReRomEv8m5g7JGuQVh3ImPXICpIgBhFlMcZYfyutlt4BXAOzTr1OLzH-XQlYFDwUuHqGqqERL3YAWhDszp6d5Pq94IWjNhuRB-6EasIinnjJpD_ZrWCH-xzvNFwas7BkRufMBGoWFqYepj4P2UDg=s1024-rj" />
</div>

# CompraConmigo

> Una plataforma para gestionar compras en grupo con comparación de precios, listas de la compra y división de gastos.

**CompraConmigo** es una aplicación full‑stack construida con React (Vite) en el frontend y Node.js/Express con MongoDB en el backend. El proyecto ofrece un entorno de desarrollo listo para usar y scripts de despliegue rápidos.

---

## 🔧 Requisitos previos

Antes de empezar, asegúrate de tener instalados los siguientes componentes:

- [Node.js (>=18)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (incluido con Node.js)
- [MongoDB](https://www.mongodb.com/) en ejecución en tu máquina local o en un servidor accesible

> **Nota:** La aplicación utiliza `mongodb://127.0.0.1:27017/compra_conmigo` por defecto. Puedes modificarlo a través de la variable de entorno `MONGO_URI`.

---

## 🚀 Instalación y ejecución local

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/CompraConmigo-main.git
   cd CompraConmigo-main
   ```

2. **Instala dependencias**
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**
   Crea un archivo `.env` en la raíz (opcional) con:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/compra_conmigo
   PORT=4000          # puerto de la API
   ```

4. **Inicia la API y el frontend**
   ```bash
   npm run dev:full
   ```

5. **Abre la aplicación**
   Navega a [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🛠 Estructura del proyecto

```
CompraConmigo-main/
├─ components/          # Componentes React reutilizables
├─ server/              # Código del backend (Express + Mongoose)
├─ services/            # Lógica de servicio compartida
├─ App.tsx              # Entrada principal del frontend
├─ index.tsx
├─ tsconfig.json
└─ package.json
```

---

## 📦 Scripts disponibles

| Script               | Descripción                                   |
|----------------------|-----------------------------------------------|
| `npm run dev:full`   | Inicia servidor y cliente en modo desarrollo  |
| `npm run dev:api`    | Inicia únicamente la API                      |
| `npm run dev:web`    | Inicia únicamente el frontend                 |
| `npm run build`      | Construye el frontend para producción         |
| `npm run start`      | Inicia la API desde la carpeta `dist/`        |

> Puedes editar o añadir más comandos en el `package.json` según necesidades.

---

## 🔐 Configuración

Las siguientes variables de entorno son soportadas:

| Variable     | Propósito                           | Valor por defecto                                 |
|--------------|-------------------------------------|--------------------------------------------------|
| `MONGO_URI`  | Cadena de conexión de MongoDB       | `mongodb://127.0.0.1:27017/compra_conmigo`       |
| `PORT`       | Puerto en el que corre la API       | `4000`                                           |

---

## 📁 Base de datos

El servidor utiliza Mongoose para interactuar con MongoDB. Algunos puntos clave:

- Se crea automáticamente la base de datos `compra_conmigo` al insertar documentos.
- Si deseas rescatar datos existentes o cambiar el host, modifica `MONGO_URI`.

---

## 🎯 Despliegue

1. Construye el frontend:
   ```bash
   npm run build
   ```
2. Copia la carpeta `dist/` generada al servidor o contenedor.
3. Instala dependencias en el servidor y establece variables de entorno.
4. Inicia la API con `npm start`.

> Para contenedores Docker u otros servicios PaaS, adapta estos pasos a la plataforma.

---

## 🧪 Testing y calidad

Actualmente el proyecto no incluye pruebas automatizadas, pero se recomienda agregar tests de unidad e integración utilizando herramientas como Jest o Vitest.

También puedes configurar linters (`eslint`, `prettier`) para mantener un estilo consistente.

---

## 🆘 Solución de problemas

- **Conexión a MongoDB fallida**: Verifica que el servicio esté activo y que `MONGO_URI` sea correcto.
- **Errores de compilación TypeScript**: Asegúrate de que tus dependencias estén actualizadas y ejecuta `npm run build` para más detalles.

---

## 📄 Licencia

MIT © [Tu Nombre](https://github.com/tu-usuario)

---

## 💡 Contribuciones

¡Todas las contribuciones son bienvenidas! Abre un _issue_ o _pull request_ siguiendo las pautas habituales.

Gracias por usar **CompraConmigo** 😄
