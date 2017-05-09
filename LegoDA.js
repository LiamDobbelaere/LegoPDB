const jsonfile = require('jsonfile');
const fs = require('fs');

function BrickEntry(name, amount) {
    return {
        name: name,
        amount: amount
    }
}

function LegoDA() {
    const fileName = "LegoDB.json";
    var stock = [];

    if (fs.existsSync(fileName)) {
        stock = jsonfile.readFileSync("LegoDB.json");
    } else {
        stock.push(new BrickEntry("test", 6));
        jsonfile.writeFileSync(fileName, stock);
    }

    this.getStock = function() {
        return stock;
    };

    this.save = function() {
        jsonfile.writeFileSync(fileName, stock);
    }
}

module.exports = LegoDA;