const featureDb = {};

//Function to fetch all features information
featureDb.getF = (pool, callback) => {
    const query = 'SELECT feature_name, unit_cost, information FROM feature';
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

//Function to get all features information with in difference between the inputed budget and the selected house_model's comercial_cost
featureDb.getFD = (pool, difference, callback) => {
    const query = 'SELECT feature_name, unit_cost, information FROM feature WHERE unit_cost <= ?';

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, [difference], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            callback(null, results);
        }
    });
};


module.exports = featureDb;