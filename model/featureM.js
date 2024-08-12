const featureDb = {};

const u = require("../utilities.js");
const entity = "feature";

//Function to fetch all features information
featureDb.getF = (pool, callback) => {
    try {
        const query = 'SELECT feature_name, unit_cost, information FROM feature';

        u.readQuery(pool, query, null, callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};

//Function to get all features information with a difference between the inputted budget and the selected house_model's commercial cost
featureDb.getFD = (pool, difference, callback) => {
    try {
        const query = 'SELECT feature_name, unit_cost, information FROM feature WHERE unit_cost <= ?';

        u.readQuery(pool, query, [difference], callback, entity);
    } catch (err) {
        u.globalError(pool, callback, err, null, entity);
    }
};


module.exports = featureDb;