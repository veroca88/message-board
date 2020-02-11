const express = require("express");
const router = express.Router();
const Board = require("../../models/Board.js");
const User = require("../../models/User");

// Display message board
router.get("/", (req, res, next) => {
    Board.find()
        .then(allBoards => {
            const boardsArray = allBoards.map(board => {
                const obj = {
                    ...board._doc,
                    isOwner: req.session.user
                        ? board.author._id.toString() ===
                          req.session.user._id.toString()
                        : false
                };
                // board.isOwner = board.author._id === req.session.user._id;
                return obj;
            });

            const data = {
                boards: boardsArray,
                // here we can use noBoards as a variable that can be called on the view page in order to use {{#if noBoards}} for conditional display.
                // now we will be able to display one message if there are no boards (something like "There are no boards to display at this time. Be the first to create a new board!") or show the boards that exists if there are some
                noBoards: boardsArray.length === 0
            };
            res.render("boards/messageBoards", data);
        })
        .catch(err => next(err));
});

// this route we will use to refresh the messages on the board details page so that we do not have to refresh the page over and over on new input. Thus allowing users to see newly added messages without them having to reload the page.
// we will be calling this route from our script file and will place it before the initial details route so that we can catch the /refresh at the end of the endpoint
// we are also using the same endpoint because it will require less coding to grab the url in our script file and thus we will not have to modify the url much.
router.get("/details/:boardId/refresh", (req, res, next) => {
    Board.findById(req.params.boardId)
        .populate({
            path: "messages",
            populate: [{ path: "replies" }, { path: "author" }]
        })
        .populate("followers")
        .then(boardFromDB => {
            // in order to get the information from this route via an axios call, we will have to use a json response. We use render to display a view page and redirect to reroute to another route within the apps get routes.
            res.status(200).json(boardFromDB);
        })
        .catch(err => next(err));
});

// display the specific board page
router.get("/details/:boardId", (req, res, next) => {
    // the findById below is using a deep populate which is used when you are going to populate the information within data that you are populating. Notice that unlike a normal populate, on a deep populate you have to set the path to the first data point that your going to populate and then path again into the data type that you just populated to find the other data.
    // if there is more than one data point that you have to populate you can just link populates like the example below
    // Board.findById(req.params.id).populate('messages').populate('followers')
    Board.findById(req.params.boardId)
        .populate({
            path: "messages",
            populate: [{ path: "replies" }, { path: "author" }]
        })
        .populate("followers")
        .then(boardFromDB => {
            const data = {
                // this is a ternary operator. It is the same as doing an if else conditional statement but looks cleaner and can be used for conditional setting of values like the example below.
                noMessages: boardFromDB.messages.length === 0 ? true : false,
                board: boardFromDB
            };
            // here we will set the local variable for the bodyClass to be something other than what we set in app.js in order to track the page change. We can then use this for styling or script file(which is what we will be using it for).
            res.locals.bodyClass = "messageBoardDetails";

            res.render("boards/boardDetails", data);
        })
        .catch(err => next(err));
});

// create a board for messages
router.post("/create", (req, res, next) => {
    // for some of our routes, we may want the user to be logged in like on this one that a user is required in order to add the author to the board. For cases like this we can do a simple check for req.session.user and the user is not logged in then we can redirect them to the login page
    if (!req.session.user) {
        res.redirect("/auth/login");
        // here we will add a return to stop the rest of the route from running otherwise we may get errors for not finding req.session.user or possibly create blank boards.
        return;
    }

    const newBoard = req.body;
    newBoard.author = req.session.user._id;

    Board.create(newBoard)
        .then(newlyCreatedBoard => {
            // at this point after creating a board you will have 2 options. One is to redirect the user to a general endpoint and that is that.
            // res.redirect("/boards");

            // the other option is that you can use the information from the db that just got created and redirect a user to a details page for that newly created item like the example below
            // res.redirect(`/boards/details/${newlyCreatedBoard._id}`);

            // in our case we will also be adding the board that was created to the user that created it which is also the author of the board. This way when we check the users profile, we will be able to see all the boards that belong to the user
            User.findByIdAndUpdate(
                req.session.user._id,
                { $push: { userBoards: newlyCreatedBoard._id } },
                { new: true }
            )
                .then(() => {
                    // when using nested .thens, you have access to all variables previously assigned in the parent and grandparent thens in the child then which is why we can still call newlyCreatedBoard now.

                    // now using the newCreatedBoard variable we will redirect the user to the details page of the newly created board
                    res.redirect(`/boards/details/${newlyCreatedBoard._id}`);
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

// delete a board, only the author or admin should be able too delete a board
router.post("/delete/:boardId", (req, res, next) => {
    if (!req.session.user) {
        res.redirect("/auth/login");
    }

    Board.findByIdAndDelete(req.params.boardId)
        .then(() => {
            User.findByIdAndUpdate(
                req.session.user._id,
                { $pull: { userBoards: req.params.boardId } },
                { new: true }
            )
                .then(() => {
                    res.redirect("/boards");
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

// update the board to either add or remove a follower
router.post("/followers/:boardId", (req, res, next) => {
    Board.findById(req.params.boardId)
        .then(boardFromDB => {
            // in order for us not to have to make 2 routes to add follower and remove a follower, we can use the .save() method with a conditional statement prior in order to check whether a user._id already exists in the array.
            // if it exists then we pull the id from the array, else we push it in.
            // Afterwards we will save the information on the db.
            if (boardFromDB.followers.includes(req.session.user._id)) {
                boardFromDB.pull(req.session.user._id);
            } else {
                boardFromDB.push(req.session.user._id);
            }
            boardFromDB
                .save()
                .then(updatedBoard => {
                    // as mentioned above the code below is one of the options after an update for where to send the user.
                    // res.redirect(`/boards/details/${updatedBoard._id}`);

                    // in this case I would like the user to stay on the page they are on when the click to follow a board.
                    res.redirect("back");
                    // if you want the user to refresh the page they are  on then you can use res.redirect('back') <-- back basically means back to where you were at.
                })
                .catch(err => next(err));
        })
        .catch(err => next(err));
});

// this route is another update route that we will use in order to add messages to the board
router.get("/add-message/:boardId/:messageId", (req, res, next) => {
    // when updating we must add {new: true} in order to get the updated information from the db, otherwise you will get the information that is on the db prior to the update
    Board.findByIdAndUpdate(
        req.params.boardId,
        {
            $push: { messages: req.params.messageId }
        },
        { new: true }
    )
        .then(updatedBoard => {
            res.status(200).json(updatedBoard);
            // next();
        })
        .catch(err => next(err));
});

module.exports = router;
