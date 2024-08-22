const request = require('supertest');
const app = require('../index');

//Mock the security middleware
jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next() //Bypass actual token verification
}));

//Mock the database functions
const house_catalogueDb = require('../model/house_catalogueM.js');
jest.mock('../model/house_catalogueM.js', () => ({
    getHC: jest.fn(),
    getHCB: jest.fn(),
    getHCC: jest.fn()
}));

describe('House Catalouge API Endpoints', () => {
    //GET /
    it('should return 200 and a list of house models', async () => {
        const mockData = [
            { review: 'Excellent', construction_time: 120, bathroom: 2, bedroom: 3, comercial_cost: 250000 },
            { review: 'Good', construction_time: 90, bathroom: 1, bedroom: 2, comercial_cost: 150000 },
        ];

        house_catalogueDb.getHC.mockImplementation((pool, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/house-catalogue')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 500 if there is an error in fetching house models', async () => {
        house_catalogueDb.getHC.mockImplementation((pool, callback) => {
            const error = { status: 500, message: 'Database error' };
            callback(error, null);
        });

        const response = await request(app)
            .get('/api/house-catalogue')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /:budget
    it('should return 200 and a list of house models within the budget', async () => {
        const mockData = [
            { review: 'Excellent', construction_time: 120, bathroom: 2, bedroom: 3, comercial_cost: 200000 },
            { review: 'Good', construction_time: 90, bathroom: 1, bedroom: 2, comercial_cost: 150000 },
        ];

        house_catalogueDb.getHCB.mockImplementation((pool, budget, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/house-catalogue/5000000')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if the budget parameter is not a number', async () => {
        const response = await request(app)
            .get('/api/house-catalogue/invalid-budget')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    location: 'params',
                    msg: 'Budget must be a number',
                    path: "budget",
                    type: "field",
                    value: "invalid-budget"
                })
            ])
        );
    });

    it('should return 500 if there is an error in fetching house models within the budget', async () => {
        house_catalogueDb.getHCB.mockImplementation((pool, budget, callback) => {
            const error = { status: 500, message: 'Database error' };
            callback(error, null);
        });

        const response = await request(app)
            .get('/api/house-catalogue/500000')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /house/:house_model_id
    it('should return 200 and house data when house_model_id is valid', async () => {
        const mockData = {
            review: 'Excellent',
            construction_time: '6 months',
            bathroom: 2,
            bedroom: 3,
            comercial_cost: 150000
        };

        house_catalogueDb.getHCC.mockImplementation((pool, house_model_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/house-catalogue/house/1')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if house_model_id is not a number', async () => {
        const response = await request(app)
            .get('/api/house-catalogue/house/invalid-id')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    location: 'params',
                    msg: 'House model ID must be a number',
                    path: 'house_model_id',
                    type: "field",
                    value: "invalid-id"
                })
            ])
        );
    });
});