const selected_houseDb = {};

//Function to fetch all selected_house information
selected_houseDb.getSH = (pool, callback) => {
    const query = 'SELECT c.full_name, c.username, c.billing_address, c.phone_number, c.email, hm.review, hm.construction_time, hm.bathroom, hm.bedroom, hm.square_meters, hm.worker_cost, hm.comercial_cost FROM selected_house sh JOIN client c ON sh.client_id = c.client_id JOIN house_model hm ON sh.house_model_id = hm.house_model_id;';
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

//Function to get a specific selected_house by client_id
selected_houseDb.getSHC = (pool, client_id, callback) => {
    const query = 'SELECT hm.review, hm.construction_time, hm.bathroom, hm.bedroom, hm.square_meters, hm.comercial_cost FROM house_model hm JOIN selected_house sh ON hm.house_model_id = sh.house_model_id WHERE sh.client_id = ?;';
    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }
    pool.query(query, [client_id], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            if (results.length === 0) {
                callback({ status: 404, message: 'selected_house not found' }, null);
            } else {
                callback(null, results[0]);
            }
        }
    });
};

//Function to create a new selected_house
selected_houseDb.create = (pool, selected_house, callback) => {
    const query = 'INSERT INTO selected_house (client_id, house_model_id, final_price) VALUES (?, ?, ?)';
    const values = [selected_house.client_id, selected_house.house_model_id, selected_house.final_price];

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, values, (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            callback(null, results);
        }
    });
};

//Function to update a selected_house's information
selected_houseDb.update = (pool, selected_house_id, selected_house, callback) => {
    const query = 'UPDATE selected_house SET house_model_id = ?, final_price = ? WHERE selected_house_id = ?';
    const values = [selected_house.house_model_id, selected_house.final_price, selected_house_id];

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, values, (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            if (results.affectedRows === 0) {
                callback({ status: 404, message: 'selected_house not found' }, null);
            } else {
                callback(null, { message: 'selected_house updated successfully' });
            }
        }
    });
};

//Function to delete a selected_house by selected_house_id
selected_houseDb.delete = (pool, client_id, house_model_id, callback) => {
    const query = 'DELETE FROM selected_house WHERE client_id = ? AND house_model_id = ?;';

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, [client_id, house_model_id], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            if (results.affectedRows === 0) {
                callback({ status: 404, message: 'selected_house not found' }, null);
            } else {
                callback(null, { message: 'selected_house deleted successfully' });
            }
        }
    });
};


module.exports = selected_houseDb;