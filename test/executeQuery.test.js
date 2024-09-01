const { executeQuery } = require('../utilities');

describe('executeQuery', () => {
    let mockPool;
    let mockConnection;
    let query = "";

    beforeEach(() => {
        mockConnection = {
            beginTransaction: jest.fn(),
            query: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };

        mockPool = {
            getConnection: jest.fn((callback) => callback(null, mockConnection))
        };
    });

    it('should return success message and result when query is successful', () => {
        const mockResult = { affectedRows: 1, insertId: 123 };
        mockConnection.beginTransaction.mockImplementation((callback) => callback(null));
        mockConnection.query.mockImplementation((query, params, callback) => callback(null, mockResult));
        mockConnection.commit.mockImplementation((callback) => callback(null));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.commit).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toBeUndefined();
            expect(result).toEqual({
                message: 'Success',
                detail: mockResult
            });
        }, 'entity');
    });

    it('should return 500 status and error message when there is a connection error', () => {
        const mockError = new Error('Connection error');
        mockPool.getConnection = jest.fn((callback) => callback(mockError));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should return 500 status and error message when there is a transaction error', () => {
        const mockTransError = new Error('Transaction error');
        mockConnection.beginTransaction.mockImplementation((callback) => callback(mockTransError));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockTransError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should return 500 status and error message when there is a query error', () => {
        const mockQueryError = new Error('Query error');
        mockConnection.beginTransaction.mockImplementation((callback) => callback(null));
        mockConnection.query.mockImplementation((query, params, callback) => callback(mockQueryError, null));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockQueryError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should return 404 status when no rows are affected', () => {
        mockConnection.beginTransaction.mockImplementation((callback) => callback(null));
        mockConnection.query.mockImplementation((query, params, callback) => callback(null, { affectedRows: 0 }));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toEqual({
                status: 404,
                message: 'No registered entity found with the entered search criteria'
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should release connection and call globalError if query fails', () => {
        const mockQueryError = new Error('Query error');
        mockConnection.beginTransaction.mockImplementation((callback) => callback(null));
        mockConnection.query.mockImplementation((query, params, callback) => callback(mockQueryError, null));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockQueryError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should release connection and call globalError if commit fails', () => {
        const mockCommitError = new Error('Commit error');
        const mockResult = { affectedRows: 1 };
        mockConnection.beginTransaction.mockImplementation((callback) => callback(null));
        mockConnection.query.mockImplementation((query, params, callback) => callback(null, mockResult));
        mockConnection.commit.mockImplementation((callback) => callback(mockCommitError));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockCommitError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should return 500 status and error message when commit fails', () => {
        const mockCommitError = new Error('Commit error');
        const mockResult = { affectedRows: 1 };
        mockConnection.beginTransaction.mockImplementation((callback) => callback(null));
        mockConnection.query.mockImplementation((query, params, callback) => callback(null, mockResult));
        mockConnection.commit.mockImplementation((callback) => callback(mockCommitError));

        executeQuery(mockPool, query, ['value'], 'Success', (err, result) => {
            expect(mockConnection.rollback).toHaveBeenCalled();
            expect(mockConnection.release).toHaveBeenCalled();
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockCommitError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });
});
