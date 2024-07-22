-- These are pre-loaded values to demonstrate the app's main function

USE personal_project;

-- Insert initial house models
INSERT INTO house_model (review, construction_time, bathroom, bedroom, square_meters, worker_cost, comercial_cost)
VALUES 
('Modern family house with spacious rooms.', 650, 2, 3, 120, 15000.00, 200000.00),
('Cozy cottage with a charming design.', 500, 1, 2, 80, 8000.00, 120000.00),
('Luxury villa with a pool and garden.', 1200, 4, 5, 250, 30000.00, 500000.00),
('Compact apartment ideal for small families.', 400, 1, 1, 60, 6000.00, 90000.00);

-- Insert default features
INSERT INTO feature (feature_name, unit_cost, information)
VALUES 
('Swimming Pool', 10000.00, 'A private pool with all necessary facilities.'),
('Solar Panels', 5000.00, 'Energy-efficient solar panels for reduced electricity bills.'),
('Balcony', 3000.00, 'A spacious balcony with a view of the surroundings.'),
('Chimney', 4000.00, 'A traditional chimney for a cozy fireplace.');
