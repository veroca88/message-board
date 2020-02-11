const express = require("express");
const router = express.Router();
const Message = require("../../models/Message");
const Board = require("../../models/Board");
const axios = require("axios");

router.get("/details/:messageId", (req, res, next) => {
    Message.findById(req.params.messageId)
        .populate({ path: "replies", populate: { path: "author" } })
        .then(messageFromDB => {
            res.render("messages/messageDetails", { messageFromDB });
        })
        .catch(err => next(err));
});

// since all the messages are displayed within the boards details, all we need as far as the read route here is to get the details
router.get("/", (req, res, next) => {
    Message.find()
        .populate("replies")
        .then(message => {
            res.render("messages/messageDetails", { message });
        })
        .catch(err => next(err));
});

router.post("/update/:messageId/:replyId", (req, res, next) => {
    Message.findByIdAndUpdate(
        req.params.messageId,
        { $push: { replies: req.params.replyId } },
        { new: true }
    )
        .then(updatedMessage => {
            next();
        })
        .catch(err => next(err));
});

// Create a new message
router.post("/create/:boardId", (req, res, next) => {
    // Logged in user is set as the messages author and the message is grabbed from the body
    const theMessage = req.body;
    theMessage.author = req.session.user._id;

    // create a new message and send it back in json format
    Message.create(theMessage)
        .then(newlyCreatedMessage => {
            res.status(200).json({ newlyCreatedMessage });
        })
        .catch(err => next(err));
});

// Deleting message - First delete the reference to the message from the Board that had the message on it and after delete the message itself
router.post("/delete/:messageId/:boardId", (req, res, next) => {
    // find the board and remove the reference to the message that is being deleted
    Board.findByIdAndUpdate(
        req.params.boardId,
        { $pull: { messages: req.params.messageId } },
        { new: true }
    )
        .then(() => {
            // remove the message itself and redirect user to the previous page
            Message.findByIdAndDelete(req.params.messageId)
                .then(() => {
                    res.redirect("back");
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

router.get("/add-reply/:messageId/:replyId", (req, res, next) => {
    Message.findByIdAndUpdate(
        req.params.messageId,
        { $push: { replies: req.params.replyId } },
        { new: true }
    )
        .then(updatedMessage => {
            res.status(200).json(updatedMessage);
        })
        .catch(err => next(err));
});

module.exports = router;
