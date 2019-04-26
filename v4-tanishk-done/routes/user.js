var express = require("express");
// to make the appended route at the app.js work
var router = express.Router({mergeParams:true});
var Bike = require("../modules/bike");
var Post = require("../modules/post");
var User = require("../modules/users");
var multer = require('multer');
var cloudinary = require('cloudinary');
// Multer setup
const storage = multer.diskStorage({
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});

const imageFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        return callback(new Error("Only image files are allowed!"), false);
    }
    callback(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFilter }).any();

// Cloudinary setup
cloudinary.config({
    cloud_name:'dseyaumam',
    api_key:'757859675353735',
    api_secret:'KuAogemqXJFjRyKWnVS27ynoFQA'
});


// =====================================
// PROFILE
// =====================================

// SHOW CURRENT USER PROFILE
router.get('/', isLoggedIn, function(req, res){
  User.findById(req.user._id).populate("groups").exec(function(err,founduser){
    if (err) {
      res.redirect("back");
    }
    else{
      Post.find({},function(err,allPost){
        if (err) {
          console.log(err);
        }
        else{
                res.render('profile',{user:founduser,data:allPost});
        }
      })    
    }
  });
        
});
// EDIT USER PROFILE
router.get("/:id/edit",isLoggedIn,function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if (foundUser._id.equals(req.user._id)) {
              res.render("edit",{user:foundUser});

    }
  });
});
// UPDATE USER PROFILE
router.put("/:id",isLoggedIn,function(req,res){
  // find and update correct profile 
  upload(req,res,function(err){
      if (req.files[0]) {
            cloudinary.uploader.upload(req.files[0].path, function(result) {
                  req.body.user["profilePhoto"]=result.secure_url;
                        User.findByIdAndUpdate(req.params.id,req.body.user,function(err,updatedUser){
                          if (err) {
                            res.redirect("/profile");
                          }
                          else{
                            // redirect somewhere
                            res.redirect("/profile");
                          }
                        })
            })
      }
      else{
        User.findByIdAndUpdate(req.params.id,req.body.user,function(err,updatedUser){
          if (err) {
            res.redirect("/profile");
          }
          else{
            // redirect somewhere
            res.redirect("/profile");
          }
        })
        
      }

  })
  
  
});


router.get("/:id",isLoggedIn,function(req,res){
  User.findById(req.params.id,function(err,user){
    if(err || !user){
      // console.log(err);
      req.flash('error', 'Sorry, that user does not exist!');
      return res.redirect('back');
    }
    else{
      Post.find({},function(err,allPost){
        if (err) {
          console.log(err);
        }
        else{
                res.render('profile/show',{user:user,data:allPost});
        }
      })      
    }
  })
})

router.get("/bikes/:id",isLoggedIn,function(req,res){
  Bike.find({"author.id":req.params.id},function(err,allBikes){
      if (err || !allBikes) {
        // console.log(err);
        req.flash('error', 'Sorry, that bikes do not exist!');
        return res.redirect('back');
      }
      else{
        res.render("profile/bike",{data:allBikes,user:req.params.id});
      }
  })
})
// ABOUT PAGE
router.get("/:id/about",isLoggedIn,function(req,res){
  User.findById(req.params.id,function(err,foundUser){
    if (!foundUser) {
      req.flash("error","an error has occured")
    }
    else{
      res.render("profile/about",{user:foundUser,currentUser:req.user._id});
    }
  })
})

// middleware
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash('error', 'Sorry, you must be logged in to do that');
  res.redirect("/login");
} 
module.exports=router;