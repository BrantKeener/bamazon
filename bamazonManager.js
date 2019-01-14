
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
        return '\nWhat else would you like to do today?';
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
            viewProducts(true, 'add');
            break;
            case 'Exit':
            appExit();
            break;
        };
    });
})();

// This multipurpose list builder will make the DB query, and then put the items together to pass into the actual display builder.

const viewProducts = (all, item) => {
    const productLowLimit = 5;
    // You'll notice these tertiary operators throughout the code. It evaluates the item before the ?, and returns the item preceding the colon if it is true,
    // and the anteceding item if false
    const message = all ? `All Inventory Displayed\n` : `Low Quantity Inventory Displayed\n`;
    const query = all ? 'SELECT id, product_name, price, stock_quantity FROM products' : 
    `SELECT id, product_name, price, stock_quantity FROM products WHERE stock_quantity <= ?`;
    const parameter = all ? '' : productLowLimit;
    let idArray = [];
    let nameArray = [];
    sqlDBConnection.query(query, parameter, (err, res) => {
        if(err) throw err;
        for(let i = 0; i < Object.keys(res).length; i++){
            let id = res[i].id;
            let product = res[i].product_name;
            let price = res[i].price;
            let quantity = res[i].stock_quantity;
            idArray.push(id);
            nameArray.push(product.replace(/\s/g, '').toLowerCase());
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
                    newProducts(nameArray);
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
                let fail = res.match(/['a-z']/g) || res.match(/\D/g);
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

// Collect the manager's input data to pass to a validation function

const newProducts = (nameArray) => {
    inquirer.prompt([
        {
            input: 'type',
            message: `You have chosen to add a new item. Please enter the name you would like to appear for this item.`,
            name: `newName`,
            validate: (res) => {
                let sterileRes = res.replace(/\s/g, '').toLowerCase();
                let fail1 = res.length < 1 || nameArray.includes(sterileRes)
                let short = res.length < 1;
                if(!fail1) {
                    return true;
                };
                return short ? `This cannot be blank.` : `That name already exists. Please enter a name that is different than already existing products.`;
            }
        },
        {
            input: 'type',
            message: `What department would you like to add this item to?`,
            name: `newDepartment`,
            validate: (res) => {
                let short = res.length < 1;
                if(!short) {
                    return true;
                };
                return short ? `This cannot be blank.` : `That name already exists. Please enter a name that is different than already existing products.`;
            }
        },
        {
            input: 'type',
            message: `What is the price for this item per unit? (Use this format: xxxx where the last 2 digits are the cents value.)`,
            name: 'newPrice',
            validate: (res) => {
                let fail1 = res.match(/\D/g);
                let fail2 = res.length < 2;
                if(fail2) {
                    return 'You must enter at least 2 digits for this number to be valid.'
                } else if(!fail1) {
                    return true;
                }
                return 'Please enter your numerical quantity in this format: xxxx (where the last 2 digits are the cents value.'
            }
        },
        {
            input: 'type',
            message: 'How many of the new item will be placed into stock?',
            name: 'newQuantity',
            validate: (res) => {
                let pass = res.match(/[0-9]/g);
                let fail = res.match(/['a-z']/g) || res.match(/\D/g);
                if(pass && !fail) {
                    return true;
                };
                return 'Please enter a valid numerical quantity.'
            }
        }
    ]).then(res => {
        const name = res.newName;
        const department = res.newDepartment;
        const priceBuildArray = res.newPrice.split('');
        const quantity = res.newQuantity;
        priceBuildArray.splice((priceBuildArray.length - 2), 0, '.');
        const price = priceBuildArray.join('');
        const newItemObject = {
            nameArray: nameArray,
            name: name,
            department: department,
            quantity: quantity,
            price
        }
        newItemInputConfirm(newItemObject);   
    });
};

// Since there is a bit of data entry, and the DB will be updated, we want to make sure the user has entered their input correctly.
// The newItemObject is called object, and will be passed from this function as such.

const newItemInputConfirm = (object) => {
    console.log(`\nYou have entered the following information:\nProduct Name: ${object.name}\nDepartment: ${object.department}\nPrice: $${object.price}\nQuantity: ${object.quantity}\n`);
    inquirer.prompt([
        {
            type: 'confirm',
            message: `Is this correct?`,
            default: false,
            name: 'infoConfirm'
        }
    ]).then(res => {
        // We want the user to confirm their choice as it could be a lot of data entry loss if they continually hit the wrong answer.
        let confirmOne = res.infoConfirm
        if(confirmOne === false) {
            console.log('\nYou have answered that the information is incorrect.');
            inquirer.prompt([
                {
                    type: 'list',
                    message: 'What would you like to do next?',
                    choices: ['Correct Incorrect Value', 'Start Over with New Product Add', 'Return to Main Menu', 'Exit Program\n'],
                    name: 'doNext'
                }
            ]).then(res => {
                switch(res.doNext) {
                    case('Correct Incorrect Value'):
                    correction(object);
                    break;
                    case('Start Over with New Product Add'):
                    newProducts(object.nameArray);
                    break;
                    case('Return to Main Menu'):
                    openPrompt(1, undefined);
                    break;
                    case('Exit Program'):
                    appExit();
                    break;
                }
            });
        } else {
            console.log('\n***Warning:***\nBy answering yes, you will update the production database. Please verify all information is correct once more.\n');
            inquirer.prompt([
                {
                    type: 'confirm',
                    message: 'Answering yes will update the database.',
                    name: 'dbUpdateConfirm'
                }
            ]).then(res => {
                if(res.dbUpdateConfirm) {
                    dbAdder(object);
                } else {
                    console.log(`\n***Database has not been updated. Please recheck data, and perform appropriate actions.***\n`);
                    newItemInputConfirm(object);
                }
            });
        };
    });
};

const correction = (object) => {
    inquirer.prompt([
        {
            type: 'list',
            message: 'What would you like to edit?',
            choices: [`Product Name: ${object.name}`, `Department: ${object.department}`, `Price: ${object.price}`, `Quantity: ${object.quantity}`],
            name: 'editChoice'
        }
    ]).then(res => {
        console.log(res.editChoice);
        switch(res.editChoice) {
            case (`Product Name: ${object.name}`):
            inquirer.prompt([
                {
                    input: 'type',
                    message: `You have chosen to add a new item. Please enter the name you would like to appear for this item.`,
                    name: `newName`,
                    validate: (res) => {
                        let sterileRes = res.replace(/\s/g, '').toLowerCase();
                        let fail1 = res.length < 1 || object.nameArray.includes(sterileRes)
                        let short = res.length < 1;
                        if(!fail1) {
                            return true;
                        };
                        return short ? `This cannot be blank.` : `That name already exists. Please enter a name that is different than already existing products.`;
                    }
                }
            ]).then(res => {
                object.name = res.newName;
                newItemInputConfirm(object);
            });
            break;
            case (`Department: ${object.department}`):
            inquirer.prompt([
                {
                    input: 'type',
                    message: `What department would you like to add this item to?`,
                    name: `newDepartment`,
                    validate: (res) => {
                        let short = res.length < 1;
                        if(!short) {
                            return true;
                        };
                        return short ? `This cannot be blank.` : `That name already exists. Please enter a name that is different than already existing products.`;
                    }
                }
            ]).then(res => {
                object.department = res.newDepartment;
                newItemInputConfirm(object);
            });
            break;
            case (`Price: ${object.price}`):
            inquirer.prompt([
                {
                    input: 'type',
                    message: `What is the price for this item per unit? (Use this format: xxxx where the last 2 digits are the cents value.)`,
                    name: 'newPrice',
                    validate: (res) => {
                        let fail1 = res.match(/\D/g);
                        let fail2 = res.length < 2;
                        if(fail2) {
                            return 'You must enter at least 2 digits for this number to be valid.'
                        } else if(!fail1) {
                            return true;
                        }
                        return 'Please enter your numerical quantity in this format: xxxx (where the last 2 digits are the cents value.'
                    }
                }
            ]).then(res => {
                object.price = res.newPrice;
                newItemInputConfirm(object);
            });
            break;
            case (`Quantity: ${object.quantity}`):
            inquirer.prompt([
                {
                    input: 'type',
                    message: 'How many of the new item will be placed into stock?',
                    name: 'newQuantity',
                    validate: (res) => {
                        let pass = res.match(/[0-9]/g);
                        let fail = res.match(/['a-z']/g) || res.match(/\D/g);
                        if(pass && !fail) {
                            return true;
                        };
                        return 'Please enter a valid numerical quantity.'
                    }
                }
            ]).then(res => {
                object.quantity = res.newQuantity;
                newItemInputConfirm(object);
            });
            break;
        };
    });
};

// Add the new items to the database

const dbAdder = (object) => {
    let name = object.name;
    let department = object.department;
    let price = Number(object.price);
    let quantity = Number(object.quantity);
    sqlDBConnection.query(`INSERT INTO products (product_name, department_name, price, stock_quantity)
    VALUES ('${name}', '${department}', ${price}, ${quantity})`, (err, res) => {
        if(err) throw err;
    });
    console.log(`\nYou have successfully added:\n\nProduct Name: ${name}\n\nto the avaiable products.\n`);
    openPrompt(1, undefined);
}

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

// Allow user to quit

const appExit = () => {
    sqlDBConnection.end();
};