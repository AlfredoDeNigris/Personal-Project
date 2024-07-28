const selected_house_featureDb = {};

//Function to fetch all selected_house_feature information
selected_house_featureDb.getSHF = (pool, callback) => {
    const query = 'SELECT c.full_name, c.username, c.billing_address, c.phone_number, c.email, hm.review, hm.construction_time, hm.bathroom, hm.bedroom, hm.square_meters, hm.worker_cost, hm.comercial_cost, f.feature_name, f.unit_cost, f.information FROM selected_house sh JOIN client c ON sh.client_id = c.client_id JOIN house_model hm ON sh.house_model_id = hm.house_model_id JOIN selected_house_feature shf ON sh.client_id = shf.client_id AND sh.house_model_id = shf.house_model_id JOIN feature f ON shf.feature_id = f.feature_id;';
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

//Function to get a specific selected_house_feature by client_id and house_model_id
selected_house_featureDb.getSHFC = (pool, client_id, house_model_id, callback) => {
    const query = 'SELECT f.feature_name, f.unit_cost, f.information FROM selected_house_feature shf JOIN feature f ON shf.feature_id = f.feature_id WHERE shf.client_id = ? AND shf.house_model_id = ?;';
    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }
    pool.query(query, [client_id, house_model_id], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            if (results.length === 0) {
                callback({ status: 404, message: 'selected_house_feature does not exist' }, null);
            } else {
                callback(null, results[0]);
            }
        }
    });
};

//Function to create a new selected_house_feature
selected_house_featureDb.create = (pool, selected_house_feature, callback) => {
    const query = 'INSERT INTO selected_house_feature (client_id, house_model_id, feature_id, quantity) VALUES (?, ?, ?, ?)';
    const values = [selected_house_feature.client_id, selected_house_feature.house_model_id, selected_house_feature.feature_id, selected_house_feature.quantity];

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
/*
//Function to update a selected_house_feature's information
selected_house_featureDb.update = (pool, selected_house_id, selected_house, callback) => {
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
*/
//Function to delete a selected_house_feature by client_id, house_model_id and feature_id
selected_house_featureDb.delete = (pool, client_id, house_model_id, feature_id, callback) => {
    const query = 'DELETE FROM selected_house_feature WHERE client_id = ? AND house_model_id = ? AND feature_id = ?;';

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, [client_id, house_model_id, feature_id], (err, results) => {
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


module.exports = selected_house_featureDb;