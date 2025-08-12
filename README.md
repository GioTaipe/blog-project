# 📝 BLOG APP

Una aplicación de blog completa con autenticación de usuarios, sistema de publicaciones, comentarios, likes, gestión de perfiles y almacenamiento de imágenes en la nube.

## 🚀 TECNOLOGÍAS UTILIZADAS

Backend: Node.js, Express.js ⚙️.

Autenticación: JSON Web Tokens (JWT) 🔐, bcryptjs.

Base de Datos: MongoDB (Mongoose) 🗃️.

Almacenamiento de Imágenes: Amazon AWS S3 ☁️.

Frontend: Vue 3 con Vuetify 🎨.

Lenguaje: JavaScript 📜.

## 🏗️ ARQUITECTURA

Arquitectura por capas modular para backend con Node.js y Express:

- **Config ⚙️**: Configuración global (variables de entorno, conexión a la base de datos, credenciales AWS).

- **Routes 🛣️**: Definición y agrupación de rutas/endpoints de la API.

- **Controllers 🎯**: Reciben las solicitudes HTTP, llaman a los servicios y devuelven la respuesta.

- **Middlewares 🛡️**: Validaciones, autenticación, manejo de errores y otras funciones intermedias.

- **Services 📦**: Lógica de negocio y orquestación entre repositorios y otras capas.

- **Repositories 🗄️**: Acceso a la base de datos a través de Mongoose.

- **Models 📑**: Definición de esquemas y modelos de datos.

- **Utils 🛠️**: Funciones auxiliares reutilizables en todo el proyecto.

Cada capa mantiene **bajo acoplamiento** y **alta cohesión**, facilitando la escalabilidad y el mantenimiento del sistema.

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
