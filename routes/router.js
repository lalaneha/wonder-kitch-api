var express = require('express');
var router = express.Router();
var User = require('../models/user');
var axios = require("axios");
var querystring = require("querystring");
var FormData = require("form-data");
var ObjectID = require('mongodb').ObjectID;



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
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
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
      url: "https://api.spoonacular.com/recipes/findByIngredients?apiKey=58cfd4a9c5d74b4b8a81d26ef617114f", 
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
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
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
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
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
        apiKey:"58cfd4a9c5d74b4b8a81d26ef617114f",
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
 
  router.post('/takePicture/:query', function (req) {
    let result;
    let pic=req.params.query;
    const data = new FormData()
    data.append('file', pic)
    console.log("this is it ndm",data)
    //  await
      axios({
       method:"POST",
       url:"https://api.taggun.io/api/receipt/v1/verbose/file", req,
       headers:{
         "Content-Type": "application/x-www-form-urlencoded",
         "apikey":"ab7591d0fabe11e98bfadfb7eb1aa8b5",
         "processData": false,
         "contentType": false,
         "mimeType": "multipart/form-data"
       }      
       }).then((params)=> {
         console.log(params)
         result=params.data.text.text;
         console.log(params)
       })
       .catch((error)=>{
         console.log(error)
       })  
       //  axios( {
       //   method: 'post',
       //   headers:{
       //     "Content-Type":"application/x-www-form-urlencoded"
       //   },
       //   url: "https://api.spoonacular.com/food/detect?apiKey=58cfd4a9c5d74b4b8a81d26ef617114f", 
       //   data: querystring.stringify({
       //   text:result
       //   })
       // })       
       // .then(function (response) {
       //   return res.json(response.data)
       // })
       // .catch(function (err) {
       //   console.log(err);
       // });
       });


       // GET route after registering
router.put('/addItems', function (req, res, next) {
   User.find({_id: req.body.userID}).then(function(user){
     let existItem=false;   
    for (let i = 0; i < user[0].items.length; i++){
      if(user[0].items[i].name.toLowerCase() === req.body.name.toLowerCase()){
        existItem=true;
        // console.log("qty", user[0].items[i].quantity)
        
        // console.log("req.body.quantity ",req.body.quantity)
        const qty = parseInt(user[0].items[i].quantity)        
        const total = qty + parseInt(req.body.quantity)
        // console.log("total", total);
        // console.log(user)
        const newData = User.updateOne({"items.name": user[0].items[i].name}, {$set: {"items.$.quantity":total}, new: true})
        return newData
      }      
    }
     if(!existItem){
      const newData = User.updateOne({"_id": user[0]._id}, {$push: {items:{ name:req.body.name,quantity:req.body.quantity}}, new: true})
      
      return newData
    }
  
  }).then(function(data){
    console.log("data", data)
    res.json(data)
  }).catch(function(err){
    throw err
  });
  
});

router.put('/deleteItem/:id', function(req, res) {
  // Remove a note using the objectID
  User.update(
    {"_id": ObjectID(req.body.userID)}, {$pull: {items:{_id:ObjectID(req.body.itemID)}}})         
.then(function(data){
  return res.json(data)
}).catch(function(err){
  console.log(err)
});
});


module.exports = router;
