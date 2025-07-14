📝 Blog Project
Un blog donde los usuarios pueden registrarse, iniciar sesión, crear publicaciones con imágenes, comentar y dar likes.
Incluye gestión de perfil y almacenamiento de imágenes en la nube.

🚀 Tecnologías utilizadas
🛠️ Backend
Node.js + Express

JWT (JSON Web Tokens) para autenticación

bcryptjs para el hash de contraseñas

AWS S3 para almacenar imágenes

MongoDB + Mongoose

API REST

🎨 Frontend
Vue 3

Vuetify (UI components)

JavaScript

✨ Funcionalidades principales
✅ Registro y login de usuarios (JWT)
✅ Sección POST: crear publicaciones, subir imágenes, dar likes, comentar publicaciones de otros usuarios
✅ Sección PROFILE: ver datos personales (nombre, email, foto), editar datos, gestionar y eliminar publicaciones propias
✅ LOGOUT para cerrar sesión de manera segura
✅ Almacenamiento de imágenes de publicaciones en AWS S3
✅ Passwords encriptadas con bcryptjs
✅ Las rutas del frontend están protegidas con Vue Router y guards para permitir solo el acceso de usuarios autenticados
