# Blog App

Aplicacion de blog full-stack con autenticacion de usuarios, publicaciones con imagenes, comentarios, likes, perfiles personalizables y almacenamiento de imagenes en la nube con Cloudinary.

## Tecnologias

### Backend
- **Node.js** + **Express.js** — servidor y API REST
- **MongoDB** + **Mongoose** — base de datos NoSQL y ODM
- **JWT** (jsonwebtoken) — autenticacion stateless
- **bcryptjs** — hash de contrasenas
- **Cloudinary** — almacenamiento de imagenes en la nube
- **express-fileupload** — manejo de archivos en requests
- **express-validator** — validacion de datos de entrada
- **Jest** + **Supertest** + **mongodb-memory-server** — testing

### Frontend
- **Vue 3** — framework reactivo (Composition API)
- **Vuetify 3** — componentes Material Design
- **Pinia** — estado global
- **Vue Router** — enrutamiento con file-based routing (`unplugin-vue-router`)
- **Axios** — cliente HTTP con interceptores para JWT
- **Vite** — build tool

## Arquitectura

### Backend — Arquitectura por capas

```
Routes → Controllers → Services → Repositories → Models
```

| Capa | Responsabilidad |
|------|----------------|
| **Routes** | Definicion de endpoints y asignacion de middlewares |
| **Controllers** | Reciben requests HTTP, delegan al service y devuelven la response |
| **Services** | Logica de negocio (upload de imagenes, toggle de likes, orquestacion) |
| **Repositories** | Queries a MongoDB a traves de Mongoose, aislados de la logica de negocio |
| **Models** | Schemas de Mongoose con pre-hooks (hash de passwords, cascade deletes) |
| **Middlewares** | Autenticacion (JWT), validacion de datos, manejo global de errores |
| **Utils** | Funciones auxiliares: `asyncHandler` para manejo de errores async, integracion con Cloudinary |

Cada capa mantiene bajo acoplamiento y alta cohesion. Los errores async se propagan automaticamente al middleware global de errores a traves de `asyncHandler`.

### Frontend — Estructura

```
Pages → Components → Stores (Pinia) → API (Axios) → Backend
```

| Capa | Responsabilidad |
|------|----------------|
| **Pages** | Vistas principales: Login, Posts (feed), Profile, PublicProfile |
| **Components** | UI reutilizable: Navbar, AppFooter, UserSearch |
| **Stores** | `authStore` (sesion, token, perfil) y `postStore` (feed, likes, comentarios) |
| **API** | Modulos por recurso (`auth.js`, `posts.js`, `comments.js`, `user.js`) sobre una instancia Axios compartida |

- **File-based routing**: las rutas se generan automaticamente desde `src/pages/` con `unplugin-vue-router`
- **Interceptores Axios**: inyectan el token JWT en cada request y ejecutan logout automatico en respuestas 401
- **Guards de ruta**: rutas protegidas con `meta: { requiresAuth: true }` redirigen a `/login` si no hay sesion

## API Endpoints

Todos los endpoints estan bajo el prefijo `/api`.

### Usuarios (`/api/users`)

| Metodo | Ruta | Auth | Descripcion |
|--------|------|:----:|-------------|
| POST | `/register` | No | Registro de usuario |
| POST | `/login` | No | Inicio de sesion (devuelve JWT) |
| GET | `/` | No | Obtener todos los usuarios |
| GET | `/search` | No | Buscar usuarios por nombre |
| GET | `/me` | Si | Obtener perfil del usuario autenticado |
| PUT | `/me` | Si | Actualizar datos del perfil |
| PUT | `/me/profile-image` | Si | Actualizar foto de perfil |
| PUT | `/me/banner-image` | Si | Actualizar banner del perfil |
| DELETE | `/me` | Si | Eliminar cuenta |
| GET | `/:id` | No | Ver perfil publico de un usuario |

### Posts (`/api/posts`)

| Metodo | Ruta | Auth | Descripcion |
|--------|------|:----:|-------------|
| POST | `/createPost` | Si | Crear publicacion (texto y/o imagen) |
| GET | `/getAllPost` | No | Obtener todas las publicaciones |
| GET | `/my` | Si | Obtener posts del usuario autenticado |
| GET | `/user/:userId` | No | Obtener posts de un usuario especifico |
| DELETE | `/:id` | Si | Eliminar publicacion propia |
| POST | `/:id/like` | Si | Dar/quitar like a un post |

### Comentarios (`/api/comments`)

| Metodo | Ruta | Auth | Descripcion |
|--------|------|:----:|-------------|
| POST | `/createComment/:id` | Si | Crear comentario en un post |
| DELETE | `/:id` | Si | Eliminar comentario propio |

## Modelos de datos

### User
```
name, email, password, bio, profileImage, bannerImage, role (user/admin)
```
- Password se hashea automaticamente con bcrypt en pre-save
- Al eliminar un usuario se eliminan en cascada todos sus posts (y sus comentarios)

### Post
```
content, fileUrl, authorId (ref: User), likes [ref: User]
```
- Virtual `comments` para popular comentarios asociados
- Al eliminar un post se eliminan en cascada todos sus comentarios

### Comment
```
content, author (ref: User), post (ref: Post)
```

## Funcionalidades

- **Autenticacion**: registro, login con JWT, persistencia de sesion en localStorage
- **Perfil personalizable**: foto de perfil, banner, bio, edicion de datos
- **Publicaciones**: crear posts con texto y/o imagen, feed general, feed por usuario
- **Likes**: toggle de like/unlike en cada post
- **Comentarios**: comentar en publicaciones, eliminar comentarios propios
- **Busqueda de usuarios**: buscar por nombre desde la barra de navegacion
- **Perfiles publicos**: ver el perfil y posts de otros usuarios
- **Cascade deletes**: eliminar usuario elimina sus posts, eliminar post elimina sus comentarios
- **Subida de imagenes**: almacenamiento en Cloudinary (posts, perfil, banner)

## Instalacion

### Requisitos previos
- Node.js (v18+)
- MongoDB (local o Atlas)
- Cuenta de Cloudinary

### Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en `backend/`:

```env
URL_MONGO=mongodb://localhost:27017
DATABASE_NAME=blog
SECRET_KEY=tu_clave_secreta_jwt
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

```bash
npm start         # Inicia el servidor en el puerto 3001
```

### Frontend

```bash
cd frontend/vuetify-project
npm install
```

Crear archivo `.env` en `frontend/vuetify-project/`:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

```bash
npm run dev       # Inicia el dev server en el puerto 3000
```

## Testing

Los tests usan Jest + Supertest con una base de datos MongoDB en memoria (`mongodb-memory-server`). Cloudinary se mockea con `jest.mock()`.

```bash
cd backend
npm test                                    # Ejecutar todos los tests en watch mode
npx jest src/tests/auth.test.js --verbose   # Ejecutar un test especifico
```

Archivos de test:
- `auth.test.js` — registro, login, perfil, busqueda de usuarios
- `post.test.js` — CRUD de posts, likes, posts por usuario
- `comment.test.js` — crear/eliminar comentarios con verificacion de autorizacion
