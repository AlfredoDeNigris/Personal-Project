const clientDb = {};

//Function to fetch all clients' information
clientDb.getC = (pool, callback) => {
    const query = 'SELECT full_name, username, password, billing_address, phone_number, email FROM client';
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

//Function to get a specific client by client_id
clientDb.getCP = (pool, client_id, callback) => {
    const query = 'SELECT full_name, username, password, billing_address, phone_number, email FROM client WHERE client_id = ?';
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
                callback({ status: 404, message: 'Client not found' }, null);
            } else {
                callback(null, results[0]);
            }
        }
    });
};

//Function to create a new client
clientDb.create = (pool, client, callback) => {
    const query = 'INSERT INTO client (full_name, username, password, billing_address, phone_number, email) VALUES (?, ?, ?, ?, ?, ?)';
    const values = [client.full_name, client.username, client.password, client.billing_address, client.phone_number, client.email];

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

//Function to update a client's information
clientDb.update = (pool, client_id, client, callback) => {
    const query = 'UPDATE client SET full_name = ?, username = ?, password = ?, billing_address = ?, phone_number = ?, email = ? WHERE client_id = ?';
    const values = [client.full_name, client.username, client.password, client.billing_address, client.phone_number, client.email, client_id];

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
                callback({ status: 404, message: 'Client not found' }, null);
            } else {
                callback(null, { message: 'Client updated successfully' });
            }
        }
    });
};

//Function to delete a client by client_id
clientDb.delete = (pool, client_id, callback) => {
    const query = 'DELETE FROM client WHERE client_id = ?';

    if (!pool) {
        console.error("Pool is undefined");
        return callback({ status: 500, message: 'Database connection pool is not available' }, null);
    }

    pool.query(query, [client_id], (err, results) => {
        if (err) {
            console.log(err.message);
            callback({ status: 500, message: err.message }, null);
        } else {
            if (results.affectedRows === 0) {
                callback({ status: 404, message: 'Client not found' }, null);
            } else {
                callback(null, { message: 'Client deleted successfully' });
            }
        }
    });
};

module.exports = clientDb;