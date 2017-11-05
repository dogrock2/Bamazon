const inquirer = require("inquirer");
const SQLmain = require('./SQLmain.js');
const clear = require("clear");
const {table} = require('table');
const run = new SQLmain();

let deptList = [];

/**
 * Prototype function to get all the available dept and add them into an array to be
 * used when adding a new item.
 */
SQLmain.prototype.getAllDept = function () {
    this.myQuery = 'SELECT dept_name FROM departments';
    this.connection.query(this.myQuery, (err, res) => {
        if (err) {
            throw err;
        } else {
            for (let i = 0; i < res.length; i++)
                if (deptList.lastIndexOf(res[i].dept_name) === -1)
                    deptList.push(res[i].dept_name);
        }
    });
};

/**
 * This prototype runs 2 queries depending on the parameter passed to it. It will either
 * display all available items in a table or only items that have a stock quanity of less than 5.
 */
SQLmain.prototype.displayMngrDB = function (queryOption) {
    this.queryOption = queryOption;
    this.myQueries = ['SELECT * FROM products', 'SELECT * FROM products WHERE stock_quantity < 5'];
    this.datas = [
        ['Item Number'.blue, 'Description'.yellow, 'Department'.blue, 'Price ea.'.green, 'QTY Avail'.red]
    ];
    this.connection.query(this.myQueries[this.queryOption], (err, res) => {
        if (err) {
            throw err;
        } else {
            for (let i = 0; i < res.length; i++) {
                this.datas.push([`${res[i].item_id}`, `${res[i].product_name}`, `${res[i].department_name}`, `$${res[i].price}`, `${res[i].stock_quantity}`]);                
            } //ends for loop
        } //ends else      
        this.output = table(this.datas);
        if(this.queryOption === 0)
           console.log(` All availbale products.`.bgCyan);
        else
           console.log(` LOW STOCK ITEMS`.bgCyan);   
        console.log(this.output);
    }); //ends connection.query
}; //ends displayDB

/**
 * This prototype updates the items quantity by adding the parameter passed to it by its current value. 
 * You choose the item to update by the id number.
 */
SQLmain.prototype.updateMngrDB = function (idIn, qtyIn) {
    this.idIn = idIn;
    this.qtyIn = qtyIn;
    this.connection.query(`SELECT stock_quantity FROM products WHERE item_id=${parseInt(this.idIn)}`, (err, res) => {
        if (err) {
            throw err;
        } else {
            this.qtyVal = parseInt(res[0].stock_quantity) + parseInt(this.qtyIn);
            this.connection.query('UPDATE products set ? where ?', [{
                    stock_quantity: this.qtyVal
                },
                {
                    item_id: this.idIn
                }
            ]);
        }
    });
};

/**
 * This prototype runs query to add a new item.
 */
SQLmain.prototype.addItemMngrDB = function (name, dept, price, qty) {
    this.name = name;
    this.dept = dept;
    this.price = price;
    this.qty = qty;
    this.connection.query(`INSERT INTO products (product_name, department_name, price, 
        stock_quantity) VALUES ('${this.name}','${this.dept}',${this.price},${this.qty})`, (err, res) => {
        if (err) {
            throw err;
        } else {
            console.log('Item added');
        }
    });
};

/**
 * This gets called to prompt the manager to select the item he wants to update and type 
 * in the quantity to add.
 */
let addInvPrompt = () => {
    inquirer.prompt([{
        type: 'input',
        message: 'Select the ID to modify.',
        name: 'id',
    }, {
        type: 'input',
        message: 'Quantity to add.',
        name: 'qty',
    }]).then(passedVals => {
        run.updateMngrDB(passedVals.id, passedVals.qty);
        setTimeout(function () {
            callPrompt();
        }, 200);
    });
};

//Main prompt Menu for the manager.
let callPrompt = () => {
    let myOptions = ['View Products for Sale.', 'View Low Inventory', 'Add more to Inventory', 'Add New Product', 'Exit'];
    inquirer.prompt([{
        type: 'list',
        message: 'Manager - What will you like to do?.',
        choices: myOptions,
        name: 'choice'
    }]).then(passedVals => {
        if (passedVals.choice === 'View Products for Sale.') {
            clear();
            run.displayMngrDB(0);
            setTimeout(function () {
                callPrompt();
            }, 200);
        }
        if (passedVals.choice === 'View Low Inventory') {
            clear();
            run.displayMngrDB(1);
            setTimeout(function () {
                callPrompt();
            }, 200);
        }
        if (passedVals.choice === 'Add more to Inventory')
            addInvPrompt();

        if (passedVals.choice === 'Add New Product')
            addNewItemPrompt();

        if (passedVals.choice === 'Exit')
            process.exit();
    });
}; //ends callPrompt

/**
 * When a new item is going to be added this function gets called 
 * and prompts the manager for all the input needed for a new item.
 */
let addNewItemPrompt = () => {
    clear();
    run.displayMngrDB(0);
    setTimeout(function () {
        inquirer.prompt([{
            type: 'list',
            message: 'To what dept do you want to add a new item?',
            choices: deptList,
            name: 'choice'
        }, {
            type: 'input',
            message: 'What is the name of the item?',
            name: 'name',
        }, {
            type: 'input',
            message: 'What is the price of the item?',
            name: 'price',
            validate: function (val) {
                if (!isNaN(val))
                    return true;
                else
                    return `Error: Enter only numbers.,`;
            }
        }, {
            type: 'input',
            message: 'How many to add to stock?',
            name: 'qty',
            validate: function (val) {
                if (!isNaN(val))
                    return true;
                else
                    return `Error: Enter only numbers.,`;
            }
        }]).then(values => {
            run.addItemMngrDB(values.name, values.choice, values.price, values.qty);
            setTimeout(function () {
                callPrompt();
            }, 200);
        });

    }, 200);

};

//These get called upon start.
run.getAllDept();
callPrompt();