const csv = require('csvtojson');
const async = require('async');

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


async.parallel({
    colors: convertColors,
    parts: convertParts
}, function(err, results) {
    console.log(results.parts);
});