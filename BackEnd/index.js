require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");

// !ROUTERS
const userRouter = require("./routes/user.routes");
const noteRouter = require("./routes/note.routes");
const activityRouter = require("./routes/activity.routes");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "*", // allow all origins
  })
);

// !Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}))

// !Passport middleware
app.use(passport.initialize()); // ?Initializes the passport
app.use(passport.session()); // ?For persistent login sessions

// !App using the routes
app.use("/", userRouter);
app.use("/", noteRouter);
app.use("/activity", activityRouter);



// !Starting server and connecting to dB
const PORT = process.env.PORT || 8000;
console.log("Attempting to connect to the database...");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database!");
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("Error: ", err.message);
  });
