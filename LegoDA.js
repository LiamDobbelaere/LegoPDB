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

    this.getCategories = function() {
        return db.categories.sort(function(a, b) {
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

    this.Color = function(hexVal) { //define a Color class for the color objects
        this.hex = hexVal;
    };

    this.constructColor = function(colorObj){
        var hex = colorObj.hex.substring(1);
        /* Get the RGB values to calculate the Hue. */
        var r = parseInt(hex.substring(0, 2), 16) / 255;
        var g = parseInt(hex.substring(2, 4), 16) / 255;
        var b = parseInt(hex.substring(4, 6), 16) / 255;

        /* Getting the Max and Min values for Chroma. */
        var max = Math.max.apply(Math, [r, g, b]);
        var min = Math.min.apply(Math, [r, g, b]);


        /* Variables for HSV value of hex color. */
        var chr = max - min;
        var hue = 0;
        var val = max;
        var sat = 0;


        if (val > 0) {
            /* Calculate Saturation only if Value isn't 0. */
            sat = chr / val;
            if (sat > 0) {
                if (r == max) {
                    hue = 60 * (((g - min) - (b - min)) / chr);
                    if (hue < 0) {
                        hue += 360;
                    }
                } else if (g == max) {
                    hue = 120 + 60 * (((b - min) - (r - min)) / chr);
                } else if (b == max) {
                    hue = 240 + 60 * (((r - min) - (g - min)) / chr);
                }
            }
        }
        colorObj.chroma = chr;
        colorObj.hue = hue;
        colorObj.sat = sat;
        colorObj.val = val;
        colorObj.luma = 0.3 * r + 0.59 * g + 0.11 * b;
        colorObj.red = parseInt(hex.substring(0, 2), 16);
        colorObj.green = parseInt(hex.substring(2, 4), 16);
        colorObj.blue = parseInt(hex.substring(4, 6), 16);
        return colorObj;
    };

    this.getColors = function() {
        return db.colors.sort(function(a, b) {
            var aObj = self.constructColor(new self.Color(a.hex));
            var bObj = self.constructColor(new self.Color(b.hex));

            return aObj.hue - bObj.hue;
        });
    };

    this.save = function () {
        jsonfile.writeFileSync(fileName, db);
    }
}

module.exports = LegoDA;