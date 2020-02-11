const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// in order to use .populate in the route file, you must first have the type for what you will populate as Schema.Types.ObjectId and make sure to ref (reference) the model that it will be searching that ID for in your db collection
// author: {type: Schema.Types.ObjectId, ref: 'User'}
// if your using an array of object ids then it would look like the code below
// messages: {type: [{type: Schema.Types.ObjectId, ref: 'Message'}]}
// notice that when you reference you use the capitalization of the model that it is referencing

const userSchema = new Schema(
    {
        // users first name
        firstName: {
            type: String
        },
        // users last name
        lastName: {
            type: String
        },
        // username for the user which will be unique (this cannot be edited so in order to avoid heckling and have user accountable for improper behavior, replies or content posted)
        // when using passport it would be best to check for duplicates of this field by searching the db first in your route. If this has a unique tag in the model then passport will set this collection(users) to have the username field unique and would then give you issues when trying to create more than one user as it will view username unique as if there should only be 1 username in the collection.
        username: {
            type: String
        },
        // the users avatar for others to see
        avatar: {
            type: String,
            // when setting a default value in the schema you want to avoid giving the user the option to set the value on sign up. If they by chance do not enter a field then the default will override to be blank as well.
            default:
                "https://cl.goliath.com/image/upload/t_tn,f_auto,q_auto,$h_480,$w_895/go/2020/01/baby-yoda-life-size-figure-584x600-895x480.jpg"
        },
        // the email the user will use on the site ()
        email: {
            type: String
        },
        // the users password (hashed)
        password: {
            type: String
        },
        // the code sent to user email in order to validate email authenticity
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create the needed code for practice
        confirmationCode: {
            type: String
        },
        // the boards that have been created by the user
        userBoards: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Board"
                }
            ]
        },
        // when a user is flagged for inappropriate conduct (specify amount to lock user)
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create the needed code for practice
        flags: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        },
        // this is if the user has received too many flags and is now banned from the site.
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create the needed code for practice
        banned: {
            type: Boolean
        },
        // all users set to User role, can only be upgraded to Mediator or Admin by an Admin.
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create the needed code for practice
        role: {
            type: String,
            enum: ["User", "Mediator", "Admin"],
            default: "User"
        },
        // the boards that the user is following
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create the needed code for practice
        followingBoards: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "Board"
                }
            ]
        },
        // the users that this user is following
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create a route to do so as practice
        // for now we will not add this to our example app. But if you fork and clone this app maybe you can create the needed code for practice
        followingUser: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User"
                }
            ]
        }
    },
    { timestamps: true }
);

const User = model("User", userSchema);
module.exports = User;
