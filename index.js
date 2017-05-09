const LegoDA = require("./LegoDA");
const db = new LegoDA();

console.log(db.queryParts("wheel"));