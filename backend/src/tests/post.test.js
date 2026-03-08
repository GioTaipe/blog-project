const request = require('supertest');
const app = require('../app');
const dbHandler = require('./db-handler');
const User = require('../models/users');
const Post = require('../models/post');
const jwt = require('jsonwebtoken');

const cloudinary = require('../utils/cloudinary');
jest.mock('../utils/cloudinary');

describe('Posts API - Tests de Integración', () => {
    let token;
    let userId;
    let otherUserToken;
    let otherUserId;

    beforeAll(async () => {
        await dbHandler.connect();
        
        const user = await User.create({
            name: 'Post Creator',
            email: 'creator@test.com',
            password: 'password123'
        });
        userId = user._id;
        token = jwt.sign({ _id: user._id, email: user.email }, process.env.SECRET_KEY);

        const otherUser = await User.create({
            name: 'Other User',
            email: 'other@test.com',
            password: 'password123'
        });
        otherUserId = otherUser._id;
        otherUserToken = jwt.sign({ _id: otherUser._id, email: otherUser.email }, process.env.SECRET_KEY);
        
        cloudinary.uploadFile.mockResolvedValue('https://fake-url.com/img.jpg');
    });

    afterEach(async () => await Post.deleteMany({}));
    afterAll(async () => {
        await User.deleteMany({});
        await dbHandler.closeDatabase();
    });

    describe('POST /api/posts/createPost', () => {
        it('Debería crear un post con texto e imagen', async () => {
            const res = await request(app)
                .post('/api/posts/createPost')
                .set('Authorization', `Bearer ${token}`)
                .field('content', 'Este es un post de prueba con imagen')
                .attach('image', Buffer.from('fake-image-data'), 'test-image.png');

            expect(res.statusCode).toBe(201);
            expect(res.body.post).toHaveProperty('fileUrl', 'https://fake-url.com/img.jpg');
            expect(res.body.post).toHaveProperty('content', 'Este es un post de prueba con imagen');
        });

        it('Debería crear un post solo con texto', async () => {
            const res = await request(app)
                .post('/api/posts/createPost')
                .set('Authorization', `Bearer ${token}`)
                .field('content', 'Solo texto sin imagen');

            expect(res.statusCode).toBe(201);
            expect(res.body.post).toHaveProperty('content', 'Solo texto sin imagen');
        });

        it('Debería crear un post solo con imagen', async () => {
            const res = await request(app)
                .post('/api/posts/createPost')
                .set('Authorization', `Bearer ${token}`)
                .attach('image', Buffer.from('fake-image-data'), 'test-image.png');

            expect(res.statusCode).toBe(201);
            expect(res.body.post).toHaveProperty('fileUrl', 'https://fake-url.com/img.jpg');
        });

        it('Debería fallar si no hay ni texto ni imagen', async () => {
            const res = await request(app)
                .post('/api/posts/createPost')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.errors[0].msg).toBe('Debes proporcionar al menos un texto o una imagen para publicar.');
        });

        it('Debería fallar sin token de autorización', async () => {
            const res = await request(app)
                .post('/api/posts/createPost')
                .field('content', 'Test');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/posts/getAllPost', () => {
        it('Debería obtener todos los posts', async () => {
            await Post.create({ authorId: userId, content: 'Post 1' });
            await Post.create({ authorId: userId, content: 'Post 2' });

            const res = await request(app).get('/api/posts/getAllPost');

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.posts).toHaveLength(2);
        });

        it('Debería devolver array vacío si no hay posts', async () => {
            const res = await request(app).get('/api/posts/getAllPost');

            expect(res.statusCode).toBe(200);
            expect(res.body.posts).toHaveLength(0);
        });
    });

    describe('GET /api/posts/my', () => {
        it('Debería obtener solo los posts del usuario autenticado', async () => {
            await Post.create({ authorId: userId, content: 'My Post 1' });
            await Post.create({ authorId: userId, content: 'My Post 2' });
            await Post.create({ authorId: otherUserId, content: 'Other User Post' });

            const res = await request(app)
                .get('/api/posts/my')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.posts).toHaveLength(2);
            expect(res.body.posts.every(p => p.authorId._id.toString() === userId.toString())).toBe(true);
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app).get('/api/posts/my');

            expect(res.statusCode).toBe(401);
        });
    });

    describe('DELETE /api/posts/:id', () => {
        let postId;

        beforeEach(async () => {
            const post = await Post.create({ authorId: userId, content: 'Post to delete' });
            postId = post._id;
        });

        it('Debería eliminar el post del usuario autenticado', async () => {
            const res = await request(app)
                .delete(`/api/posts/${postId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);

            const deletedPost = await Post.findById(postId);
            expect(deletedPost).toBeNull();
        });

        it('No debería eliminar post de otro usuario', async () => {
            const post = await Post.create({ authorId: otherUserId, content: 'Other post' });

            const res = await request(app)
                .delete(`/api/posts/${post._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(403);
        });

        it('Debería fallar con ID inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/posts/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/posts/:id/like', () => {
        let postId;

        beforeEach(async () => {
            const post = await Post.create({ authorId: userId, content: 'Post to like', likes: [] });
            postId = post._id;
        });

        it('Debería dar like a un post', async () => {
            const res = await request(app)
                .post(`/api/posts/${postId}/like`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.likes).toContain(otherUserId.toString());
        });

        it('Debería quitar like si ya está dado', async () => {
            await Post.findByIdAndUpdate(postId, { $addToSet: { likes: otherUserId } });

            const res = await request(app)
                .post(`/api/posts/${postId}/like`)
                .set('Authorization', `Bearer ${otherUserToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.likes).not.toContain(otherUserId.toString());
        });

        it('Debería fallar con post inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .post(`/api/posts/${fakeId}/like`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });
});
