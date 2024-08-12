const house_catalogueDb = {};

const u = require("../utilities.js");
const entity = "house model";

//Function to fetch all housing options information
house_catalogueDb.getHC = (pool, callback) => {
    try {
        const query = 'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model';

        u.readQuery(pool, query, null, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to get all housing options information within the inputted budget
house_catalogueDb.getHCB = (pool, budget, callback) => {
    try {
        const query = 'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model WHERE comercial_cost <= ?';

        u.readQuery(pool, query, [budget], callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to get a specific house_model by house_model_id
house_catalogueDb.getHCC = (pool, house_model_id, callback) => {
    try {
        const query = 'SELECT review, construction_time, bathroom, bedroom, comercial_cost FROM house_model WHERE house_model_id = ?';

        u.readQuery(pool, query, [house_model_id], callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};


module.exports = house_catalogueDb;