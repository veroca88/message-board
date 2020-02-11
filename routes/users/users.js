const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// Here will create a route to lead to the users profile page in order to allow the user to modify and update their information.
// Since we have currentUser set up as a local variable in the app.js, we will not have to get the users details from the DB prior to loading the details page.
// this route will allow the current user to view their profile and also be able to edit their profile.
router.get("/details", (req, res, next) => {
    res.render("users/userProfile");
});

// this route will lead to the same profile page as the above route but instead will be for when a user is visiting another users profile which will display the information only and not allow the current user to edit the profile.
router.get("/profile/:userId", (req, res, next) => {
    User.findById(req.params.userId)
        .then(userFromDB => {
            res.render("users/userProfile", { userFromDB });
        })
        .catch(err => next(err));
});

module.exports = router;
