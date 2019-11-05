const express = require("express");
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const routes = require("./routes/router");
const app = express();
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
const cors = require('cors');

const PORT = process.env.PORT || 3001;



app.use(cors());

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}


// Connect to the Mongo DB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/user");
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {

});


app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// Add routes, both API and view
app.use(routes);

// Start the API server
app.listen(PORT, function() {
  console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});