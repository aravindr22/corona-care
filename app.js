var port = 8000,
    express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStratergy = require("passport-local"),
    methodOverride = require("method-override"),        //for put and delete methods
    flash = require("connect-flash"),
    User = require("./models/user"),
    Enquiry = require("./models/enquiry"),
    Comment = require("./models/comment");

var indexRoutes = require("./routes/index"),
    enquiryroutes = require("./routes/enquiry");

var middleware = require("./middleware/index")

mongoose.connect("mongodb://localhost/au_hack", { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false });
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.static("views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());

//passport config
app.use(require("express-session")({
    secret: "This is my first web page",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//passing the current user data to all the routes
app.use(function (req, res, next) {
    res.locals.currentuser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

app.use("/", indexRoutes);
app.use("/", enquiryroutes);
//-------------------------------------------ROUTES------------------------------------

//Index Page
app.get("/corona", function (req, res) {
    res.render("index");
});
//middleware.isLoggedin,
//Comments get Route
app.get("/corona/enquiry/:id/comments/new", middleware.isLoggedin,  function (req, res) {
    Enquiry.findById(req.params.id, function (err, foundEnquiry) {
        if (err) {
            console.log(err);
        } else {
            res.render("cmntsnew", { enquiry: foundEnquiry });
        }
    });
});

//Comment post route
app.post("/corona/enquiry/:id/comments/", middleware.isLoggedin, function (req, res) {
    Enquiry.findById(req.params.id, function (err, enquiry) {
        if (err) {
            console.log(err);
            req.flash("error", "Something Went Wrong");
            res.redirect("/corona/enquiry");
        } else {
            Comment.create(req.body.comment, function (err, comment) {
                if (err) {
                    console.log(err);
                } else {
                    //add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    //save comment
                    comment.save();
                    enquiry.comments.push(comment);
                    enquiry.save();
                    req.flash("success", "Comment Created Successfully");
                    res.redirect("/corona/enquiry/" + enquiry._id);
                }
            });
        }
    });
});

//Comment Edit route
app.get("/corona/enquiry/:id/comments/:comment_id/edit", middleware.checkcommentownership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundcomment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("cmntsedit", { campground_id: req.params.id, comment: foundcomment });
        }
    });
});

//Comment Update Route
app.put("/corona/enquiry/:id/comments/:comment_id", middleware.checkcommentownership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedcomment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment Edited Succesfully");
            res.redirect("/corona/enquiry/" + req.params.id);
        }
    });
});

//Comment destroy route
app.delete("/corona/enquiry/:id/comments/:comment_id", middleware.checkcommentownership, function (req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function (err, deleted, comment) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "Comment Deleted Succesfully");
            res.redirect("/corona/enquiry/" + req.params.id);
        }
    })
});


//-------------------------------------------LISTNER-----------------------------------

app.listen(port, function () {
    console.log("server has started");
});