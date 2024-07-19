DROP SCHEMA IF EXISTS personal_project;
CREATE SCHEMA IF NOT EXISTS personal_project DEFAULT CHARACTER SET utf8;
USE personal_project;


CREATE TABLE IF NOT EXISTS client(
  client_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  billing_address VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS budget(
  budget_id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client (client_id)
);

CREATE TABLE IF NOT EXISTS house(
  house_id INT PRIMARY KEY AUTO_INCREMENT,
  review TEXT,
  construction_time INT NOT NULL,
  bathrooms INT NOT NULL,
  bedrooms INT NOT NULL,
  square_meters INT NOT NULL,
  features_cost DECIMAL(10,2) NOT NULL,
  worker_cost DECIMAL(10,2) NOT NULL,
  comercial_cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS picture(
  pitcure_id INT PRIMARY KEY AUTO_INCREMENT,
  house_id INT NOT NULL,
  FOREIGN KEY (house_id) REFERENCES house (house_id)
);

CREATE TABLE IF NOT EXISTS available_house(
  budget_id INT NOT NULL,
  house_id INT NOT NULL,
  PRIMARY KEY (budget_id, house_id),
  FOREIGN KEY (budget_id) REFERENCES budget (budget_id),
  FOREIGN KEY (house_id) REFERENCES house (house_id)
);

CREATE TABLE IF NOT EXISTS feature(
  feature_id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  information VARCHAR(45) NOT NULL
);

CREATE TABLE IF NOT EXISTS house_feature(
  house_id INT NOT NULL,
  feature_id INT NOT NULL,
  PRIMARY KEY (house_id, feature_id),
  quantity INT NOT NULL,
  FOREIGN KEY (house_id) REFERENCES house (house_id),
  FOREIGN KEY (feature_id) REFERENCES feature (feature_id)
);