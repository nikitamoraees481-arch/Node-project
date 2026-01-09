var mysql = require("mysql2");
var util = require("util");


const conn = mysql.createConnection({
    host: "b6yfzcvtjxujkqfh0y7s-mysql.services.clever-cloud.com",
    user: "u2tfqumugljdn200",
    password: "0dOSniKFTgZN3k2ucfQP",
    database: "b6yfzcvtjxujkqfh0y7s",
})
const exe = util.promisify(conn.query).bind(conn);


module.exports = exe;
