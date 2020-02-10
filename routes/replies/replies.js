const express = require("express");
const router = express.Router();
const Reply = require("../../models/Reply");
const Message = require("../../models/Message");

// since we will be populating the messages and the main thing loading will be the messages themselves, we really wont need a get route for the replies themselves
router.post("/create/:messageId", (req, res, next) => {
    if (!req.session.user) {
        res.redirect("/auth/login");
        return;
    }

    const theReply = req.body;
    theReply.author = req.session.user._id;

    console.log({ body: req.body });

    Reply.create(theReply)
        .then(newlyCreatedReply => {
            console.log({ newlyCreatedReply });
            Message.findByIdAndUpdate(
                req.params.messageId,
                { $push: { replies: newlyCreatedReply._id } },
                { new: true }
            )
                .then(updatedMessage => {
                    console.log({ newlyCreatedReply, updatedMessage });
                    res.status(200).json(updatedMessage);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

router.post("/update/:replyId", (req, res, next) => {
    Reply.findByIdAndUpdate(req.body, { new: true })
        .then(() => {
            next();
        })
        .catch(err => next(err));
});

router.post("/delete/:replyId/:messageId", (req, res, next) => {
    Message.findByIdAndUpdate(req.params.messageId, {
        $pull: { messages: req.params.replyId }
    })
        .then(() => {
            Reply.findByIdAndDelete(req.params.replyId)
                .then(() => {
                    next();
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

module.exports = router;
