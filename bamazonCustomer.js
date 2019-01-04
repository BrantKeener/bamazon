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
    sqlDBConnection.query('SELECT * FROM products', (err, res) => {
        if(err) throw err;
        for(let i = 0; i < Object.keys(res).length; i++) {
            let id = res[i].id;
            let name = res[i].product_name;
            let price = res[i].price;
            idArray.push(id);
            nameArray.push(name);
            priceArray.push(price);
        };
        productListLoad(idArray, nameArray, priceArray);
    });
};

//  Load the list of products
const productListLoad = (id, name, price) => {
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
    whichProduct(id, name, price);
};

const whichProduct = (id, name, price) => {
    console.log(`\n`);
    inquirer.prompt([
        {
        type: 'input',
        message: 'Please enter the item ID of the item you are interested in: ',
        name: 'whichProduct',
        }
    ]).then(res => {
        if(id.includes(parseInt(res.whichProduct))) {
            console.log('We have that item!');
        } else {
            console.log('\n***Warning***\nThat is not a valid ID number, please look at the list again, and choose a valid ID number.\n');
            productListLoad(id, name, price);
        };
    })
};

// const howMuchProduct = () => {

// };