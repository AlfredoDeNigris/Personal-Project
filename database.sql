DROP SCHEMA IF EXISTS personalProject;
CREATE SCHEMA IF NOT EXISTS personalProject;
USE personalProject;

CREATE TABLE IF NOT EXISTS CLIENT (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    billing_address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS HOUSE(
    house_id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    construction_time INT, -- In hours
    base_cost DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS MATERIAL(
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    cost_square_meter DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS HOUSE_MATERIAL(
    house_id INT NOT NULL,
    material_id INT NOT NULL,
    square_meter INT NOT NULL,
    PRIMARY KEY (house_id, material_id),
    FOREIGN KEY (house_id) REFERENCES HOUSE(house_id),
    FOREIGN KEY (material_id) REFERENCES MATERIAL(material_id)
);

CREATE TABLE IF NOT EXISTS WORKER(
    worker_id INT AUTO_INCREMENT PRIMARY KEY,
    specialty VARCHAR(100) NOT NULL,
    cost_per_hour DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS HOUSE_WORKER(
    house_id INT NOT NULL,
    worker_id INT NOT NULL,
    hours_needed DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (house_id, worker_id),
    FOREIGN KEY (house_id) REFERENCES HOUSE(house_id),
    FOREIGN KEY (worker_id) REFERENCES WORKER(worker_id)
);

CREATE TABLE IF NOT EXISTS FEATURE(
    feature_id INT AUTO_INCREMENT PRIMARY KEY,
    cost INT NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS HOUSE_FEATURE(
    house_id INT NOT NULL,
    feature_id INT NOT NULL,
    PRIMARY KEY (house_id, feature_id),
    FOREIGN KEY (house_id) REFERENCES HOUSE(house_id),
    FOREIGN KEY (feature_id) REFERENCES FEATURE(feature_id)
);

CREATE TABLE IF NOT EXISTS BUDGET_HOUSE(
    budget_id INT NOT NULL,
    house_id INT NOT NULL,
    PRIMARY KEY (budget_id, house_id),
    FOREIGN KEY (budget_id) REFERENCES BUDGET(budget_id),
    FOREIGN KEY (house_id) REFERENCES HOUSE(house_id)
);
