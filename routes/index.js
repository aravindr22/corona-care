var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");    

//Landing Page
router.get("/", function (req, res) {
    res.render("landing");
});

//-------------------------index routes------------------------
//Login Page
router.get("/login", function (req, res) {
    res.render("login");
});

//Login post route
router.post('/login', passport.authenticate("local",
    {
        successRedirect: "/corona",
        failureRedirect: "/login"
    }), function (req, res) {
});

//Register page
router.get("/register", function (req, res) {
    res.render("register");
});

//Register Post page
router.post("/register", function (req, res) {
    var newuser = new User({ username: req.body.username });
    if (req.body.admincode === "secretcode123") {
        newuser.isadmin = true;
    }
    User.register(newuser, req.body.password, function (err, data) {
        if (err) {
            console.log(err);
            req.flash("success", err.message);
            res.redirect("/register");
            //return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + data.username);
            res.redirect("/corona");
        });
    });
});

//Logout Route
router.get('/logout', function (req, res) {
    req.logout();
    req.flash("success", "You are been logged out");
    res.redirect("/corona");
}); 

module.exports = router;