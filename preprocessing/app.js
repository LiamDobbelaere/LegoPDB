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