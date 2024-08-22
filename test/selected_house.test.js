const request = require('supertest');
const app = require('../index');

//Mock the security middleware
jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next() //Bypass actual token verification
}));

//Mock the database functions
const selected_houseDb = require('../model/selected_houseM.js');
jest.mock('../model/selected_houseM.js', () => ({
    getSH: jest.fn(),
    getSHC: jest.fn(),
    delete: jest.fn()
}));

describe('Selected House API Endpoints', () => {
    //GET /
    it('should return 200 and the correct data if the request is successful', async () => {
        const mockData = [{
            full_name: 'John Doe',
            username: 'johndoe',
            billing_address: '123 Elm St',
            phone_number: '1234567890',
            email: 'john@example.com',
            review: 'Great house!',
            construction_time: 12,
            bathroom: 2,
            bedroom: 3,
            square_meters: 150,
            worker_cost: 10000,
            comercial_cost: 50000
        }];

        selected_houseDb.getSH.mockImplementation((pool, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/selected-house')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_houseDb.getSH.mockImplementation((pool, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .get('/api/selected-house')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /:client_id
    it('should return 200 and the correct data if the request is successful', async () => {
        const mockData = [{
            review: 'Great house!',
            construction_time: 12,
            bathroom: 2,
            bedroom: 3,
            square_meters: 150,
            comercial_cost: 50000
        }];

        selected_houseDb.getSHC.mockImplementation((pool, client_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/selected-house/1')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if the client_id is not a number', async () => {
        const response = await request(app)
            .get('/api/selected-house/invalid-id')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            errors: [
                {
                    msg: 'Client ID must be a number',
                    path: 'client_id',
                    location: 'params',
                    type: "field",
                    value: "invalid-id"
                }
            ]
        });
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_houseDb.getSHC.mockImplementation((pool, client_id, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .get('/api/selected-house/1')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //DELETE /:client_id/:house_model_id
    it('should return 200 and success message if the house and features are deleted successfully', async () => {
        const mockData = { message: 'Selected house and its features deleted successfully' };

        selected_houseDb.delete.mockImplementation((pool, client_id, house_model_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .delete('/api/selected-house/1/2')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if client_id or house_model_id is not a number', async () => {
        const response = await request(app)
            .delete('/api/selected-house/abc/2')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
            errors: [
                {
                    msg: 'Client ID must be a number',
                    path: 'client_id',
                    location: 'params',
                    type: 'field',
                    value: 'abc'
                }
            ]
        });
    });

    it('should return 500 if there is a database error', async () => {
        const mockError = { status: 500, message: 'Database error' };

        selected_houseDb.delete.mockImplementation((pool, client_id, house_model_id, callback) => {
            callback(mockError, null);
        });

        const response = await request(app)
            .delete('/api/selected-house/1/2')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

});