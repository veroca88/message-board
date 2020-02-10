const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// in order to use .populate in the route file, you must first have the type for what you will populate as Schema.Types.ObjectId and make sure to ref (reference) the model that it will be searching that ID for in your db collection
// author: {type: Schema.Types.ObjectId, ref: 'User'}
// if your using an array of object ids then it would look like the code below
// messages: {type: [{type: Schema.Types.ObjectId, ref: 'Message'}]}
// notice that when you reference you use the capitalization of the model that it is referencing

const messageSchema = new Schema(
    {
        // the user that generated this message
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        // the message to be viewed by users
        message: {
            type: String
        },
        // add user._id in order to get the length of the likes array and see how many likes the message has
        likes: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        },
        // the replies that belong to this message
        replies: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Reply"
                }
            ]
        },
        // the message board that this message belongs to
        messageBoard: {
            type: Schema.Types.ObjectId,
            ref: "Board"
        }
    },
    { timestamps: true }
);

// const autoPopulateAuthor = next => {
//     this.populate("author");
//     next();
// };

// messageSchema
//     .pre("findOne", autoPopulateAuthor)
//     .pre("find", autoPopulateAuthor);

const Message = model("Message", messageSchema);
module.exports = Message;
