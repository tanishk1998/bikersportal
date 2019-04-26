var express = require("express");
var router = express.Router();
const ejs = require('ejs');
var passport = require("passport");
var User = require("../modules/users");
var multer = require('multer');
var  fs = require('fs');
var bodyParser = require("body-parser");
var fileupload = require("express-fileupload");
var path = require("path");
var async=require("async");
var nodemailer=require("nodemailer");
var crypto = require("crypto");

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileupload());

// ROUTES
router.get("/",function(req,res){
  res.render("index");
});

// SEARCH
router.post("/search",function(req,res){
  User.find({name:req.body.name},function(err,user){
    if (err) {
      console.log(err);
    }
    else{
      res.render("search",{user:user});
    }
  })
});

// ===================================
// AUTHENTICAION ROUTES
// ===================================

// ======================
// LOGIN ROUTES
// ======================

// to show the register page
router.get("/sign-up",function(req,res){
  res.render("signup");
});

// handle sign-up logic

// render the login page
router.get("/login",function(req,res){
  res.render("login");
});

router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/login"
}),function(req,res){

})
// logout
router.get("/logout",function(req,res){
  req.logout();
  req.flash("error","successfully logged out");
  res.redirect("/");
});

// forgot email
router.get("/forget",function(req,res){
  res.render("forget");
})

router.post('/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user:'anshulsahu2742p@gmail.com',
          pass:'@nshul2742'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'anshulsahu2742p@gmail.com',
        subject: 'Bikers Portal Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        req.flash('error', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forget');
  });
});
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

router.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    function(user, done) {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'anshulsahu2742p@gmail.com',
          pass: '@nshul2742'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'anshulsahu2742p@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('error', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/profile');
  });
});
// FACEBOOK LOGIN
router.get('/auth/facebook', passport.authenticate('facebook',{scope:['email']}));


router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect: '/profile',
                                      failureRedirect: '/' }));

// GOOGLE LOGIN

router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

router.get('/auth/google/callback', 
    passport.authenticate('google', { successRedirect: '/profile',
                                        failureRedirect: '/' }));

// middleware

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}
module.exports=router;