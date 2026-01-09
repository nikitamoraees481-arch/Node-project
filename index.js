var express = require("express");
var bodyparser = require("body-parser");
var upload = require("express-fileupload");
var user_route = require("./route/user")
var admin_route = require("./route/admin");
var url = require("url")
var session = require("express-session");

var app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(express.static("public/"));
app.use(session({
    resave:true ,
    saveUninitialized:true,
    secret:"a2zithub"

}));
// app.use('/uploads', express.static('uploads'));


app.use("/",user_route)
app.use("/admin",admin_route)

app.listen(1000);