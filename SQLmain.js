const {table} = require('table');
const color = require('colors');
const mysql = require("mysql");

/**
 * Main database function for customers to connect and disconnect from database, view products
 * and make purchases.
 */
let SQLmain = function () {

    this.data = [
        ['Item Number'.blue, 'Description'.yellow, 'Department'.blue, 'Price'.green]
    ];
    this.output = '';
    this.listOfIds = [];

    this.connection = mysql.createConnection({ //Parameters to connect to db.
        host: "localhost",
        port: 3306,
        user: 'alex',
        password: 'password',
        database: 'bamazon'
    });

    this.dbDisconnect = function () {//Function to allow disconnect from the db
        this.connection.end();
    };

    this.displayDB = function () {//Displays all products available
        this.connection.query('SELECT * FROM products', (err, res) => {
            if (err) {
                throw err;
            } else {
                for (let i = 0; i < res.length; i++) {
                    this.listOfIds.push(res[i].item_id.toString());
                    this.data.push([`${res[i].item_id}`, `${res[i].product_name}`, `${res[i].department_name}`, `$${res[i].price}`]);
                } //ends for loop
            } //ends else      
            console.log(` Available items for sale.`.bgCyan);
            this.output = table(this.data);
            console.log(this.output);
        }); //ends connection.query
    }; //ends displayDB

    this.processOrder = function (id, qty) {//Runs quesries to allow purchase to go through
        this.id = id;
        this.qty = qty;
        this.okToBuy = false;
        if(this.listOfIds.indexOf(this.id) !== -1){
            this.connection.query(`SELECT stock_quantity,price,product_name FROM products WHERE item_id=${parseInt(this.id)}`, (err, res) => {
                if (err) {
                    throw err;
                } else {
                    if (this.qty <= res[0].stock_quantity) {
                        this.newQty = res[0].stock_quantity - this.qty;
                        this.newVal = res[0].price * this.qty;
                        this.connection.query('UPDATE products SET ? WHERE ?', [{
                                stock_quantity: this.newQty,
                                product_sales: this.newVal
                            },
                            {
                                item_id: this.id
                            },
                        ]);
                        console.log(`You purchased ${this.qty} ${res[0].product_name}(s) for a total of $${this.newVal}`);                    
                    } else {
                        console.log(`Sorry! We only have ${res[0].stock_quantity} ${res[0].product_name}(s) in stock.`);                    
                    }
                } //ends else               
            }); //ends connection.query
        } else {
            console.log('Invalid ID. Transaction cancelled.'.red);
        }
    };

    this.dbConnect = function () {//connects o db
        this.connection.connect(function (err) {
            if (err) throw err;
        });
    };
    this.dbConnect();
}; //ends SQLmain function


module.exports = SQLmain;