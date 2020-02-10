const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/User");

// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

router.get("/login", (req, res, next) => {
    res.render("auth/login", { message: req.flash("error") });
});

// router.post(
//     "/login",
//     passport.authenticate("local", {
//         successRedirect: "/",
//         failureRedirect: "/auth/login",
//         failureFlash: true,
//         passReqToCallback: true
//     })
// );
router.post("/login", (req, res, next) => {
    User.findOne({ username: req.body.username })
        .then(userFromDB => {
            if (userFromDB === null) {
                res.render("auth/login", {
                    message: "That username was not found in the system"
                });
                return;
            }

            if (bcrypt.compareSync(req.body.password, userFromDB.password)) {
                req.session.user = userFromDB;
                res.redirect("/");
            } else {
                res.render("auth/login", { message: "Incorrect Password" });
                return;
            }
        })
        .catch(err => next(err));
});

router.get("/signup", (req, res, next) => {
    res.render("auth/signup");
});

router.post("/signup", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username === "" || password === "") {
        res.render("auth/signup", {
            message: "Indicate username and password"
        });
        return;
    }

    User.findOne({ username }, "username", (err, user) => {
        if (user !== null) {
            res.render("auth/signup", {
                message: "The username already exists"
            });
            return;
        }

        const salt = bcrypt.genSaltSync(bcryptSalt);
        const hashPass = bcrypt.hashSync(password, salt);

        const newUser = new User({
            username,
            password: hashPass
        });

        newUser
            .save()
            .then(newlyCreatedUser => {
                // we will automatically sign in the user after they sign up so that they do not have to later go to login screen after the signup
                req.session.user = newlyCreatedUser;
                res.redirect("/");
            })
            .catch(err => {
                console.log(err);

                // if there was an error we will render the same page the user is on and this time pass a variable that can be used there. In this case it will be a message to display the error
                res.render("auth/signup", { message: "Something went wrong" });
            });
    });
});

router.get("/logout", (req, res) => {
    // req.logout();
    req.session.destroy();
    res.redirect("/");
});

module.exports = router;
