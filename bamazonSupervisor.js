

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