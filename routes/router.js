var express = require('express');
var router = express.Router();
var User = require('../models/user');


// GET route for reading data
router.get('/', function (req, res, next) {
    return res.sendFile(path.join(__dirname + 'router.js'))
//   return res.sendFile(path.join(__dirname + '/templateLogReg/index.html'));
});


//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
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
        return res.redirect('/profile');
      }
    });

  } else if (req.body.logemail && req.body.logpassword) {
    User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });
  } else {
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
          return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
        }
      }
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// GET route after registering
router.put('/addItems', function (req, res, next) {
   User.find({_id: req.body.userID}).then(function(user){
     let existItem=false;
     let itemId;
    for (let i = 0; i < user[0].items.length; i++){
      itemId=i;
      if(user[0].items[i].name.toLowerCase() === req.body.name.toLowerCase()){
        existItem=true;
        console.log(user[0].items[0].quantity)
        
        console.log("req.body.quantity ",req.body.quantity)
        const qty = user[0].items[0].quantity
        const total = qty+req.body.quantity
        console.log("total", total);
        console.log(user)
        const newData = User.updateOne({"items.name": user[0].items[i].name}, {$set: {"items.$.quantity":total}, new: true})
        return newData
      }      
    }
     if(!existItem){
      const newData = User.updateOne({"_id": user[0]._id}, {$push: {"items":{id:itemId+1, name:req.body.name,quantity:req.body.quantity}}, new: true})
      
      return newData
    }
  
  }).then(function(data){
    console.log("data", data)
    res.json(data)
  }).catch(function(err){
    throw err
  });
  
});



module.exports = router;