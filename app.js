require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");

const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const flash = require("connect-flash");

mongoose
    .connect("mongodb://localhost/messageboardexample", {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(x => {
        console.log(
            `Connected to Mongo! Database name: "${x.connections[0].name}"`
        );
    })
    .catch(err => {
        console.error("Error connecting to mongo", err);
    });

const app_name = require("./package.json").name;
const debug = require("debug")(
    `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
    require("node-sass-middleware")({
        src: path.join(__dirname, "public"),
        dest: path.join(__dirname, "public"),
        sourceMap: true
    })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// registering helper function for hbs, we can use this inside our hbs files to create dynamic content
hbs.registerHelper("ifUndefined", (value, options) => {
    if (arguments.length < 2)
        throw new Error("Handlebars Helper ifUndefined needs 1 parameter");
    if (typeof value !== undefined) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

// Enable authentication using session + passport
app.use(
    session({
        secret: "regenerator",
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);
app.use(flash());
require("./passport")(app);

app.use((req, res, next) => {
    // here I will set a local variable for the body class. This is just another way that you can use local variables and for our purposes we will be doing this in order to track when we are in message boards details page
    res.locals.bodyClass = "default";

    // thanks to passport we have access to req.session.user to get the current users information. By using res.locals to set the variable currentUser we can now call currentUser from any of our view pages since we are declaring it in the app.js
    // normally setting res.locals variable in a route will only give you access to that variable in the view page that you are rendering.
    res.locals.currentUser = req.session.user;

    // after we have finished what needs to be done in this section we call next so that we continue onto the next process that must be ran.
    // ** forgetting to add a next() here can make your app hang and you may not get any error messages letting your know why it is hanging. If you see  GET / - - ms - -  in your terminal then that will more than likely mean that you forgot to add a next here.
    next();
});

// by adding some word after / in app.use means that each endpoint in that route file now starts with /variableName.
// if I were to call the create route in boards file the url would now be localhost:3000/boards/create and in the route itself you only need to add the additional endpoint that is not already set up here on the required path.
// router.post('/create')

app.use("/", require("./routes/index"));
app.use("/auth", require("./routes/auth"));
app.use("/boards", require("./routes/boards/boards"));
app.use("/messages", require("./routes/messages/message"));
app.use("/replies", require("./routes/replies/replies"));
app.use("/users", require("./routes/users/users"));

module.exports = app;
