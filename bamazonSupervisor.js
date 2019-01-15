
// TODO modify bamazonCustomer.js to add the multiplied total of price + quantity sold and updates product_sales
// TODO Supervisor options: View Product Sales by Department, Create a New Department
// TODO total_profit column is updated in app, and is prodcut_sales - over_head_costs. Do not store this value in DB
// TODO Check manager TODO
// TODO Check customer TODO

const env = require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');

const sqlDBConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.products_pass,
    database: 'bamazon_db'
});