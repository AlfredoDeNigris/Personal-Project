const { readQuery } = require('../utilities');


describe('readQuery', () => {
    let mockPool;
    let mockCallback;
    let query = "";

    beforeEach(() => {
        mockPool = {
            getConnection: jest.fn()
        };
        mockCallback = jest.fn();
    });

    it('should call callback with result when no error and result has data', () => {
        const mockResult = [{ id: 1, name: 'Test' }];
        mockPool.getConnection.mockImplementation((query, params, callback) => {
            callback(null, mockResult);
        });

        readQuery(mockPool, query, [], mockCallback, 'entity');

        expect(mockCallback).toHaveBeenCalledWith(undefined, { result: mockResult });
    });

    it('should return 500 status and error message when there is a database error', () => {
        const mockError = new Error('Database error');
        mockPool.getConnection.mockImplementation((query, params, callback) => {
            callback(mockError, []);
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

    it('should return 404 status when result is empty', () => {
        mockPool.getConnection.mockImplementation((query, params, callback) => {
            callback(null, []);
        });

        readQuery(mockPool, query, [], (err, result) => {
            expect(err).toEqual({
                status: 404,
                message: 'No registered entity found with the entered search criteria'
            });
            expect(result).toBeUndefined();
        }, 'entity');
    });

    it('should call callback with result when no error and result has data', () => {
        const mockResult = [{ id: 1, name: 'Test' }];
        mockPool.getConnection.mockImplementation((query, params, callback) => {
            callback(null, mockResult);
        });

        readQuery(mockPool, query, [], (err, result) => {
            expect(err).toBeUndefined();
            expect(result).toEqual({ result: mockResult });
        }, 'entity');
    });
});