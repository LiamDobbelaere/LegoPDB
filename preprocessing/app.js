const csv = require('csvtojson');
const async = require('async');
const jsonfile = require('jsonfile');

var out = {};

function convertColors(callback) {
    csv({
        headers: ['id', 'name', 'hex', 'transparent']
    })
        .fromFile('colors.csv')
        .on('json', (jsonObj)=> {
            jsonObj.id = parseInt(jsonObj.id);
            jsonObj.hex = "#" + jsonObj.hex;
            jsonObj.transparent = jsonObj.transparent == "t";
        })
        .on('end_parsed', (jsonArray) => {
            callback(null, jsonArray);
        });
}

function convertParts(callback) {
    csv({
        headers: ['id', 'name', 'categoryId']
    })
        .fromFile('parts.csv')
        .on('json', (jsonObj)=> {
            jsonObj.categoryId = parseInt(jsonObj.categoryId);
        })
        .on('end_parsed', (jsonArray) => {
            callback(null, jsonArray);
        });
}

function convertCategories(callback) {
    csv({
        headers: ['id', 'name']
    })
        .fromFile('part_categories.csv')
        .on('json', (jsonObj)=> {
            jsonObj.id = parseInt(jsonObj.id);
        })
        .on('end_parsed', (jsonArray) => {
            callback(null, jsonArray);
        });
}


async.parallel({
    colors: convertColors,
    parts: convertParts,
    categories: convertCategories
}, function(err, results) {
    out.colors = results.colors;
    out.parts = results.parts;
    out.categories = results.categories;
    out.parts = out.parts.sort(function(a, b) {
        return a.name.length - b.name.length;
    }); //There's no point sorting by ID because it's non-numeric, and sorting by name length makes searching easier
    out.simplecolors = [
        {
            "id": 0,
            "name": "Black",
            "hex": "#000000",
            "transparent": false
        },
        {
            "id": 1,
            "name": "Brown",
            "hex": "#8B4513",
            "transparent": false
        },
        {
            "id": 2,
            "name": "Red",
            "hex": "#FF0000",
            "transparent": false
        },
        {
            "id": 3,
            "name": "Orange",
            "hex": "#FFA500",
            "transparent": false
        },
        {
            "id": 4,
            "name": "Yellow",
            "hex": "#FFFF00",
            "transparent": false
        },
        {
            "id": 5,
            "name": "Green",
            "hex": "#008000",
            "transparent": false
        },
        {
            "id": 6,
            "name": "Blue",
            "hex": "#0000FF",
            "transparent": false
        },
        {
            "id": 7,
            "name": "Purple",
            "hex": "#9CA3A8",
            "transparent": false
        },
        {
            "id": 8,
            "name": "Grey",
            "hex": "#A9A9A9",
            "transparent": false
        },
        {
            "id": 9,
            "name": "White",
            "hex": "#FFFFFF",
            "transparent": false
        }
    ];
    out.stock = [];

    jsonfile.writeFileSync("legodb.json", out);

    console.log("Exported");

    //Search code example
    /*var maxItems = 10;
    console.log(out.parts.filter(function (data) {
        if (data.name.toLowerCase().match(/brick/gi) != null) {
            maxItems--;
            return maxItems > 0;
        } else return false;
    }));*/
});