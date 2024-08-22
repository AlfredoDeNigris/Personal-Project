const request = require('supertest');
const app = require('../index');

describe('Server Status Check', () => {
    it('should return 200 OK status on GET /api/isAlive', async () => {
        const response = await request(app).get('/api/isAlive');
        expect(response.status).toBe(200);
    });
});
