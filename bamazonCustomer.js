// TODO Display all products  with id, name, price
// Prompt Ask for: 
// 1. Product ID
// 2. How many units would you like
// See if there is enough product
// Return "Insufficient quantity!" if customer asks for more than available
// If there is enough, fill order: Update SQL database
// Once the update goes through, return total cost of customer's purchase

const env = require('dotenv').config();
const mysql = require('mysql');
const sqlDBConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.products_pass,
    database: 'bamazon_db'
});

sqlDBConnection.connect((err => {
    if(err) throw err;
    console.log(`connected as id`);
    sqlDBConnection.end();
}))
