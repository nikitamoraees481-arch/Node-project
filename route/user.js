var express = require("express");
var route = express.Router();
var exe = require("./../connection");
var url = require("url");

route.get("/",async function(req,res){
     var data = await exe(`SELECT * FROM about_company`);
     var slider = await exe(`SELECT * FROM sliderr`);
    var obj = {"about_company":data,"slider":slider,"is_login":verifyaccound(req)}
    res.render("user/index.ejs",obj);
})

route.get("/about",async function(req,res){
   var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req)}
    res.render("user/about.ejs",obj);
})

route.get("/shop",async function(req,res){

    var url_data = url.parse(req.url,true).query;
    // console.log(url_data.categary_id)
    var cond ='';
    if(url_data.categary_id){
        cond = `WHERE categary_id = '${url_data.categary_id}'`
    }
    if(url_data.color){
        cond = `WHERE product_color = '${url_data.color}'`
    }
    if(url_data.company){
        cond = `WHERE product_company = '${url_data.company}'`
    }
     
    if(url_data.product_name){
        cond = `WHERE product_name = '${url_data.product_name}'`
    }

    var data = await exe(`SELECT * FROM about_company`);
    var categary = await exe(`SELECT * FROM categary`);
    var company = await exe(`SELECT product_company FROM product GROUP BY product_company`)
    var color = await exe(`SELECT product_color FROM product GROUP BY product_color`)

    var sql =`SELECT * ,
    (SELECT MIN(product_price) FROM product_pricing
    WHERE product.product_id = product_pricing.product_id
    AND product_price > 0) AS product_price,
    
     (SELECT MIN(dublicate_price) FROM product_pricing
    WHERE product.product_id = product_pricing.product_id
    AND dublicate_price > 0) AS dublicate_price
    FROM product `+cond;
    var product = await exe(sql)
     var obj = {"about_company":data ,"categary":categary,"company_name":company,"color":color,"product":product,"is_login":verifyaccound(req)}
    res.render("user/shop.ejs",obj);
})

route.get("/pages",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data}
    res.render("user/pages.ejs",obj);
})

route.get("/blog",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req)}
    res.render("user/blog.ejs",obj);
})

route.get("/contact",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req)}
    res.render("user/contact.ejs",obj);
});
 
route.get("/view_product/:id",async function(req,res){
    var id = req.params.id;
    var product = await exe(`SELECT * FROM product WHERE product_id ='${id}'`);
    var price = await exe(`SELECT * FROM product_pricing WHERE product_id ='${id}'`);
    // res.send(product)
   var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"product_info":product,"price":price,"is_login":verifyaccound(req)}
    res.render("user/view_product.ejs",obj)
});

route.get("/login",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data ,"is_login":verifyaccound(req)}
    res.render("user/login.ejs",obj)
});

route.post("/do_login",async function(req,res){
    var d = req.body;
    var sql = `SELECT * FROM users WHERE user_mobile = '${d.user_mobile}' AND password = '${d.password}'`;
    var data = await exe(sql)
    if(data.length > 0){
        req.session.user_id = data[0].user_id;

        res.redirect("/shop")
    } else{
        res.send("Invailid Mobile And Password")
    }
})

function verifyaccound(req,res,next){
    var user_id = req.session.user_id;
     if(user_id == undefined){
        return false;
    }else{
        return true;
    }
}

route.get("/create_account",async function(req,res){
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req)}
    res.render("user/create_account.ejs",obj)
});

route.post("/create_account",async function(req,res){
    var d = req.body;
    var sql =`INSERT INTO users(user_name,user_mobile,user_email,password)
    VALUES ('${d.user_name}','${d.user_mobile}','${d.user_email}','${d.password}')`;
    var data = await exe(sql);
    res.redirect("/login")
});

route.get("/logout",function(req,res){
    req.session.user_id = undefined;
    res.redirect("/")
});

route.get("/add_to_cart/:product_id/:product_pricing_id", async function(req,res){

    var product_id = req.params.product_id;
    var product_pricing_id = req.params.product_pricing_id;
    var user_id = req.session.user_id;

    if (!user_id) {
        return res.send("User Not Logged In");
    }

    var sql = `INSERT INTO cart(product_id,product_pricing_id,user_id,qty)
               VALUES('${product_id}','${product_pricing_id}','${user_id}',1)`;

    var data = await exe(sql);
    res.redirect("/shop");
});

route.get("/cart",async function(req,res){

    var sql = `SELECT * FROM product ,product_pricing , cart 
     WHERE 
     product.product_id = product_pricing.product_id
     AND
     product_pricing.product_pricing_id = cart.product_pricing_id
     AND
     product.product_id = cart.product_id
     AND
     cart.user_id ='${req.session.user_id}' `;
    var cart = await exe(sql);
    var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req) ,"cart":cart}
    res.render("user/cart.ejs",obj)
});

route.get("/qtyincrease/:cart_id",async function(req,res){
    var cart_id = req.params.cart_id;
    var sql = `UPDATE cart SET qty = qty + 1 WHERE  cart_id = '${cart_id}'`;
    var data = await exe(sql);
    res.redirect("/cart")
})

route.get("/decrease/:cart_id",async function(req,res){
    var cart_id = req.params.cart_id;
    var sql = `UPDATE cart SET qty = qty - 1 WHERE  cart_id = '${cart_id}'`;
    var data = await exe(sql);
    res.redirect("/cart")
});

route.get("/cart_delete/:id",async function(req,res){
    var id = req.params.id;
    var sql= `DELETE FROM cart WHERE cart_id = '${id}'`;
    var data = await exe(sql);
    res.redirect("/cart")
});

route.get("/checkout",async function(req,res){

    var sql = `SELECT * FROM product ,product_pricing , cart 
     WHERE 
     product.product_id = product_pricing.product_id
     AND
     product_pricing.product_pricing_id = cart.product_pricing_id
     AND
     product.product_id = cart.product_id
     AND
     cart.user_id ='${req.session.user_id}' `;

     var cart = await exe(sql);

     var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req),"cart":cart};

    res.render("user/checkout.ejs",obj);

    
});

route.post("/order",async function(req,res){
    var sql = `SELECT * FROM product ,product_pricing , cart 
     WHERE 
     product.product_id = product_pricing.product_id
     AND
     product_pricing.product_pricing_id = cart.product_pricing_id
     AND
     product.product_id = cart.product_id
     AND
     cart.user_id ='${req.session.user_id}' `;

     var cart = await exe(sql);

     var sum = 0 ;

     var today = new Date().toISOString().slice(0,10);

     for(var i=0 ; i<cart.length; i++)
        sum += cart[i].product_price * cart[i].qty;

    var d = req.body;
    var sql1 = `insert into order_tbl(customer_name,customer_mobile ,customer_state ,District ,city ,area ,landmark ,pincode ,payment_type ,order_date,order_amount ,payment_status,order_status)
    VALUES(
    '${d.customer_name}',
    '${d.customer_mobile}',
    '${d.customer_state}',
    '${d.District}',
    '${d.city}',
    '${d.area}',
    '${d.landmark}',
    '${d.pincode}',
    '${d.payment_type}',
    '${today}',
    '${sum}',
    'pending',
    'pending'
    )`
    var data1 = await exe(sql1)

    var order_id = data1.insertId;

    for(var i=0; i<cart.length; i++){

        var sql2 =`INSERT INTO order_det (order_id ,product_id ,customer_id ,product_pricing_id ,product_name,product_price,product_color ,product_size ,product_image1 ,product_company ,product_qty ,product_total)
        VALUES(
            '${order_id}',
            '${cart[i].product_id}',
            '${req.session.user_id}',
            '${cart[i].product_pricing_id}',
            '${cart[i].product_name}',
            '${cart[i].product_price}',
            '${cart[i].product_color}',
            '${cart[i].product_size}',
            '${cart[i].product_image1}',
            '${cart[i].product_company}',
            '${cart[i].qty}',
            '${cart[i].qty * cart[i].product_price}'
        ) `;
        var data2 = await exe(sql2);
    }

   var sql3 =`DELETE FROM cart WHERE user_id = '${req.session.user_id}'`;
   var data3 = await exe(sql3)

   if(d.payment_type == "Online Payment"){
    res.redirect("/payment/"+order_id)
   }
   else{
    res.redirect("/order_info/"+order_id)
   }
});

route.get("/order_info/:order_id",async function(req,res){

    var sql = `SELECT * FROM order_tbl WHERE order_id = ${req.params.order_id}`;
    var order_data = await exe(sql);
    var sql1 = `SELECT * FROM order_det WHERE customer_id = '${req.session.user_id}'`;
    var order_det = await exe(sql1)
    // console.log("SESSION USER ID =", req.session.user_id)
    // console.log(order_det)
     var data = await exe(`SELECT * FROM about_company`);
    var obj = {"about_company":data,"is_login":verifyaccound(req),"order_data":order_data ,"order_det":order_det}
    res.render("user/order_info.ejs",obj)
});


// start profile page


route.get("/profile", async function(req, res){
    var about_company = await exe(`SELECT * FROM about_company`);
    var user_id = req.session.user_id || null;
    
    var userData = {};
    if (user_id) {
        var user = await exe(`SELECT * FROM users WHERE user_id = '${user_id}'`);
        if (user.length > 0) {
            userData = {
                user_id: user[0].user_id,
                user_name: user[0].user_name,
                user_email: user[0].user_email,
                user_mobile: user[0].user_mobile
            };

            var orderStats = await exe(`
                SELECT 
                    COUNT(DISTINCT order_id) as total_orders,
                    SUM(product_total) as total_spent
                FROM order_det 
                WHERE customer_id = '${user_id}'
            `);
            
            userData.total_orders = orderStats[0]?.total_orders || 0;
            userData.total_spent = orderStats[0]?.total_spent || 0;

            var recentOrders = await exe(`
                SELECT DISTINCT o.* 
                FROM order_tbl o
                INNER JOIN order_det od ON o.order_id = od.order_id
                WHERE od.customer_id = '${user_id}'
                ORDER BY o.order_date DESC 
                LIMIT 5
            `);

            if (!recentOrders || recentOrders.length === 0) {
                recentOrders = await exe(`
                    SELECT DISTINCT order_id, 
                           MAX(product_name) as product_name,
                           SUM(product_total) as order_amount,
                           'pending' as order_status,
                           NOW() as order_date
                    FROM order_det 
                    WHERE customer_id = '${user_id}'
                    GROUP BY order_id
                    ORDER BY order_id DESC 
                    LIMIT 5
                `);
            }
            
            userData.recent_orders = recentOrders;
        }
    }
    
    var obj = {
        "about_company": about_company,
        "is_login": user_id ? true : false,
        "user": userData
    };
    
    res.render("user/profile.ejs", obj);
});
route.post("/update_profile", async function(req, res){
    if (!req.session.user_id) {
        return res.redirect("/login");
    }
    
    const { user_name, user_email, user_mobile, password } = req.body;
    const user_id = req.session.user_id;
    
    try {
        let updateQuery = `UPDATE users SET 
            user_name = '${user_name}',
            user_email = '${user_email}',
            user_mobile = '${user_mobile}'`;
        
        if (password && password.trim() !== '') {
            updateQuery += `, password = '${password}'`;
        }
        
        updateQuery += ` WHERE user_id = '${user_id}'`;
        
        await exe(updateQuery);
 
        res.redirect("/profile?message=Profile+updated+successfully&type=success");
    } catch (error) {
        console.error("Error updating profile:", error);
        res.redirect("/profile?message=Error+updating+profile&type=danger");
    }
});

// end profile page


route.get("/payment/:order_id",async function(req,res){
    order_id =req.params.order_id;
    var data = await exe(`SELECT * FROM order_tbl WHERE order_id = '${order_id}'`)
    console.log(data)
    var obj ={"data":data}
     res.render("user/payment.ejs",obj);
});

route.post("/check_payment/:order_id",async function(req,res){
    var order_id = req.params.order_id;
    var sql =`UPDATE order_tbl SET transaction_id = '${req.body.razorpay_payment_id}' WHERE order_id = '${order_id}'`;
    var data = await exe(sql)
    res.redirect("/order_info/"+order_id);
})

module.exports = route ;


