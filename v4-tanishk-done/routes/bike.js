var express = require("express");
// to make the appended route at the app.js work
var router = express.Router({mergeParams:true});
var Bike = require("../modules/bike");
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
// BIKE
// =====================================

// INDEX 
router.get("/",isLoggedIn,function(req,res){
    Bike.find({},function(err,allBikes){
      if (err) {
        console.log(err);
      }
      else{
          res.render('bike/index',{user:req.user,data:allBikes});
      }
    })        
});
// NEW
router.get("/new",isLoggedIn,function(req,res){
  res.render("bike/new")

});

// CREATE
router.post("/",function(req,res){
  upload(req,res,function(err){
    console.log(req.files);
    if (req.files[0]) {
      cloudinary.uploader.upload(req.files[0].path, function(result) {
          var rtoNo=req.body.rtoNo;
          var model=req.body.model;
          var image=result.secure_url;
          var description=req.body.description;
          var id=req.user.id;
          var author={
            id:id
          };
          var obj={
            rtoNo:rtoNo,
            model:model,
            description:description,
            author:author,
            image:image
          };
          Bike.create(obj,function(err,bike){
            if(err){
              console.log(err);
            }
            else{
              // redirect to the campgrounds page
              res.redirect("/bikes");
            }
          })
     })
    }
    else{
      var rtoNo=req.body.rtoNo;
      var model=req.body.model;
      var description=req.body.description;
      var id=req.user.id;
      var author={
        id:id
      };
      var obj={
        rtoNo:rtoNo,
        model:model,
        description:description,
        author:author
      };
      Bike.create(obj,function(err,bike){
        if(err){
          console.log(err);
        }
        else{
          // redirect to the campgrounds page
          res.redirect("/bikes");
        }
      }) 
    }
   

  })
  

})
// EDIT
router.get("/:id/edit",isLoggedIn,function(req,res){
  Bike.findById(req.params.id,function(err,foundBike){
    if (foundBike.author.id.equals(req.user._id)) {
              res.render("bike/edit",{bike:foundBike});

    }
  });
});
// UPDATE
router.put("/:id",function(req,res){
  // find and update correct profile 
  upload(req,res,function(err) {
    if (req.files[0]) {
       cloudinary.uploader.upload(req.files[0].path, function(result) {
            req.body.bike["image"]=result.secure_url;
            Bike.findByIdAndUpdate(req.params.id,req.body.bike,function(err,updatedBike){
              if (err) {
                console.log(err);
                res.redirect("/bikes");
              }
              else{
                // redirect somewhere
                res.redirect("/bikes");
              }
            })
       });
    }
    else{
      Bike.findByIdAndUpdate(req.params.id,req.body.bike,function(err,updatedBike){
        if (err) {
          console.log(err);
          res.redirect("/bikes");
        }
        else{
          // redirect somewhere
          res.redirect("/bikes");
        }
      })
    }
  })
 
  
})
// DELETE
router.delete("/:id",isLoggedIn,function(req,res){
  Bike.findByIdAndRemove(req.params.id,function(err){
    if (err) {
      res.redirect("/bikes");
    }
    else{
      res.redirect("/bikes");
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
} 
module.exports=router;

