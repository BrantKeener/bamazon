
// TODO Supervisor options: View Product Sales by Department, Create a New Department
// TODO total_profit column is updated in app, and is prodcut_sales - over_head_costs. Do not store this value in DB
// TODO Check manager TODO
// TODO Check customer TODO

const env = require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
const table = require('easy-table');

const sqlDBConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.products_pass,
    database: 'bamazon_db'
});

sqlDBConnection.connect((err) => {
    if(err) throw err;
});

// Supervisor level user is given a menu with two options.

(superMenu = (itterations) => {
    if(itterations === undefined) {
        console.log(`\nYou are logged in as Supervisor. Please select an item to continue.`);
    };
    inquirer.prompt([
        {
            type: 'list',
            message: '\nWhat would you like to do today?',
            choices: ['View Product Sales by Department', 'Create a New Department'],
            name: 'superChoice'
        }
    ]).then(res => {
        let selection = `departments.department_id AS Department_ID, departments.department_name AS Department_Name, departments.over_head_costs AS Department_Costs, 
        products.department_name AS Department_Name, SUM(products.product_sales) AS Department_Sales, SUM(products.product_sales) - departments.over_head_costs AS total_profit`
        if(res.superChoice === 'View Product Sales by Department') {
            sqlDBConnection.query(`SELECT ${selection}
            FROM departments INNER JOIN products ON departments.department_name = products.department_name
            GROUP BY departments.department_name;`, (err, res) => {
                if(err) throw err;
                console.log(table.print(res));
            });
        } else if(res.superChoice === 'Create a New Department') {

        };
    });
})();