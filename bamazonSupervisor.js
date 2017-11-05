const inquirer = require("inquirer");
const SQLmain = require('./SQLmain.js');
const clear = require("clear");
const {table} = require('table');

let run = new SQLmain();

/**
 * Supervisors prototype that runs the query to display in a table the PRODUCT SALES sorted by DEPARTMENT.
 */
SQLmain.prototype.getPSales = function () {
    this.datas = [
        ['Dept ID'.blue, 'Dept Name'.yellow, 'Overhead Costs'.blue, 'Product Sales'.green, 'Total Profit'.green]
    ];
    this.profitQuery = `SELECT  departments.dept_id,departments.dept_name,departments.over_head_costs,sumTable.pSales, 
        departments.over_head_costs - sumTable.pSales AS total_profit FROM (SELECT  department_name, SUM(product_sales) AS pSales 
        FROM products GROUP BY department_name) as sumTable, departments WHERE departments.dept_name = sumTable.department_name`;

    this.connection.query(this.profitQuery, (err, res) => {
        if (err) {
            throw err;
        } else {
            for (let i = 0; i < res.length; i++)
                this.datas.push([`${res[i].dept_id}`, `${res[i].dept_name}`, `$${res[i].over_head_costs}`, `$${res[i].pSales}`, `$${res[i].total_profit}`]);
        }
        clear();
        this.output = table(this.datas);
        console.log(` Product Sales by Department.`.bgCyan);
        console.log(this.output);
    });
};

/**
 * This prototype allows the supervisor to add a new dept to the database.
 */
SQLmain.prototype.addNewDept = function (deptName,overHead) {
     this.deptName = deptName;
     this.overHead = overHead;
     this.addDeptQuery = `INSERT INTO departments (dept_name, over_head_costs) VALUES ('${this.deptName}', ${this.overHead})`;
     this.connection.query(this.addDeptQuery, (err, res) => {
        if (err) {
            throw err;
        } else {
            console.log(`${this.deptName} department added.`);
        }
    });
};

//Main menu for the supervisor.
let callPrompt = () => {
    let myOptions = ['View Product Sales by Department.', 'Create New Department.', 'Exit'];
    inquirer.prompt([{
        type: 'list',
        message: 'Supervisor - What do you like to do?.',
        choices: myOptions,
        name: 'choice'
    }]).then(passedVals => {
        if (passedVals.choice === 'View Product Sales by Department.') {            
            run.getPSales();
            setTimeout(function () {
                callPrompt();
            }, 200);
        }
        if (passedVals.choice === 'Create New Department.') {//if the supervisor selects to add a new dept
            inquirer.prompt([{                               //a new set of questions are prompt.
                type: 'input',
                message: 'What is the new department name?',
                name: 'name'
            }, {
                type: 'input',
                message: 'What is the overhead costs for the new dept?',
                name: 'cost',
                validate: function (val) {
                    if (!isNaN(val))
                        return true;
                    else
                        return `Error: Enter only numbers.,`;
                }
            }]).then(vals => {
                run.addNewDept(vals.name,vals.cost);
                setTimeout(function () {
                    callPrompt();
                }, 200);            
            });
        }
        if (passedVals.choice === 'Exit')
            process.exit();
    });
};

callPrompt();//Call upon start.