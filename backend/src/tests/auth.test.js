const request = require('supertest');
const app = require('../app');
const dbHandler = require('./db-handler');
const User = require('../models/users');
const jwt = require('jsonwebtoken');

const cloudinary = require('../utils/cloudinary');
jest.mock('../utils/cloudinary');

describe('Auth API - Tests de Integración', () => {
    let token;
    let userId;

    beforeAll(async () => await dbHandler.connect());
    afterEach(async () => await dbHandler.clearDatabase());
    afterAll(async () => await dbHandler.closeDatabase());

    describe('POST /api/users/register', () => {
        it('Debería registrar un usuario exitosamente', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'New User',
                    email: 'new@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body.user).toHaveProperty('email', 'new@test.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('Debería fallar con email duplicado', async () => {
            await User.create({
                name: 'Existing',
                email: 'existing@test.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Duplicate',
                    email: 'existing@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
        });

        it('Debería fallar sin email', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'No Email',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
        });

        it('Debería fallar sin password', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'No Password',
                    email: 'nopass@test.com'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/users/login', () => {
        beforeEach(async () => {
            const user = await User.create({
                name: 'Gio Test',
                email: 'gio@test.com',
                password: 'password123'
            });
            userId = user._id;
            token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);
        });

        it('Debería iniciar sesión con éxito y devolver un token', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'gio@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user).toHaveProperty('email', 'gio@test.com');
            expect(res.body.user).not.toHaveProperty('password');
        });

        it('Debería rechazar el acceso con una contraseña incorrecta', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'gio@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Credenciales incorrectas');
        });

        it('Debería fallar con email inexistente', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'notexist@test.com',
                    password: 'password123'
                });

            expect(res.statusCode).toBe(401);
        });

        it('Debería fallar sin email', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    password: 'password123'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/users/me', () => {
        beforeEach(async () => {
            const user = await User.create({
                name: 'Me User',
                email: 'me@test.com',
                password: 'password123'
            });
            userId = user._id;
            token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);
        });

        it('Debería obtener datos del usuario autenticado', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('email', 'me@test.com');
            expect(res.body).not.toHaveProperty('password');
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app).get('/api/users/me');

            expect(res.statusCode).toBe(401);
        });

        it('Debería fallar con token inválido', async () => {
            const res = await request(app)
                .get('/api/users/me')
                .set('Authorization', 'Bearer invalidtoken');

            expect(res.statusCode).toBe(403);
        });
    });

    describe('PUT /api/users/me', () => {
        beforeEach(async () => {
            const user = await User.create({
                name: 'Update User',
                email: 'update@test.com',
                password: 'password123'
            });
            userId = user._id;
            token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);
        });

        it('Debería actualizar el nombre del usuario', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Nuevo Nombre' });

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('name', 'Nuevo Nombre');
        });

        it('Debería actualizar el email del usuario', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'newemail@test.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('email', 'newemail@test.com');
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app)
                .put('/api/users/me')
                .send({ name: 'Nuevo Nombre' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/users/me', () => {
        beforeEach(async () => {
            const user = await User.create({
                name: 'Delete User',
                email: 'delete@test.com',
                password: 'password123'
            });
            userId = user._id;
            token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);
        });

        it('Debería eliminar el usuario autenticado', async () => {
            const res = await request(app)
                .delete('/api/users/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);

            const deletedUser = await User.findById(userId);
            expect(deletedUser).toBeNull();
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app).delete('/api/users/me');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/users/', () => {
        beforeEach(async () => {
            await User.create({ name: 'User 1', email: 'user1@test.com', password: 'password' });
            await User.create({ name: 'User 2', email: 'user2@test.com', password: 'password' });
        });

        it('Debería obtener todos los usuarios', async () => {
            const res = await request(app).get('/api/users/');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(2);
        });
    });

    describe('GET /api/users/search', () => {
        beforeEach(async () => {
            await User.create({ name: 'Giovanni Rossi', email: 'giovanni@test.com', password: 'password' });
            await User.create({ name: 'Maria Garcia', email: 'maria@test.com', password: 'password' });
            await User.create({ name: 'Pedro Gomez', email: 'pedro@test.com', password: 'password' });
        });

        it('Debería buscar usuarios por nombre', async () => {
            const res = await request(app).get('/api/users/search?q=Giovanni');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Giovanni Rossi');
        });

        it('Debería devolver array vacío si no hay coincidencias', async () => {
            const res = await request(app).get('/api/users/search?q=XYZ123');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });

        it('Debería ser case insensitive', async () => {
            const res = await request(app).get('/api/users/search?q=maria');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(1);
            expect(res.body[0].name).toBe('Maria Garcia');
        });

        it('Debería devolver array vacío con query vacía', async () => {
            const res = await request(app).get('/api/users/search?q=');

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveLength(0);
        });
    });

    describe('GET /api/users/:id', () => {
        let publicUserId;

        beforeEach(async () => {
            const user = await User.create({ 
                name: 'Public User', 
                email: 'public@test.com', 
                password: 'password',
                bio: 'Esta es mi biografía',
                profileImage: 'http://example.com/image.jpg'
            });
            publicUserId = user._id;
        });

        it('Debería obtener perfil público de un usuario', async () => {
            const res = await request(app).get(`/api/users/${publicUserId}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('name', 'Public User');
            expect(res.body).toHaveProperty('bio', 'Esta es mi biografía');
            expect(res.body).toHaveProperty('profileImage', 'http://example.com/image.jpg');
            expect(res.body).not.toHaveProperty('password');
            expect(res.body).not.toHaveProperty('email');
        });

        it('Debería devolver 404 para usuario inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const res = await request(app).get(`/api/users/${fakeId}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/users/me/profile-image', () => {
        let token;
        let userId;

        beforeEach(async () => {
            const user = await User.create({
                name: 'Profile Image User',
                email: 'profileimg@test.com',
                password: 'password123',
                profileImage: 'http://res.cloudinary.com/demo/image/upload/v1234/BLOG/IMAGES-PROFILE/abc123.jpg'
            });
            userId = user._id;
            token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);
            cloudinary.deleteFile.mockResolvedValue({ result: 'ok' });
            cloudinary.extractPublicId.mockReturnValue('BLOG/IMAGES-PROFILE/abc123');
        });

        it('Debería eliminar la foto de perfil del usuario', async () => {
            const res = await request(app)
                .delete('/api/users/me/profile-image')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Foto de perfil eliminada con éxito');
            expect(res.body.user.profileImage).toBe('');

            const updatedUser = await User.findById(userId);
            expect(updatedUser.profileImage).toBe('');
        });

        it('Debería llamar a deleteFile de Cloudinary', async () => {
            await request(app)
                .delete('/api/users/me/profile-image')
                .set('Authorization', `Bearer ${token}`);

            expect(cloudinary.deleteFile).toHaveBeenCalled();
        });

        it('Debería fallar si el usuario no tiene foto de perfil', async () => {
            await User.findByIdAndUpdate(userId, { profileImage: '' });

            const res = await request(app)
                .delete('/api/users/me/profile-image')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(400);
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app)
                .delete('/api/users/me/profile-image');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('PUT /api/users/me/banner-image', () => {
        let token;

        beforeEach(async () => {
            const user = await User.create({
                name: 'Banner User',
                email: 'banner@test.com',
                password: 'password123'
            });
            token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);
            cloudinary.uploadFile.mockResolvedValue('https://fake-url.com/img.jpg');
        });

        it('Debería actualizar la imagen del banner', async () => {
            const res = await request(app)
                .put('/api/users/me/banner-image')
                .set('Authorization', `Bearer ${token}`)
                .attach('bannerImage', Buffer.from('fake-image-data'), 'test-image.png');

            expect(res.statusCode).toBe(200);
            expect(res.body.user).toHaveProperty('bannerImage', 'https://fake-url.com/img.jpg');
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app)
                .put('/api/users/me/banner-image')
                .attach('bannerImage', Buffer.from('fake-image-data'), 'test-image.png');

            expect(res.statusCode).toBe(401);
        });
    });
});
