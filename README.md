# 📝 BLOG APP

Una aplicación de blog completa con autenticación de usuarios, sistema de publicaciones, comentarios, likes, gestión de perfiles y almacenamiento de imágenes en la nube.

## 🚀 TECNOLOGÍAS UTILIZADAS

Backend: Node.js, Express.js ⚙️.

Autenticación: JSON Web Tokens (JWT) 🔐, bcryptjs.

Base de Datos: MongoDB (Mongoose) 🗃️.

Almacenamiento de Imágenes: Amazon AWS S3 ☁️.

Frontend: Vue 3 con Vuetify 🎨.

Arquitectura: API RESTful 🌐.

Lenguaje: JavaScript 📜.

## ✨ CARACTERÍSTICAS

**🔑 AUTENTICACIÓN DE USUARIOS**

Registro de usuarios con nombre, correo y contraseña.

Login seguro usando JWT y bcryptjs.

Logout y persistencia de sesión.

**🙍‍♂️ PERFIL DE USUARIO**

Ver información del perfil: nombre, email, foto.

Editar información personal y foto de perfil.

Ver y eliminar publicaciones propias.

**📝 PUBLICACIONES**

Crear publicaciones contenido y foto (opcional).

Almacenamiento de imágenes en AWS S3.

Listado de publicaciones.

Eliminar comentarios propios

**💬 INTERACCIÓN SOCIAL**

Comentar publicaciones de otros usuarios.

Dar y quitar likes ❤️.

## ⚙️ Configuración

Para ejecutar la API se requiere un archivo de entorno. Puedes usar el archivo
`backend/.env.example` como referencia y renombrarlo a `.env` dentro de la
carpeta `backend`. Asegúrate de definir `AWS_SECRET_ACCESS_KEY` junto con el
resto de variables necesarias.
