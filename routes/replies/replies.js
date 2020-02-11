const express = require("express");
const router = express.Router();
const Reply = require("../../models/Reply");
const Message = require("../../models/Message");

// since we will be populating the messages and the main thing loading will be the messages themselves, we really wont need a get route for the replies themselves
router.post("/create/:messageId", (req, res, next) => {
    // if user is not logged in and try to post a new message, redirect to login page
    if (!req.session.user) {
        res.redirect("/auth/login");
        return;
    }

    // create a new message from our request and set the logged in user to be author of the message
    const theReply = req.body;
    theReply.author = req.session.user._id;

    // create a new reply message, and once we have it push the reference _id of the reply to it onto the original message
    Reply.create(theReply)
        .then(newlyCreatedReply => {
            // find the message we reply to from params and update it with the reference to the reply
            Message.findByIdAndUpdate(
                req.params.messageId,
                { $push: { replies: newlyCreatedReply._id } },
                { new: true }
            )
                .then(updatedMessage => {
                    res.status(200).json(updatedMessage);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

// Update the reply message(findByIdAndUpdate will by default return old(un-updated) message, {new: true} is used to return updated message)
router.post("/update/:replyId", (req, res, next) => {
    Reply.findByIdAndUpdate(req.body, { new: true })
        .then(() => {
            next();
        })
        .catch(err => next(err));
});

// deleting the reply message
router.post("/delete/:replyId/:messageId", (req, res, next) => {
    // first find the message reply references to and remove the reference to the reply
    Message.findByIdAndUpdate(req.params.messageId, {
        $pull: { messages: req.params.replyId }
    })
        .then(() => {
            // find and delete the reply
            Reply.findByIdAndDelete(req.params.replyId)
                .then(() => {
                    next();
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

module.exports = router;
