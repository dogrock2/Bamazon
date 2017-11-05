const inquirer = require("inquirer");
const SQLmain = require('./SQLmain.js');
const clear = require("clear");

let run = new SQLmain();

/**
 * Prompts customer for the info needed to make a purchase.
 */
let startPurchase = () => {
    inquirer.prompt([{
            type: 'input',
            message: 'What is the ID of the item you wish to buy?',
            name: 'id',
            validate: function (val) {
                if (!isNaN(val))
                    return true;
                else
                    return `Error: Enter only numbers.,`;
            }
        },
        {
            type: 'input',
            message: 'How many units would you like to buy?',
            name: 'amount',
            validate: function (val) {
                if (!isNaN(val))
                    return true;
                else
                    return `Error: Enter only numbers.,`;
            }
        },
    ]).then(passedVals => {
        run.processOrder(passedVals.id, passedVals.amount);
        setTimeout(function () {
            shopAgain();
        }, 400);

    });

};

/**
 * Asks the customer if they want to make another purchase.
 */
let shopAgain = () => {

    inquirer.prompt([{
        type: 'input',
        message: 'Would you like to make another purchase?',
        name: 'value',
        validate: function (val) {
            if (isNaN(val) && val.length === 1)
                if ((val === 'y' || val === 'Y') || (val === 'n' || val === 'N'))
                    return true;
                else
                    return `Error: Enter only y for yes or n for no.`;
        }
    }]).then(passedVals => {
        if (passedVals.value === 'y' || passedVals.value === 'Y') {
            run = new SQLmain();
            clear();
            runDisplay(startPurchase);
        } else {
            console.log(`\nGood Bye`);
            run.dbDisconnect();
        }
    });
};

//Callback
function runDisplay(fnc) {
    run.displayDB();
    setTimeout(function () {
        fnc();
    }, 600);
}

///Runs on start.
clear();
runDisplay(startPurchase);