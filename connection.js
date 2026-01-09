var mysql = require("mysql2");
var util = require("util");


const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "ultra_project",
})
const exe = util.promisify(conn.query).bind(conn);


module.exports = exe;
