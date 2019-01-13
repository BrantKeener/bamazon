
// TODO 
// Add new product Allow manager to add a completely new product

// Initialize our required packages
const env = require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');

// Get a connection variable
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

// This opening function handles a variety of input controls. It can build a variety of lists based on what the user has chosen. Item is fixed with 
// inquirer list item selection, and relates to which command the manager has chosen to execute.
(openPrompt = (run, item) => {

    // Available choices change based on what the user has already chosen to look at.

    const choices = () => {
        switch(item) {
            case 'view all':
            return ['View Low Inventory', 'Increase Available Inventory', 'Add a New Item', 'Exit'];
            case 'view low':
            return ['View All Products for Sale', 'Increase Available Inventory', 'Add a New Item', 'Exit'];
            case 'increase':
            return ['View All Products for Sale', 'View Low Inventory', 'Increase Available Inventory', 'Add a New Item', 'Exit'];
            // This one will need a lot of work
            case 'add':
            return ['View Products for Sale', 'View Low Inventory', 'Increase Available Inventory', 'Add a New Item', 'Exit'];
            default:
            return ['View All Products for Sale', 'View Low Inventory', 'Increase Available Inventory', 'Add a New Item', 'Exit'];
        };
    };

    // Greeting message changes based on which iteration we are on

    const runMessage = () => {
        if(run === undefined || !run === 1) {
            return 'Good morning Manager. How can I be of assistance?';
        }
        return 'What else would you like to do today?';
    };
    inquirer.prompt([
        {
            type: 'list',
            message: runMessage(),
            choices: choices(),
            name: 'managerOpening'
        }
    ]).then(res => {
        switch(res.managerOpening) {
            case 'View All Products for Sale':
            viewProducts(true, 'view all');
            break;
            case 'View Low Inventory':
            viewProducts(false, 'view low');
            break;
            case 'Increase Available Inventory':
            viewProducts(true, 'increase');
            break;
            case 'Add a New Item':
            newProducts(true, 'add');
            break;

        };
    });
})();

// This multipurpose list builder will make the DB query, and then put the items together to pass into the actual display builder.

const viewProducts = (all, item) => {
    const productLowLimit = 5;
    const message = all ? `All Inventory Displayed\n` : `Low Quantity Inventory Displayed\n`;
    const query = all ? 'SELECT id, product_name, price, stock_quantity FROM products' : 
    `SELECT id, product_name, price, stock_quantity FROM products WHERE stock_quantity <= ?`;
    const parameter = all ? '' : productLowLimit;
    let idArray = [];
    sqlDBConnection.query(query, parameter, (err, res) => {
        if(err) throw err;
        for(let i = 0; i < Object.keys(res).length; i++){
            let id = res[i].id;
            let product = res[i].product_name;
            let price = res[i].price;
            let quantity = res[i].stock_quantity;
            idArray.push(id);
            if(i === 0) {
                console.log('\n');
                console.log(message);
            };
            managerListDisplay(id, product, price, quantity);
            if(i === Object.keys(res).length - 1) {
                console.log('\n');
                if(item === 'increase') {
                    increaseInventory(idArray);
                } else if(item === 'add') {
                    
                } else {
                    openPrompt(1, item);
                };
            };
        };
    });
};

// Ask user which item they would like to update, and by how much

const increaseInventory = (idArray) => {

    // Both inquires have internal validation. The first checks to make sure that the ID exists, while the second makes sure that thes uer enters a number.

    inquirer.prompt([
        {
            input: 'type',
            message: `Which item would you like to increase stock for? (Please enter that item's id)`,
            name: `itemChoice`,
            validate: (res) => {
                if(idArray.includes(Number(res))) {
                    return true;
                };
                return 'Please enter a valid id.'
            }
        },
        {
            input: 'type',
            message: `How much would you like to increase the stock?`,
            name: `increaseNumber`,
            validate: (res) => {
                let pass = res.match(/[0-9]/g);
                let fail = res.match(/['a-z']/g);
                if(pass && !fail) {
                    return true;
                };
                return 'Please enter a valid numerical quantity.'
            }
        }
    ]).then(res => {
        let choice = res.itemChoice;
        let number = res.increaseNumber;
        let query1 = `SELECT product_name, stock_quantity FROM products WHERE id = ${choice}`;
        let query2 = `UPDATE products SET stock_quantity = ? WHERE id = ?`
        sqlDBConnection.query(query1, (err, res) => {
            if(err) throw err;
            let inStock = res[0].stock_quantity;
            let name = res[0]. product_name;
            let newStock = inStock + parseInt(number, 10);
            sqlDBConnection.query(query2, [newStock, choice], (err, res) => {
                if(err) throw err;
                console.log(`\nThe in-stock-quantity for ${name} has been updated to ${newStock}\n`);
                openPrompt(1, undefined);
            });
        });
    });
};

const newProducts = () => {
    
};

// This builds the actual console display

const managerListDisplay = (id, product, price, quantity) => {
    const space = ' ';
    const defaultSpacesIDPrice = 20;
    const defaultSpacesName = 40;
    let adjustIdSpace = space.repeat(defaultSpacesIDPrice - id.toString().length);
    let adjustProductSpace = space.repeat(defaultSpacesName - product.length);
    let adjustPriceSpace = space.repeat(defaultSpacesIDPrice - price.toString().length);
    console.log(`Product ID: ${id}${adjustIdSpace}Product Name: ${product}${adjustProductSpace}Price: ${price}${adjustPriceSpace} Quantity Remaining: ${quantity}`);
};