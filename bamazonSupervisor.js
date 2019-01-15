

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
    } else {
        console.log(`\nWhat would you like to do next?`);
    };
    inquirer.prompt([
        {
            type: 'list',
            message: '\nWhat would you like to do today?',
            choices: ['View Product Sales by Department', 'Create a New Department', 'Exit'],
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
                console.log(`\nDepartment Cost, Sales, and Profit\n`)
                console.log(table.print(res));
                superMenu(1);
            });
        } else if(res.superChoice === 'Create a New Department') {
            createDepartment();
        } else {
            exitApp();
        };
    });
})();


// Keep working on this
const createDepartment = () => {
    let departmentArray = [];
    let query = `SELECT department_name FROM departments;`
    sqlDBConnection.query(query, (err, res) => {
        if(err) throw err;
        res.forEach(element => {
            let lowerElem = (element.department_name).toLowerCase();
            let noSpaceElem = lowerElem.replace(/\W/g, '');
            departmentArray.push(noSpaceElem);
        });
        inquirer.prompt([
            {
                type: 'input',
                message: 'What is the name you would like to assign to the new department?',
                validate: (answer) => {
                    let lowerA = answer.toLowerCase();
                    let noSpaceA = lowerA.replace(/\W/g, '');
                    for(let i = 0; i < departmentArray.length; i++) {
                        if(departmentArray[i] === noSpaceA) {
                            return `That name, or something very similar is already in use. Please choose something more unique.`;
                        } else if(noSpaceA.length === 0) {
                            return `This cannot be blank.`;
                        }
                    };
                    return true;
                },
                name: `newDepartmentName`
            },
            {
                type: 'input',
                message: 'What is the over head cost for this department? (format: xxxx where the last 2 digits are the cents value)',
                validate: (res) => {
                    let pass = res.match(/[0-9]/g);
                    let fail = res.match(/['a-zA-Z']/g);
                    if(pass && !fail) {
                        return true;
                    }
                    return `Make sure your entry is a number in the correct format. (xxxx last 2 digits are cents value)`
                },
                name: 'newDepartmentOverhead'
            }
        ]).then(res => {
            let newName = res.newDepartmentName;
            let overhead = res.newDepartmentOverhead;
            let tempArray = [...overhead];
            tempArray.splice(tempArray.length - 2, 0, '.');
            let newOverhead = parseFloat(tempArray.join(''));
            let query = `INSERT INTO departments (department_name, over_head_costs) 
            VALUES ('${newName}', ${newOverhead})`
            sqlDBConnection.query(query, (err, res) => {
                if(err) throw err;
                console.log(`\nDepartment ${newName} has been added with an Overhead cost of $${newOverhead}`);
                superMenu(1);
            });
        });
    });
};

const exitApp = () => {
    console.log(`\nYou have logged out of Supervisor\n`)
    sqlDBConnection.end();
};