const express = require("express");
const router = express.Router();
const User = require("../../models/User");

// Here will create a route to lead to the users profile page in order to allow the user to modify and update their information.
router.get("/details", (req, res, next) => {
    res.render("users/userProfile");
});

module.exports = router;
