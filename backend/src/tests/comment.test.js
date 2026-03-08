const request = require('supertest');
const app = require('../app');
const dbHandler = require('./db-handler');
const User = require('../models/users');
const Post = require('../models/post');
const Comment = require('../models/comments');
const jwt = require('jsonwebtoken');

describe('Comments API - Tests de Integración', () => {
    let token;
    let userId;
    let otherUserToken;
    let otherUserId;
    let postId;

    beforeAll(async () => {
        await dbHandler.connect();
        
        const user = await User.create({
            name: 'Comment Author',
            email: 'author@test.com',
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

        const post = await Post.create({ authorId: userId, content: 'Test post' });
        postId = post._id;
    });

    afterEach(async () => await Comment.deleteMany({}));
    afterAll(async () => {
        await Post.deleteMany({});
        await User.deleteMany({});
        await dbHandler.closeDatabase();
    });

    describe('POST /api/comments/createComment/:id', () => {
        it('Debería crear un comentario en un post', async () => {
            const res = await request(app)
                .post(`/api/comments/createComment/${postId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Este es un comentario de prueba' });

            expect(res.statusCode).toBe(201);
            expect(res.body.comment).toHaveProperty('content', 'Este es un comentario de prueba');
            expect(res.body.comment).toHaveProperty('author');
            expect(res.body.comment).toHaveProperty('post', postId.toString());
        });

        it('Debería fallar sin contenido', async () => {
            const res = await request(app)
                .post(`/api/comments/createComment/${postId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.statusCode).toBe(400);
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app)
                .post(`/api/comments/createComment/${postId}`)
                .send({ content: 'Test comment' });

            expect(res.statusCode).toBe(401);
        });

        it('Debería crear comentario incluso con post inexistente (no valida post)', async () => {
            const fakePostId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .post(`/api/comments/createComment/${fakePostId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Test comment' });

            expect(res.statusCode).toBe(201);
        });
    });

    describe('DELETE /api/comments/:id', () => {
        let commentId;

        beforeEach(async () => {
            const comment = await Comment.create({
                content: 'Comment to delete',
                author: userId,
                post: postId
            });
            commentId = comment._id;
        });

        it('Debería eliminar el comentario del usuario autenticado', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);

            const deletedComment = await Comment.findById(commentId);
            expect(deletedComment).toBeNull();
        });

        it('No debería eliminar comentario de otro usuario', async () => {
            const otherComment = await Comment.create({
                content: 'Other comment',
                author: otherUserId,
                post: postId
            });

            const res = await request(app)
                .delete(`/api/comments/${otherComment._id}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(403);
        });

        it('Debería fallar con ID inexistente', async () => {
            const fakeId = '507f1f77bcf86cd799439011';

            const res = await request(app)
                .delete(`/api/comments/${fakeId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });

        it('Debería fallar sin token', async () => {
            const res = await request(app)
                .delete(`/api/comments/${commentId}`);

            expect(res.statusCode).toBe(401);
        });
    });
});
