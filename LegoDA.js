const jsonfile = require('jsonfile');
const fs = require('fs');

function BrickEntry(name, amount) {
    return {
        name: name,
        amount: amount
    }
}

function LegoDA() {
    const fileName = "legodb.json";
    var db = {};

    if (fs.existsSync(fileName)) {
        db = jsonfile.readFileSync(fileName);
    } else {
        console.error("Missing legodb.json, use the generator in preprocessing/app.js to create one, move it to the root and restart");
    }

    this.queryParts = function (queryString, maxItems = 10) {
        queryString = queryString.split(" ").join("");

        return db.parts.filter(function (data) {
            if (data.name.toLowerCase().split(" ").join("").match(new RegExp(queryString, "gi")) != null) {
                maxItems--;
                return maxItems > 0;
            } else return false;
        }).map(function (value, index, array) {
            value.category = db.categories.find(function (element, index, array) {
                return value.categoryId == element.id;
            }).name;

            return value;
        });
    };

    this.getCategories = function() {
        return db.categories;
    };

    this.save = function () {
        jsonfile.writeFileSync(fileName, db);
    }
}

module.exports = LegoDA;