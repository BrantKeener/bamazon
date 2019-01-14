// TODO Seperate out SQL stuff into a module

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

//  Build up a list that is passed into the listDisplayer()ap
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
            validate: (res) => {
                let pass = res.match(/^[0-9]/g);
                let fail = res.match(/['a-z']/g);
                if(pass && !fail) {
                    return true;
                }
                return 'Please enter a valid numerical quantity';
            }
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
    });
};

// User inputs how much of the item they want, and this quantity is evaluated against the stock. If > stock, user has a choice to enter a new quantity, 
// choose a different item, or exit. If we have enough quantity (including if the customer adds the same item twice), addToCart fires.
// This also adds up the total requested if the user chooses the same item twice.
const howMuchProduct = (chosen) => {
    inquirer.prompt([
        {
            type: 'input',
            message: 'How many of this item would you like to purchase?',
            name: 'quantity',
            validate: (res) => {
                let pass = res.match(/^[0-9]/g);
                let fail = res.match(/['a-z']/g);
                if(pass && !fail) {
                    return true;
                }
                return 'Please enter a valid numerical quantity';
            }
        }
    ]).then(res => {
        let alreadyReqQuant = 0;
        let prevIndex = -1;
        if(customerCart.length > 0) {
            for(let i = 0; i < customerCart.length; i++) {
                if(customerCart[i].id === chosen.id) {
                    alreadyReqQuant += parseInt(customerCart[i].requested, 10);
                    prevIndex = i;
                };
            };
        };
        if(parseInt(res.quantity, 10) + parseInt(alreadyReqQuant, 10) > chosen.stock) {
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
                requested: parseInt(res.quantity, 10) + parseInt(alreadyReqQuant, 10)
            }
            addToCart(chosenWithQuant, prevIndex);
        };
    });
};

// Adds the item to the customer's cart. Update the cart if the user chooses the same item twice, or build a new item if not.
const addToCart = (chosen, prevIndex) => {
    if(prevIndex !== -1) {
        customerCart[prevIndex].requested = chosen.requested;
    } else {
        customerCart.push(chosen);
    };
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
        if(i === customerCart.length - 1) {
            shopOrCheckout();
        };
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
        let length = Object.keys(object).length;
        for(let i = 0; i < length/length; i ++) {
            console.log(`Product Name: ${name}${spaceCartNameAdjust}Price: $${price}${spaceCartPriceAdjust}Quantity: ${requested}`);
        };
    };
};

// Allow the user to choose to checkout
const shopOrCheckout = () => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Would you like to checkout, or continue shopping?',
            choices: ['Continue Shopping', 'Checkout'],
            name: 'shopOrOut'
        }
    ]).then(res => {
        if(res.shopOrOut === 'Continue Shopping') {
            productArrayBuild();
        } else if(res.shopOrOut === 'Checkout') {
            finalCheckout();
        };
    });
};

// This will calculate the total price, and display it to the customer.
const finalCheckout = () => {
    let idArray = [];
    let requesetdArray = [];
    let priceArray = [];
    let space = ` `;
    console.log('\nYou have successfully ordered the following items: \n');
    for(let i = 0; i < customerCart.length; i++) {
        let id = customerCart[i].id;
        let name = customerCart[i].name;
        let price = customerCart[i].price;
        let requested = customerCart[i].requested;
        let totalPrice = (price * requested).toFixed(2);
        let nameSpaceDefault = 30;
        let requestedSpaceDefault = 15;
        let nameSapceAdjust = space.repeat(nameSpaceDefault - customerCart[i].name.length);
        let requestedSapceAdjust = space.repeat(requestedSpaceDefault - (customerCart[i].requested).toString().length);
        idArray.push(id);
        requesetdArray.push(requested);
        priceArray.push(totalPrice);
        let logString = `Item Name: ${name}${nameSapceAdjust} Number Ordered: ${requested}${requestedSapceAdjust} Sub Total: $${totalPrice}`;
        console.log(logString);
    };
    let totalSpace = space.repeat(66);
    let orderTotal = () => {
        let x = 0;
        for(let i = 0; i < priceArray.length; i++) {
           x += parseFloat(priceArray[i]);
        };
        return x.toFixed(2);
    };
    console.log(`\n${totalSpace}Order Total Price: $${orderTotal()}`);
    inventoryAdjust(idArray, requesetdArray);
};

const inventoryAdjust = (id, req) => {
    let idSearch = id.join(',');
    sqlDBConnection.query(`SELECT stock_quantity FROM products WHERE id IN(${idSearch})`, (err, res) => {
        if(err) throw err;
        for(let i = 0; i < res.length; i++) {
            let tempArray = parseInt(res[i].stock_quantity) - parseInt(req[i], 10);
            sqlDBConnection.query(`UPDATE products SET stock_quantity = ? WHERE id = ?`, [tempArray, id[i]], (err, res) => {
                if(err) throw err;
            });
        };
        disconnect();
    });
};

const appExit = () => {
    finalCheckout();
    console.log('Thank you for your patronage!');
};

const disconnect = () => {
    sqlDBConnection.end();
}