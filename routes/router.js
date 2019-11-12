var express = require('express');
var router = express.Router();
var User = require('../models/user');
var axios = require("axios");
var querystring = require("querystring");
var FormData = require("form-data");
var path= require("path")
var ObjectID = require('mongodb').ObjectID;


// GET route for reading data
// router.get('/', function (req, res, next) {
//   return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
// });


//POST route for updating data
router.post('/login', function (req, res, next) {
  

  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }
  
  if (req.body.email &&
    req.body.password &&
    req.body.passwordConf) {
      
      var userData = {
        email: req.body.email,
        user: req.body.username,
        password: req.body.password,
        servingSize: req.body.servingSize,
      }
      
      User.create(userData, function (error, user) {
        let userExists = false;
        User.find({email:req.body.email})
        .then(function(dbres)
        {if (dbres) {
          console.log("This is the end", dbres)
          if (userExists){
      
            let err = new Error ('User already exists');
            console.log("User already exists")
        
          }
          else {
            console.log("it's creating a user")
            req.session.userId = user._id;
            return res.json(user);
          
          }
          
        }}
        )
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
       
          return res.json(user)
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
          console.log(EvalError)
          err.status = 400;
          return next(err);
        } else {
          return res.json( user)
        }
      }
    });
  });
  
  // POST for logout 
  router.post('/logout', function (req, res, next) {
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

  router.get('/recipeJoke', function (req,res) {
    axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/food/jokes/random",
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

  router.get('/recipeTrivia', function (req,res) {
    axios( {
      method: 'GET',
      url: "https://api.spoonacular.com/food/trivia/random",
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

      //  GET route after registering
router.post('/addItems', function (req, res, next) {
   User.find({_id: req.body.userID}).then(function(user){
     let existItem=false;
    for (let i = 0; i < user[0].items.length; i++){
      if(user[0].items[i].name.toLowerCase() === req.body.name.toLowerCase()){
        console.log(user[0].items[i].name.toLowerCase(),req.body.name.toLowerCase())
        existItem=true;
        const qty = parseFloat(user[0].items[i].quantity)
        const total = qty+parseFloat(req.body.quantity)
        console.log(total,"      ",user[0].items[i].name)
        User.updateOne({"_id": user[0]._id, "items.name": user[0].items[i].name}, {$set: {"items.$.quantity":total}, new: true}).then(function (params) {
          console.log(params)
        }).catch(function (err) {
          throw err
        })
        // return newData
      }      
    }
    if(!existItem){
      const newData = User.updateOne({"_id": user[0]._id}, {$push: {"items":{name:req.body.name,quantity:req.body.quantity}}, new: true})
      return newData
    
    }
  
  }).then(function(data){
    return res.json(data)
  }).catch(function(err){
    throw err
  });
  
});

router.post('/cookItems', function (req, res, next) {
   User.find({_id: req.body.userID}).then(function(user){
    for (let i = 0; i < user[0].items.length; i++){
      if(user[0].items[i].name.toLowerCase() === req.body.name.toLowerCase()){
        const qty = parseFloat(user[0].items[i].quantity)
        const total = qty-parseFloat(req.body.quantity)
        const newData = User.updateOne({"items.name": user[0].items[i].name}, {$set: {"items.$.quantity":total}, new: true})
        return newData
      }      
    }  
  }).then(function(data){
    return res.json(data)
  }).catch(function(err){
    throw err
  });  
});

router.post('/deleteItem', function(req, res) {
  User.update(
    {"_id": ObjectID(req.body.userID)}, {$pull: {items:{_id:ObjectID(req.body.itemID)}}})         
.then(function(data){
  return res.json(data)
}).catch(function(err){
  console.log(err)
});
});

router.post('/addRecipe', function(req, res) {
  User.update(
    {"_id": ObjectID(req.body.userID)}, {$push: {recipes:{  
      recipeId: req.body.recipeId,
      image: req.body.image,
      name: req.body.name
    }}})         
.then(function(data){
  return res.json(data)
}).catch(function(err){
  console.log(err)
});
});

//Update item name and quantity
router.post('/updateItem', function (req, res, next) {
  User.find({_id: req.body.userID}).then(function(user){  
    for (let i = 0; i < user[0].items.length; i++){   
          if(user[0].items[i]._id == req.body.itemID){
            const newData = User.updateOne(
              {
                "items._id": user[0].items[i]._id,
              }, 
              {$set:
                {
                  "items.$.name":req.body.name,
                  "items.$.quantity":req.body.quantity
          }, new: true})
            return newData
          }      
   }
 }).then(function(data){
   return res.json(data)
 }).catch(function(err){
   throw err
 }); 
});

router.post('/cook', function (req, res, next) {
  console.log(req.body)
  User.find({_id: req.body.userID}).then(function(user){  
    for (let i = 0; i < user[0].recipes.length; i++){   
          if(user[0].recipes[i].recipeId == req.body.recipeID){
            const newData = User.updateOne(
              {
                "recipes._id": user[0].recipes[i]._id,
              }, 
              {$set:
                {
                  "recipes.$.cooked":true,
                  "recipes.$.date":req.body.date
          }, new: true})
            return newData
          }      
   }
 }).then(function(data){
   return res.json(data)
 }).catch(function(err){
   throw err
 }); 
});

router.post('/deleteRecipe', function(req, res) {
  // Remove a note using the objectID
  User.update(
    {"_id": ObjectID(req.body.userID)}, {$pull: {recipes:{_id:ObjectID(req.body.recipeID)}}})         
.then(function(data){
  return res.json(data)
}).catch(function(err){
  console.log(err)
});
});

router.post('/serving', function(req, res) {
  // Remove a note using the objectID
  User.update(
    {"_id": ObjectID(req.body.userID)}, {servingSize:req.body.serving})         
.then(function(data){
  return res.json(data)
}).catch(function(err){
  console.log(err)
});
});


router.get('/AllItems/:query', function (req,res) {
  User.find({_id: req.params.query}).then(function(user){
    return res.json(user);
  })
});


module.exports = router;
// Hello