var express = require("express");
var router = express.Router();
var Post = require("../modules/post");
var Comment = require("../modules/comment");
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

// INDEX ROUTE- show all camp grounds
router.get("/",isLoggedIn,function(req,res){
  // GET ALL CAMPGROUNDS FROM DB
  Post.find({},function(err,allPost){
    if(err){
      console.log(err);
    }
    else{
      res.render("post/index",{data:allPost,currentUser:req.user});
    }
  })
})

// NEW ROUTE - displays form to make a new campground
router.get("/new",isLoggedIn,function(req,res){

   res.render("post/new");
})

// CREATE ROUTE - add new campground to DB
router.post("/",isLoggedIn,function(req,res){
  // get data for new campgrounds and add it to the database
  upload(req,res,function(err){
      if(req.files[0]){
        
        cloudinary.uploader.upload(req.files[0].path, function(result) { 
          var title=req.body.title;
          var image=result.secure_url;
          var desc=req.body.description;
          var author={
            id:req.user._id,
            username:req.user.username
          };
          var obj={
            title:title,
            image:image,
            description:desc,
            author:author
          };

          // CREATE A NEW POST AND ADD IT TO THE DB
          Post.create(obj,function(err,post){
            if(err){
              console.log(err);
            }
            else{
              // redirect to the posts page
              res.redirect("/posts");
            }
          })
        });
       }
       else{
          var title=req.body.title;
          var desc=req.body.description;
          var author={
            id:req.user._id,
            username:req.user.username
          };
          var obj={
            title:title,
            description:desc,
            author:author
          };

          // CREATE A NEW POST AND ADD IT TO THE DB
          Post.create(obj,function(err,post){
            if(err){
              console.log(err);
            }
            else{
              // redirect to the posts page
              res.redirect("/posts");
            }
          })
       }
  })

 
  
})

// SHOW - shows more info about one post
router.get("/:id",isLoggedIn ,function(req, res){
    //find the post with provided ID
    Post.findOne({"_id":req.params.id}).populate("comments").exec(function(err, foundPost){
        if(err || !foundPost){
          
            if (err) {
              console.log("hello");
            }
            else{
              console.log("hello++++");
            }
            
            req.flash('error', 'Sorry, that post does not exist!');
            return res.redirect('back');
        }
        // console.log(foundPost);
        //render show template with that post
        res.render("post/show", {post: foundPost});
    });
});
 
// EDIT - shows edit form for a post
router.get("/:id/edit", isLoggedIn, checkPostOwnership, function(req, res){
  //render edit template with that post
  res.render("post/edit", {post: req.post});
});

// UPDATE POST ROUTES
router.put("/:id",checkPostOwnership,function(req,res){
  // find and update correct post
  upload(req,res,function(err){
      if(req.files[0]){
        cloudinary.uploader.upload(req.files[0].path, function(result) { 
                req.body.post["image"]=result.secure_url;
                Post.findByIdAndUpdate(req.params.id,req.body.post,function(err,updatedPost){
                  if (err) {
                    res.redirect("/posts");
                  }
                  else{
                    // redirect somewhere
                    res.redirect("/posts/"+req.params.id);
                  }
                })
        })
      }
      else{
        Post.findByIdAndUpdate(req.params.id,req.body.post,function(err,updatedPost){
          if (err) {
            res.redirect("/posts");
          }
          else{
            // redirect somewhere
            res.redirect("/posts/"+req.params.id);
          }
        })
      }
  }); 
  
  
})
// DESTROY POST
router.delete("/:id",checkPostOwnership,function(req,res){
  Post.findByIdAndRemove(req.params.id,function(err){
    if (err) {
      res.redirect("/posts");
    }
    else{
      res.redirect("/posts");
    }
  });
});

// middleware
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash('error', 'Sorry, you must be logged in to do that');

  res.redirect("/login");
};

function checkPostOwnership(req, res, next){
    Post.findById(req.params.id, function(err, foundPost){
      if(err || !foundPost){
          console.log(err);
          req.flash('error', 'Sorry, that campground does not exist!');
          res.redirect('/posts');
      } else if(foundPost.author.id.equals(req.user._id) || req.user.isAdmin){
          req.post = foundPost;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/posts/' + req.params.id);
      }
    });
  }
module.exports=router;