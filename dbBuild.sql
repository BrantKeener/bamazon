DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

SELECT * FROM products;

SELECT * FROM departments;

CREATE TABLE products (
	id INTEGER(25) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(30) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price INTEGER(25) NOT NULL,
    stock_quantity INTEGER(25),
    PRIMARY KEY (id)
    );
    
INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ('Glass Pitcher', 'Housewares', '15.00', 4),
('Wrench Set', 'Tools', '60.00', 4),
('Laptop', 'Electronics', '500.00', 6),
('750 mL Jameson', 'Self Care', '30.00', 6),
('Latest Greatest Phone', 'Electronics', '1200.00', 2),
('Leather Jacket', 'Fashion', '250.00', 6),
('Skin Care Set', 'Self Care', '35.00', 4),
('Phone Charger', 'Electronics', '15.00', 5),
('Headphones (not fancy)', 'Audio', '10.00', 3),
('Headphones (extra fancy)', 'Audio', '60.00', 6);

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY {put in the password you want to use here};

UPDATE products SET price = 15.25 WHERE id = 1; 

UPDATE products SET price = 60.58 WHERE id = 2;

UPDATE products SET price = 500.99 WHERE id = 3;

UPDATE products SET price = 30.26 WHERE id = 4;

UPDATE products SET price = 1200.85 WHERE id = 5;

UPDATE products SET price = 250.75 WHERE id = 6;

UPDATE products SET price = 35.67 WHERE id = 7;

UPDATE products SET price = 15.05 WHERE id = 8;

UPDATE products SET price = 10.16 WHERE id = 9;

UPDATE products SET price = 60.25 WHERE id = 10;

ALTER TABLE products
MODIFY COLUMN price DECIMAL(10, 2);

UPDATE products SET stock_quantity = 10 WHERE id = 1;
UPDATE products SET stock_quantity = 4 WHERE id = 2;
UPDATE products SET stock_quantity = 12 WHERE id = 3;
UPDATE products SET stock_quantity = 5 WHERE id = 4;
UPDATE products SET stock_quantity = 8 WHERE id = 5;
UPDATE products SET stock_quantity = 12 WHERE id = 6;
UPDATE products SET stock_quantity = 2 WHERE id = 7;
UPDATE products SET stock_quantity = 11 WHERE id = 8;
UPDATE products SET stock_quantity = 7 WHERE id = 9;
UPDATE products SET stock_quantity = 12 WHERE id = 10;

CREATE TABLE departments (
	department_id INTEGER(25) AUTO_INCREMENT NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    over_head_costs DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (department_id)
    );

INSERT INTO departments (department_name, over_head_costs)
VALUES ('Housewares', 500.00),
('Tools', 867.25),
('Electronics', 1275.65),
('Self Care', 487.87),
('Fashion', 779.99),
('Audio', 987.54);

ALTER TABLE products
ADD product_sales DECIMAL(10, 2);
