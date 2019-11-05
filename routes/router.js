var express = require('express');
var router = express.Router();
var User = require('../models/user');
var axios = require("axios");
var querystring = require("querystring");
var FormData = require("form-data");



// GET route for reading data
router.get('/', function (req, res, next) {
  return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//POST route for updating data
router.post('/login', function (req, res, next) {


  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }
  
  if (req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {
      
      var userData = {
        email: req.body.email,
        user: req.body.username,
        password: req.body.password,
      }
      
      User.create(userData, function (error, user) {
        if (error) {
          return next(error);
        } else {
          console.log(req)
          req.session.userId = user._id;
          return res.redirect('/');
        }
      });
      
    } else if (req.body.logemail && req.body.logpassword) {
      User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
        if (error) {
          var err = new Error('Wrong email or password.');
          err.status = 401;
          return next(err);
        } else {
          req.session.userId = user._id;
          console.log("User logged in " + user)
          return res.redirect('/');
        }
      });
    } else {
      console.log(req.body)
      var err = new Error('All fields required.');
      err.status = 400;
      return next(err);
    }
  })
  
  // GET route after registering
  router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
    .exec(function (error, user) {
      if (error) {
        return next(error);
      } else {
        if (user === null) {
          var err = new Error('Not authorized! Go back!');
          err.status = 400;
          return next(err);
        } else {
          return res.send( user.username,user.email)
        }
      }
    });
  });
  
  // GET for logout logout
  router.get('/logout', function (req, res, next) {
    if (req.session) {
      // delete session object
      console.log("Logged out " + req.session.email)
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });
  
  router.get('/recipeSearch/:query', function (req,res) {
    console.log('/recipeSearch triggered')
   axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/search",
      params:{
        apiKey:process.env.SPOONY_API_KEY,
        number: 100,
        query: req.params.query,
        instructionsRequired: true
        }   
      })
      .then(function (response) {
        return res.json(response.data)
      })
      .catch(function (err) {
        console.log(err);
      });
  });

  router.get('/recipeIngredients/:query', function (req,res) {
    console.log('/recipeIngredients triggered')
    axios( {
      method: 'GET',
      headers:{
        "Content-Type":"application/octet-stream"
      },
      url: "https://api.spoonacular.com/recipes/findByIngredients?apiKey=" + process.env.SPOONY_API_KEY, 
      params:{
        ingredients:req.params.query
        }
      })   
      .then(function (response) {
        return res.json(response.data)
      })
      .catch(function (err) {
        console.log(err);
      });
  });

  router.get('/recipeNutrition/:query', function (req,res) {
    axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/"+req.params.query+"/information",
      params:{
        apiKey:process.env.SPOONY_API_KEY,
        id: req.params.query,
        includeNutrition: true
        }   
      })     
      .then(function (response) {
        return res.json(response.data)
      })
      .catch(function (err) {
        console.log(err);
      });
  });
 
  router.get('/recipeSteps/:query', function (req,res) {
    axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/"+req.params.query+"/analyzedInstructions",
      params:{
        apiKey:process.env.SPOONY_API_KEY,
        id: req.params.query,
        stepBreakdown: true
      }   
      })       
      .then(function (response) {
        return res.json(response.data)
      })
      .catch(function (err) {
        console.log(err);
      });
  });
 
  router.get('/recipeQuestion/:query', function (req,res) {
    axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/recipes/quickAnswer",
      params:{
        apiKey:process.env.SPOONY_API_KEY,
        q: req.params.query
        }   
      })          
      .then(function (response) {
        return res.json(response.data)
      })
      .catch(function (err) {
        console.log(err);
      });
  });
  
  module.exports = router;