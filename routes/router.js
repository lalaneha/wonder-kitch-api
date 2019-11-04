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
    let exist=false;
    User.find({where:{email:req.body.email}})
    if (dbUser.length===0) {


    
    // .then (dbUser=>{
    //     console.log("Hello db" , dbUser)

    if (dbUser.length===0) {
exist=false
    //     req.body = user.password  

    //    //no user found with email b/c empty.  
    //    //hash given password
    //    //replace password that exists in req.body and reassign req.body to hash
    //    //new user object with no sensitive data and assign that to new user
    // }

    // })
    // .catch(err => {
    //     console.log(err)})
    // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordConf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }

  if (
    req.body.email &&
    req.body.username &&
    req.body.password &&
    req.body.passwordConf) {

    var userData = {
      email: req.body.email,
      user: req.body.username,
      password: req.body.password,
    }
    
    User.find({where:{email:req.body.email}})
    if (dbUser!== {email:req.body.email}, function(err,res) {
        User.create(userData, function (error, user) {
            if (error) {
              return next(error);
            } else {
                console.log(req)
              req.session.userId = user._id;
              return res.redirect('/profile');
            }
          }); 
    })
   
 

    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
          console.log(req)
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

   else if (req.body.logemail && req.body.logpassword) {
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
          return res.send( user.username,user.email)
        }
      }
    });
});

// GET for logout
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

module.exports = router;