const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// Here will create a route to lead to the users profile page in order to allow the user to modify and update their information.
// Since we have currentUser set up as a local variable in the app.js, we will not have to get the users details from the DB prior to loading the details page.
// this route will allow the current user to view their profile and also be able to edit their profile.
router.get("/profile", (req, res, next) => {
    res.render("users/userProfile");
});

// this route will be so that we can update the users profile information if they edit any of the fields. Since each sessions user is unique then we can create a route without having to pass the users id in the endpoint.
router.post("/profile/update", (req, res, next) => {
    // since this route has a similar endpoint as the profile route when seeing another users profile, we have to add this route first so that when your app checks the routes in this file (starts at top and works its way down), then it will find this route first and not confuse the /update as being a /:userId since the id can be anything.
    User.findByIdAndUpdate(req.session.user._id, req.body, { new: true })
        .then(updatedUser => {
            req.session.user = updatedUser;
            res.redirect("back");
        })
        .catch(err => next(err));
});

// this route will be for generating a random sprite for the users avatar. We will be able to update just the avatar field with this route and have users generate a sprite from an api.
router.post("/profile/avatar", (req, res, next) => {
    const dataObj = req.body;
    dataObj.mood = req.body.mood ? req.body.mood : "happy";

    // for the api that we are using we don't have to call on it in order to user it. We just have to save the api's url with the needed parameters and it will display the generated image as if it were a normal image url.
    User.findByIdAndUpdate(
        req.session.user._id,
        {
            avatar: `https://avatars.dicebear.com/v2/${dataObj.spriteType}/${dataObj.wordIdentifier}.svg?options[mood][]=${dataObj.mood}`
        },
        { new: true }
    )
        .then(updatedUser => {
            req.session.user = updatedUser;
            res.redirect("back");
        })
        .catch(err => next(err));
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
