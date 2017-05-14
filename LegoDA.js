const jsonfile = require('jsonfile');
const fs = require('fs');
const Color = require('./color');

function LegoDA() {
    const fileName = "legodb.json";
    const imageDir = "public/assets/media/brickdb/";
    var db = {};
    var self = this;

    if (fs.existsSync(fileName)) {
        db = jsonfile.readFileSync(fileName);
    } else {
        console.error("Missing legodb.json, use the generator in preprocessing/app.js to create one, move it to the root and restart");
    }

    this.queryParts = function (queryString, categorySelection, maxItems = 10) {
        queryString = queryString.split(" ").join(".*?");

        return db.parts.filter(function (data) {
            if (categorySelection.indexOf(data.categoryId) == -1
                && data.name.toLowerCase().split(" ").join("").match(new RegExp(queryString, "gi")) != null
                || data.id == queryString) {
                maxItems--;
                return maxItems > 0;
            } else return false;
        }).map(function (value, index, array) {
            value.category = db.categories.find(function (element, index, array) {
                return value.categoryId == element.id;
            }).name;

            value.hasImage = fs.existsSync(imageDir + value.id + ".jpg");

            return value;
        });
    };

    this.getCategories = function () {
        return db.categories.sort(function (a, b) {
            var nameA = a.name.toUpperCase();
            var nameB = b.name.toUpperCase();

            if (nameA < nameB) {
                return -1;
            }

            if (nameA > nameB) {
                return 1;
            }

            // names must be equal
            return 0;
        });
    };

    this.getColors = function () {
        return db.colors.sort(function (a, b) {
            var aObj = new Color(a.hex);
            var bObj = new Color(b.hex);

            return aObj.hue - bObj.hue;
        });
    };

    this.getSimpleColors = function () {
        return db.simplecolors;
    };

    this.addToStock = function (stockEntry) {
        var filteredStock = db.stock.find(function (existingStockItem) {
            return existingStockItem.partid == stockEntry.partid;
        });

        if (filteredStock === undefined) {
            db.stock.push(stockEntry);
        } else {
            stockEntry.simplequantities.forEach(function (colorEntry) {
                var existingEntry = filteredStock.simplequantities.find(function (existingColor) {
                    return existingColor.colorid == colorEntry.colorid;
                });

                if (existingEntry === undefined) {
                    filteredStock.simplequantities.push(colorEntry);
                } else {
                    existingEntry.quantity += colorEntry.quantity;
                }
            });
        }

        self.save();
    };

    this.getStock = function() {
        return db.stock.map(function(stockEntry) {
            stockEntry.brick = db.parts.find(function(part) {
                return part.id == stockEntry.partid;
            });

            console.log(stockEntry.partid);

            stockEntry.simplequantities = stockEntry.simplequantities.map(function (quantity) {
                quantity.color = db.colors.find(function(color) {
                    return color.id == quantity.colorid;
                });

                return quantity;
            });

            stockEntry.totalcount = stockEntry.simplequantities.reduce(function(acc, cur) {
                return acc + cur.quantity;
            }, 0);

            return stockEntry;
        });
    };

    this.save = function () {
        jsonfile.writeFileSync(fileName, db);
    }
}

module.exports = LegoDA;