const { readQuery } = require('../utilities');
const { globalError } = require('../utilities');

describe('readQuery', () => {
    let mockPool;
    let mockCallback;
    let query = "SELECT * FROM test_table";

    beforeEach(() => {
        mockPool = {
            getConnection: jest.fn()
        };
        mockCallback = jest.fn();
    });

    it('should call callback with result when no error and result has data', () => {
        const mockResult = [{ id: 1, name: 'Test' }];
        const mockConnection = {
            query: jest.fn((q, params, callback) => callback(null, mockResult)),
            release: jest.fn()
        };

        mockPool.getConnection.mockImplementation((callback) => {
            callback(null, mockConnection);
        });

        readQuery(mockPool, query, [], mockCallback, 'entity');

        expect(mockConnection.query).toHaveBeenCalledWith(query, [], expect.any(Function));
        expect(mockCallback).toHaveBeenCalledWith(null, { result: mockResult });
    });

    it('should get 500 status and error message when there is a database error', () => {
        const mockError = new Error('Database error');
        const mockConnection = {
            query: jest.fn((q, params, callback) => callback(mockError, [])),
            release: jest.fn()
        };

        mockPool.getConnection.mockImplementation((callback) => {
            callback(null, mockConnection);
        });

        readQuery(mockPool, query, [], (err, result) => {
            expect(err).toEqual({
                status: 500,
                message: 'Unknown error',
                detail: mockError
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should get 404 status when result is empty', () => {
        const mockConnection = {
            query: jest.fn((q, params, callback) => callback(null, [])),
            release: jest.fn()
        };

        mockPool.getConnection.mockImplementation((callback) => {
            callback(null, mockConnection);
        });

        readQuery(mockPool, query, [], (err, result) => {
            expect(err).toEqual({
                status: 404,
                message: 'No registered entity found with the entered search criteria'
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });
});