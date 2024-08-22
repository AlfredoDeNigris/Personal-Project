const request = require('supertest');
const app = require('../index');

//Mock the security middleware
jest.mock('../controller/securityC.js', () => ({
    verify: (req, res, next) => next() //Bypass actual token verification
}));

//Mock the database functions
const clientDb = require('../model/clientM.js');
jest.mock('../model/clientM.js', () => ({
    getC: jest.fn(),
    getCP: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
}));

describe('Client API Endpoints', () => {
    //GET /
    it('should return 200 and a list of clients', async () => {
        const mockData = [
            {
                full_name: 'John Doe',
                username: 'johndoe',
                password: 'password123',
                billing_address: '123 Street',
                phone_number: '1234567890',
                email: 'johndoe@example.com'
            },
        ];

        clientDb.getC.mockImplementation((pool, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/client')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 500 if there is an error', async () => {
        clientDb.getC.mockImplementation((pool, callback) => {
            const error = { status: 500, message: 'Database error' };
            callback(error);
        });

        const response = await request(app)
            .get('/api/client')
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //GET /profile/:client_id
    it('should return 200 and client profile data when client_id is valid', async () => {
        const mockData = {
            client_id: 1,
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Street',
            phone_number: '1234567890',
            email: 'johndoe@example.com',
        };

        clientDb.getCP.mockImplementation((pool, client_id, callback) => {
            callback(null, mockData);
        });

        const response = await request(app)
            .get('/api/client/profile/1') //Solicitud GET con un client_id válido
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockData);
    });

    it('should return 400 if client_id is not a number', async () => {
        const response = await request(app)
            .get('/api/client/profile/invalid-id') //Solicitud GET con un client_id inválido
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ msg: 'Client ID must be a number' })
            ])
        );
    });

    it('should return 500 if there is a database error', async () => {
        clientDb.getCP.mockImplementation((pool, client_id, callback) => {
            const error = { status: 500, message: 'Database error' };
            callback(error);
        });

        const response = await request(app)
            .get('/api/client/profile/1') //Solicitud GET con un client_id válido
            .set('Authorization', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ status: 500, message: 'Database error' });
    });

    //POST /register
    it('should return 200 and success message when input data is valid', async () => {
        const mockData = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Street',
            phone_number: '1234567890',
            email: 'johndoe@example.com'
        };

        const successMessage = 'Your registration has been successful.';

        clientDb.create.mockImplementation((pool, client, callback) => {
            callback(null, { message: successMessage });
        });

        const response = await request(app)
            .post('/api/client/register')
            .send(mockData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(successMessage);
    });

    it('should return 400 and validation errors when input data is invalid', async () => {
        const mockData = {
            full_name: 'John123',
            username: '',
            password: '',
            billing_address: '',
            phone_number: 'ABC',
            email: 'invalidemail'
        };

        const response = await request(app)
            .post('/api/client/register')
            .send(mockData);

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Full name contains invalid characters.' }),
            expect.objectContaining({ msg: 'Username is required' }),
            expect.objectContaining({ msg: 'Password is required' }),
            expect.objectContaining({ msg: 'Billing address is required' }),
            expect.objectContaining({ msg: 'Phone number must be numeric' }),
            expect.objectContaining({ msg: 'Invalid email address' })
        ]));
    });

    it('should return 500 and error message when database operation fails', async () => {
        const mockData = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Street',
            phone_number: '1234567890',
            email: 'johndoe@example.com'
        };

        clientDb.create.mockImplementation((pool, client, callback) => {
            callback({ status: 500, message: 'Database error' }, null);
        });

        const response = await request(app)
            .post('/api/client/register')
            .send(mockData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });

    //PUT /profile/:client_id
    it('should return 200 and success message when input data is valid', async () => {
        const mockData = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Street',
            phone_number: '1234567890',
            email: 'johndoe@example.com'
        };

        const successMessage = 'Profile information updated successfully!';

        clientDb.update.mockImplementation((pool, client_id, client, callback) => {
            callback(null, { message: successMessage });
        });

        const response = await request(app)
            .put('/api/client/profile/1') // Ruta con client_id válido
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg')
            .send(mockData);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(successMessage);
    });

    it('should return 400 and validation errors when input data is invalid', async () => {
        const mockData = {
            full_name: 'John123', // Nombre inválido
            username: '',         // Falta el nombre de usuario
            password: '',         // Falta la contraseña
            billing_address: '',  // Falta la dirección de facturación
            phone_number: 'ABC',  // Número de teléfono no numérico
            email: 'invalidemail' // Email inválido
        };

        const response = await request(app)
            .put('/api/client/profile/1') // Ruta con client_id válido
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg')
            .send(mockData);

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Full name contains invalid characters.' }),
            expect.objectContaining({ msg: 'Username is required' }),
            expect.objectContaining({ msg: 'Password is required' }),
            expect.objectContaining({ msg: 'Billing address is required' }),
            expect.objectContaining({ msg: 'Phone number must be numeric' }),
            expect.objectContaining({ msg: 'Invalid email address' })
        ]));
    });

    it('should return 500 and error message when database operation fails', async () => {
        const mockData = {
            full_name: 'John Doe',
            username: 'johndoe',
            password: 'password123',
            billing_address: '123 Street',
            phone_number: '1234567890',
            email: 'johndoe@example.com'
        };

        clientDb.update.mockImplementation((pool, client_id, client, callback) => {
            callback({ status: 500, message: 'Database error' }, null);
        });

        const response = await request(app)
            .put('/api/client/profile/1') // Ruta con client_id válido
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg')
            .send(mockData);

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });

    //DELETE /profile/:client_id
    it('should return 200 and success message when client_id is valid', async () => {
        const successMessage = 'Client deleted successfully';

        clientDb.delete.mockImplementation((pool, client_id, callback) => {
            callback(null, { message: successMessage });
        });

        const response = await request(app)
            .delete('/api/client/profile/1') // Solicitud DELETE con un client_id válido
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe(successMessage);
    });

    it('should return 400 and validation errors when client_id is invalid', async () => {
        const response = await request(app)
            .delete('/api/client/profile/invalid_id') // client_id no es numérico
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(400);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({ msg: 'Client ID must be a number' })
        ]));
    });

    it('should return 500 and error message when database operation fails', async () => {
        clientDb.delete.mockImplementation((pool, client_id, callback) => {
            callback({ status: 500, message: 'Database error' }, null);
        });

        const response = await request(app)
            .delete('/api/client/profile/1') // Solicitud DELETE con un client_id válido
            .set('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3QiLCJmdWxsX25hbWUiOiJDb24iLCJlbWFpbCI6InNpbkRpYUBnbWFpbC5jb20iLCJleHAiOjE3MjQ0NTM4OTl9.lgucqxoxcTjtdf2FlEa5wdxu8TIN7sv3wUswFdxlxvg');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Database error');
    });
});