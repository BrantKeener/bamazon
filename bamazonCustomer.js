// TODO Display all products  with id, name, price
// Prompt Ask for: 
// 1. Product ID
// 2. How many units would you like
// See if there is enough product
// Return "Insufficient quantity!" if customer asks for more than available
// If there is enough, fill order: Update SQL database
// Once the update goes through, return total cost of customer's purchase

// .env to store passwords, sql for database, enquirer for CLI user interaction 
const env = require('dotenv').config();
const mysql = require('mysql');
const inquirer = require('inquirer');
let customerCart = {};

// All the pertinent information to contact our DB
const sqlDBConnection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.env.products_pass,
    database: 'bamazon_db'
});

// Begin the connection, and fire a function to load the list of items for sale.
sqlDBConnection.connect((err) => {
    if(err) throw err;
    console.log(`\nWelcome to Bamazon!\n`)
    productArrayBuild();
});

// Build arrays to store the products
const productArrayBuild = () => {
    let idArray = [];
    let nameArray = [];
    let priceArray = [];
    let stockArray = [];
    sqlDBConnection.query('SELECT * FROM products', (err, res) => {
        if(err) throw err;
        for(let i = 0; i < Object.keys(res).length; i++) {
            let id = res[i].id;
            let name = res[i].product_name;
            let price = res[i].price;
            let stock = res[i].stock_quantity;
            idArray.push(id);
            nameArray.push(name);
            priceArray.push(price);
            stockArray.push(stock);
        };
        productListLoad(idArray, nameArray, priceArray, stockArray);
    });
};

//  Load the list of products
const productListLoad = (id, name, price, stock) => {
    for(let i = 0; i < id.length; i++) {
        let inLineDivider1 = ``;
        let inLineDivider2 = ``;
        let space = ` `;
        let spaceNumber = 40 - name[i].length;
        inLineDivider2 = space.repeat(spaceNumber);
        if(id[i] < 10) {
            inLineDivider1 = space.repeat(5);
        } else if(id[i] > 9 && id[i] < 100) {
            inLineDivider1 = space.repeat(4);
        };
        console.log(`Product ID: ${id[i]}${inLineDivider1}Product Name: ${name[i]}${inLineDivider2}Price: $${price[i]}`);
    };
    whichProduct(id, name, price, stock);
};

// Allow the customer to choose a particular item, and build that item's data into an Object known as 'chosenItem'
const whichProduct = (id, name, price, stock) => {
    console.log(`\n`);
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter the item ID of the item you are interested in: ',
            name: 'product',
        }
    ]).then(res => {
        let idNum = parseInt(res.product);
        let index = id.indexOf(idNum);
        if(id.includes(parseInt(idNum))) {
            let chosenItem = {
                id: id[index],
                name: name[index],
                price: price[index],
                stock: stock[index]
            };
            console.log('We have that item!');
            howMuchProduct(chosenItem);
        } else {
            console.log('\n***Warning***\nThat is not a valid ID number, please look at the list again, and choose a valid ID number.\n');
            productListLoad(id, name, price, stock);
        };
    })
};

// User inputs how much of the item they want, and this quantity is evaluated against the stock. If > stock, user has a choice to enter a new quantity, 
// choose a different item, or exit. If we have enough quantity, addToCart fires.
const howMuchProduct = (chosen) => {
    console.log(chosen);
    inquirer.prompt([
        {
            type: 'input',
            message: 'How many of this item would you like to purchase?',
            name: 'quantity'
        }
    ]).then(res => {
        if(res.quantity > chosen.stock) {
            console.log('\nInsufficient Quantity!\n');
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'What would you like to do?',
                    choices: ['Enter a new quantity', 'Choose a different item', 'Exit'],
                    name: 'whatToDo'
                }
            ]).then(res => {
                switch(res.whatToDo) {
                    case 'Enter a new quantity':
                    howMuchProduct(chosen)
                    break;
                    case 'Choose a different item':
                    productArrayBuild()
                    break;
                    case 'Exit':
                    appExit()
                    break;
                };
            });
        } else {
            addToCart();
        };
    });
};

const addToCart = () => {
    
};


const appExit = () => {
    sqlDBConnection.end();
};