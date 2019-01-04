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
let customerCart = [];

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

//  Build up a list that is passed into the listDisplayer()
const productListLoad = (id, name, price, stock) => {
    let productObj = {};
    for(let i = 0; i < id.length; i++) {
        productObj = {
            id: id[i],
            name: name[i],
            price: price[i],
            who: 'products'
        };
        listDisplayer(productObj);
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
            let chosenWithQuant = {
                id: chosen.id,
                name: chosen.name,
                price: chosen.price,
                requested: res.quantity
            }
            addToCart(chosenWithQuant);
        };
    });
};

const addToCart = (chosen) => {
    customerCart.push(chosen);
    console.log('\nThis item has been added to your cart\n');
    console.log('Items currently in your cart:\n');
    for(let i = 0; i < customerCart.length; i++) {
        let cartObj = {
            name: customerCart[i].name,
            price: customerCart[i].price,
            requested: customerCart[i].requested,
            who: 'cart'
        };
        listDisplayer(cartObj);
    };
};

// Make the console.logs that are displayed to the user
const listDisplayer = (object) => {
    let space = ` `;
    let spaceProdIdDefault = 5;
    let spaceProdNameDefault = 40;
    let spaceCartNameDefault = 35;
    let spaceCartPriceDefault = 20;
    let spaceProdIdAdjust = ``;
    let spaceProdNameAdjust = space.repeat(spaceProdNameDefault - object.name.length);
    let spaceCartNameAdjust = space.repeat(spaceCartNameDefault - object.name.length);
    let spaceCartPriceAdjust = space.repeat(spaceCartPriceDefault - object.price.toString().length);
    let id = object.id;
    let name = object.name;
    let price = object.price;
    let who = object.who;
    let requested = object.requested;
    let spaceNumberName = 40 - object.name.length;
    let spaceNumberPrice = 40 - object.price.length;
    inLineDivider2 = space.repeat(spaceNumberName);
    inLineDivider3 = space.repeat(spaceNumberPrice);
    if(id < 10) {
        spaceProdIdAdjust = space.repeat(spaceProdIdDefault);
    } else if(id > 9 && id < 100) {
        spaceProdIdAdjust = space.repeat(spaceProdIdDefault - 1);
    };
    if(who === 'products') {
        console.log(`Product ID: ${id}${spaceProdIdAdjust}Product Name: ${name}${spaceProdNameAdjust}Price: $${price}`);
    } else if(who === 'cart') {
        console.log(`Product Name: ${name}${spaceCartNameAdjust}Price: $${price}${spaceCartPriceAdjust}Quantity: ${requested}`);
    };
};

const appExit = () => {
    sqlDBConnection.end();
};