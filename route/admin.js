var express = require("express");
var route = express.Router();
var exe = require("./../connection")

// Home page
route.get("/", function (req, res) {
    res.render("admin/index.ejs");
});

// About Company page
route.get("/about_company", async function (req, res) {
    var data = await exe(`SELECT * FROM about_company`);
    var obj = { "about_company": data }
    res.render("admin/about_company.ejs", obj);
});

// Save About Company
route.post("/about_company", async function (req, res) {

    var d = req.body;

    var sql = `
        UPDATE about_company SET
            company_name     = '${d.company_name}',
            company_mobile   = '${d.company_mobile}',
            company_email    = '${d.company_email}',
            company_address  = '${d.company_address}',
            company_what     = '${d.company_what}',
            youtube          = '${d.youtube}',
            insta            = '${d.insta}',
            telegram         = '${d.telegram}'`;

    // Execute query (uncomment when ready)
    var data = await exe(sql);
    res.redirect("/admin/about_company")

    // res.send(data); 
});

route.get("/slider", async function (req, res) {
    var data = await exe(`SELECT * FROM sliderr`)
    var obj = { "slider": data }
    res.render("admin/slider.ejs", obj);
});

route.post("/slider", async function (req, res) {
    var d = req.body;
    if (req.files) {
        var filename = Date.now() + req.files.slider_image.name;
        req.files.slider_image.mv("public/" + filename)
    }

    var sql = `INSERT INTO sliderr (title,details,btn_text,btn_url,slider_image)
    VALUES ('${d.title}','${d.details}','${d.btn_text}','${d.btn_url}','${filename}')`

    var data = await exe(sql);
    res.redirect("/admin/slider")
});

route.get("/delete_slider/:id", async function (req, res) {
    var id = req.params.id;
    var sql = `DELETE FROM sliderr WHERE id = '${id}'`;
    var data = await exe(sql)
    res.redirect("/admin/slider")
});

route.get("/edit_slider/:id", async function (req, res) {
    var id = req.params.id;
    var sql = `SELECT * FROM sliderr WHERE id = '${id}'`
    var data = await exe(sql);
    var obj = { "slider_edit": data }
    res.render("admin/edit_slider.ejs", obj)
})


route.post("/update_slider", async function (req, res) {
    var d = req.body;
    var filename;
    if (req.files) {
        filename = Date.now() + req.files.slider_image.name;
        req.files.slider_image.mv("public/" + filename);
        var sql = `UPDATE sliderr SET slider_image = '${filename}' WHERE id = '${d.id}' `;
        var data = await exe(sql);
    }
    var sql = `UPDATE sliderr SET 
        title = '${d.title}',
        details = '${d.details}',
        btn_text = '${d.btn_text}',
        btn_url = '${d.btn_url}'
        WHERE id = '${d.id}'`;
    var data = await exe(sql)
    res.redirect("/admin/slider")
});


route.get("/categary", async function (req, res) {
    var data = await exe(`SELECT * FROM categary`)
    var obj = { "categary": data }
    res.render("admin/categary.ejs", obj)
});

route.post("/categary", async function (req, res) {
    var sql = `INSERT INTO categary (categary_name) VALUES ('${req.body.categary_name}')`
    var data = await exe(sql);
    res.redirect("/admin/categary")
});

route.get("/delete_categary/:id", async function (req, res) {
    var id = req.params.id;
    var sql = `DELETE FROM categary WHERE categary_id ='${id}'`;
    var data = await exe(sql);
    res.redirect("/admin/categary");
})

route.get("/edit_categary/:id", async function (req, res) {
    var id = req.params.id;
    var sql = `SELECT * FROM categary WHERE categary_id ='${id}'`;
    var data = await exe(sql);
    var obj = { "edit_categary": data }
    res.render("admin/edit_categary.ejs", obj)
});

route.post("/update_categary", async function (req, res) {
    var sql = `UPDATE categary SET categary_name ='${req.body.categary_name}' WHERE categary_id ='${req.body.categary_id}'`;
    var data = await exe(sql)
    res.redirect("/admin/categary")
});

route.get("/add_product", async function (req, res) {
    var categary = await exe(`SELECT * FROM categary`)
    var obj = { "categary": categary }
    res.render("admin/add_product.ejs", obj)
})
route.post("/save_product",async function (req, res) {
    // part 1
    if (req.files && req.files.product_image1) {
        var product_image1 = Date.now()+req.files.product_image1.name;
        req.files.product_image1.mv("public/upload/"+ product_image1)
    }

    if (req.files && req.files.product_image2) {
        var product_image2 = Date.now() + req.files.product_image2.name;
        req.files.product_image2.mv("public/upload/" + product_image2)
    }

    if (req.files && req.files.product_image3) {
        var product_image3 = Date.now() + req.files.product_image3.name;
        req.files.product_image3.mv("public/upload/" + product_image3)
    } else {
        product_image3 = '';
    }

    if (req.files && req.files.product_image4) {
        var product_image4 = Date.now() + req.files.product_image4.name;
        req.files.product_image4.mv("public/upload/" + product_image4)
    } else {
        product_image4 = '';
    }
    var d = req.body;
    var sql = `INSERT INTO product(
    categary_id,product_name,
    product_company,
    product_color,
    product_lable,
    product_detailes,
    product_image1,
    product_image2,
    product_image3,
    product_image4
    )
    VALUES(?,?,?,?,?,?,?,?,?,?)`;
    var data = await exe(sql,[d.categary_id,
        d.product_name,
        d.product_company,
        d.product_color,
        d.product_lable,
        d.product_detailes,
        product_image1,
        product_image2,
        product_image3,
        product_image4]
    )
    var product_id = data.insertId;

    for(var i=0;  i<d.product_size.length;i++){

        var sql1 = `INSERT INTO product_pricing(product_id,product_size,product_price,dublicate_price)
    VALUES('${product_id}','${d.product_size[i]}','${d.product_price[i]}','${d.dublicate_price[i]}')`;
    // console.log(d.product_size[i])
                var data1 = await exe(sql1)
    }
    res.redirect("/admin/add_product")
});


route.get("/product_list",async function(req,res){
    var sql = `SELECT *, 
    (SELECT MIN(product_price) 
     FROM product_pricing 
     WHERE product.product_id = product_pricing.product_id) AS product_price,

    (SELECT MAX(dublicate_price) 
     FROM product_pricing 
     WHERE product.product_id = product_pricing.product_id) AS dublicate_price
     FROM product; `

    var data = await exe(sql)
    var obj = {"product_info":data}
    res.render("admin/product_list.ejs",obj)
    // res.send(data)
});

route.get("/delete_product/:id",async function(req,res){
    var id = req.params.id;
    var sql = `DELETE  FROM product WHERE product_id ='${id}'`;
    var data = await exe(sql);
    res.redirect("/admin/product_list")
});

route.get("/view_product/:id",async function(req,res){
    var id = req.params.id;
    var product = await exe(`SELECT * FROM product WHERE product_id ='${id}'`)
    var product_price = await exe(`SELECT * FROM product_pricing WHERE product_id ='${id}'`)
    var obj ={"product_info":product,"product_price":product_price}
    res.render("admin/view_product.ejs",obj)
    // res.send(obj)
});

route.get("/edit_product/:id",async function(req,res){
    var id = req.params.id;
    var edit_product = await exe(`SELECT * FROM product WHERE product_id ='${id}'`)
    var edit_product_price = await exe(`SELECT * FROM product_pricing WHERE product_id ='${id}'`)
    var obj = {"edit_product":edit_product,"edit_product_price":edit_product_price}
    res.render("admin/edit_product.ejs",obj)
    // res.send(obj)
});

route.post("/update_product",async function(req,res){
    var d = req.body;
    if (req.files) {
        filename = Date.now() + req.files.product_image1.name;
        req.files.product_image1.mv("public/" + filename);
        var sql = `UPDATE product SET product_image1 = '${filename}' WHERE product_id = '${d.product_id}' `;
        var data = await exe(sql);
    }
    var sql1 = `UPDATE product SET
    product_name ='${d.product_name}',
    product_company ='${d.product_company}',
    product_color ='${d.product_color}',
    product_lable ='${d.product_lable}',
    product_detailes ='${d.product_detailes}'
    WHERE product_id = '${d.product_id}'`;
    var data = await exe(sql1);


for (let i = 0; i < d.product_size.length; i++) {

    const sql2 = `
        UPDATE product_pricing
        SET product_price = '${d.product_price[i]}', dublicate_price = '${d.dublicate_price[i]}'
        WHERE product_id = '${d.product_id}' AND product_size = '${d.product_size[i]}' `;
    var data1 = await exe(sql2);
    // res.send(data1)
   
}
 res.redirect("/admin/product_list")
});

route.get("/orders_list/:status",async function(req,res){
    var status = req.params.status;
    var sql = `SELECT * FROM order_tbl WHERE order_status = '${status}'`;
    var data = await exe(sql);
    var obj = {"status":status,"orders":data}
    console.log(data);
    res.render("admin/order_list.ejs",obj)
})


route.get("/order_info/:order_id" ,async function(req,res){

    var sql = `SELECT * FROM order_tbl WHERE order_id = ${req.params.order_id}`;
    var order_data = await exe(sql);
    var sql1 = `SELECT * FROM order_det WHERE customer_id = '${req.session.user_id}'`;
    var order_det = await exe(sql1)
    // console.log("SESSION USER ID =", req.session.user_id)
    // console.log(order_det)
   
    var obj = {"order_data":order_data ,"order_det":order_det}
    res.render("admin/order_info.ejs",obj)
});

route.get("/transper_order/:order_id/:status" ,async function(req,res){
    var order_id = req.params.order_id;
    var status = req.params.status;

    var today = new Date().toISOString().slice(0,10);


    if(status == 'cancelled'){
           var sql = `UPDATE order_tbl SET order_status = '${status}',cancelled_date ='${today}' WHERE order_id = '${order_id}'`;
        }
        else if(status == 'rejected'){
           var sql = `UPDATE order_tbl SET order_status = '${status}',rejected_date ='${today}'  WHERE order_id = '${order_id}'`;
        }
        else if(status == 'returned'){
           var sql = `UPDATE order_tbl SET order_status = '${status}',returned_date ='${today}'  WHERE order_id = '${order_id}'`;
        }
        else if(status == 'delivered'){
           var sql = `UPDATE order_tbl SET order_status = '${status}',delivered_date ='${today}'  WHERE order_id = '${order_id}'`;
        }
        else if(status == 'dispatched'){
           var sql = `UPDATE order_tbl SET order_status = '${status}',dispatched_date ='${today}'  WHERE order_id = '${order_id}'`;
        }
        var data = await exe(sql);
    res.redirect("/admin/orders_list/"+status)
})
module.exports = route;
