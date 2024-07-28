const house_catalogueDb = {};

//Function to fetch all housing options information
house_catalogueDb.getHC = (pool, callback) => {
    const query = 'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model';
    if (!pool) {
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }
    pool.query(query, (err, results) => {
        if (err) {
            callback({ status: 500, message: err.message }, null);
        } else {
            callback(null, results);
        }
    });
};

//Function to get all housing options information with in the inputed budget
house_catalogueDb.getHCB = (pool, budget, callback) => {
    const query = 'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model WHERE comercial_cost <= ?';

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, [budget], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            callback(null, results);
        }
    });
};

//Function to get a specific house_model by house_model_id
house_catalogueDb.getHCC = (pool, house_model_id, callback) => {
    const query = 'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model WHERE house_model_id = ?';
    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }
    pool.query(query, [house_model_id], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            if (results.length === 0) {
                callback({ status: 404, message: 'House not found' }, null);
            } else {
                callback(null, results[0]);
            }
        }
    });
};


module.exports = house_catalogueDb;