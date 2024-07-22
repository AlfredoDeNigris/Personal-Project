DROP SCHEMA IF EXISTS personal_project;
CREATE SCHEMA IF NOT EXISTS personal_project DEFAULT CHARACTER SET utf8;
USE personal_project;


CREATE TABLE IF NOT EXISTS client(
  client_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  billing_address VARCHAR(100) NOT NULL,
  phone_number VARCHAR(15) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS house_model(
  house_model_id INT PRIMARY KEY AUTO_INCREMENT,
  review TEXT NOT NULL,
  construction_time INT NOT NULL,
  bathroom INT NOT NULL,
  bedroom INT NOT NULL,
  square_meters INT NOT NULL,
  worker_cost DECIMAL(10,2) NOT NULL,
  comercial_cost DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS house_picture(
  house_pitcure_id INT PRIMARY KEY AUTO_INCREMENT,
  house_model_id INT NOT NULL,
  path_picture VARCHAR (255) NOT NULL,
  FOREIGN KEY (house_model_id) REFERENCES house_model (house_model_id)
);

CREATE TABLE IF NOT EXISTS selected_house(
  client_id INT NOT NULL,
  house_model_id INT NOT NULL,
  final_price DECIMAL (10,2) NOT NULL,
  PRIMARY KEY (client_id, house_model_id),
  FOREIGN KEY (client_id) REFERENCES client (client_id),
  FOREIGN KEY (house_model_id) REFERENCES house_model (house_model_id)
);

CREATE TABLE IF NOT EXISTS feature(
  feature_id INT PRIMARY KEY AUTO_INCREMENT,
  feature_name VARCHAR(100) NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  information VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS feature_picture(
  feature_pitcure_id INT PRIMARY KEY AUTO_INCREMENT,
  feature_id INT NOT NULL,
  path_picture VARCHAR (255) NOT NULL,
  FOREIGN KEY (feature_id) REFERENCES feature (feature_id)
);

CREATE TABLE IF NOT EXISTS selected_house_feature(
  client_id INT NOT NULL,
  house_model_id INT NOT NULL,
  feature_id INT NOT NULL,
  PRIMARY KEY (client_id, house_model_id, feature_id),
  quantity INT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES client (client_id),
  FOREIGN KEY (house_model_id) REFERENCES house_model (house_model_id),
  FOREIGN KEY (feature_id) REFERENCES feature (feature_id)
);