var express = require("express");
var router = express.Router();
var Enquiry = require("../models/enquiry");
var middleware = require("../middleware/index");

router.get("/corona/enquiry", function (req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        Enquiry.find({ name: regex }, function (err, allenquiry) {
            if (err) {
                console.log(err);
            } else {
                if (allenquiry.length < 1) {
                    var noMatch = "No Enquiry Matched that Query, Please Try again..";
                }
                res.render("enquiryindex", { enquiry: allenquiry, currentuser: req.user, noMatch: noMatch });
            }
        });
    } else {
        Enquiry.find({}, function (err, allenquiry) {
            if (err) {
                console.log(err);
            } else {
                res.render("enquiryindex", { enquiry: allenquiry, currentuser: req.user });
            }
        });
    }
});

router.get("/corona/enquiry/new", function (req, res) {
    res.render("enquirynew");
});

router.post("/corona/enquiry", middleware.isLoggedin, function (req, res) {
    var name = req.body.name;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newEnquiry = { name: name, description: description, author: author };
    Enquiry.create(newEnquiry, function (err, newen) {
        if (err) {
            console.log(err);
        } else {
            req.flash("success", "Enquiry Created Successfully");
            res.redirect("/corona/enquiry");
        }
    });
});

router.get("/corona/enquiry/:id", function (req, res) {
    Enquiry.findById(req.params.id).populate("comments").exec(function (err, foundenquiry) {
        if (err) {
            console.log(err);
        } else {
            console.log(foundenquiry);
            res.render("enquiryshow", { enquiry: foundenquiry });
        }
    });
});

//Edit Enquiry
router.get("/corona/enquiry/:id/edit", middleware.checkenquiryownership, function (req, res) {
    Enquiry.findById(req.params.id, function (err, foundenquiry) {
        res.render("enquiryedit", { enquiry: foundenquiry });
    });
});

//Update Campground
router.put("/corona/enquiry/:id", middleware.checkenquiryownership, function (req, res) {
    Enquiry.findByIdAndUpdate(req.params.id, req.body.enquiry, function (err, updatedata) {
        if (err) {
            console.log(err);
            res.redirect("/corona/enquiry");
        } else {
            req.flash("success", "Enquiry Edited Succesfully");
            res.redirect("/corona/enquiry/" + req.params.id);
        }
    });
});

//Delete Enquiry
router.delete("/corona/enquiry/:id", middleware.checkenquiryownership, function (req, res) {
    Enquiry.findByIdAndRemove(req.params.id, function (err, data) {
        if (err) {
            console.log(err);
            res.redirect("/corona/enquiry");
        } else {
            req.flash("success", "Enquiry Deleted Succesfully");
            res.redirect("/corona/enquiry");
        }
    });
});

module.exports = router;