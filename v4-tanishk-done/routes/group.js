var express = require("express");
// to make the appended route at the app.js work
var router = express.Router({mergeParams:true});
var Group =require("../modules/group");
var User =require("../modules/users");
var Comment	= require("../modules/comment");
var methodOverride = require("method-override");
var cloudinary = require('cloudinary');
router.use(methodOverride("_method"));

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

router.get("/new",isLoggedIn,function(req,res){
	res.render("group/new");
});
router.get("/:id",isLoggedIn,function(req,res){
	Group.findById(req.params.id).populate("members").exec(function(err,foundGroup){
		if(err){
			res.redirect("back");
		}
		else{
			res.render("group/index",{group:foundGroup,user:req.user});
		}
	})
})


// create new group
router.post("/",isLoggedIn,function(req,res){
	upload(req,res,function(err){
		if(req.files[0]){
			cloudinary.uploader.upload(req.files[0].path, function(result) { 
            		var image = result.secure_url;
            		var name = req.body.name;
            		var author={
            		  id:req.user._id,
            		  username:req.user.username
            		};
            		var description = req.body.description;
            		var obj={
            			name:name,
            			image:image,
            			author:author,
            			description:description
            		}
            		User.findById(req.user._id,function(err,founduser){
            			if (err) {
            				res.redirect("back");
            			}
            			else{
            					Group.create(obj,function(err,group){
            				    if(err){
            				      console.log(err);
            				    }
            				    else{
            				      founduser.groups.push(group);
            				      founduser.save();
            				      group.members.push(founduser);
            					  group.save();

            				      res.redirect("/group/"+group._id);
            				    }
            				  })
            			}
            		})
            		

            });
		}
		else{
			var name = req.body.name;
			var author={
			  id:req.user._id,
			  username:req.user.username
			};
			var description = req.body.description;
			var obj={
				name:name,
				author:author,
				description:description
			}
			User.findById(req.user._id,function(err,founduser){
				if (err) {
					res.redirect("back");
				}
				else{
						Group.create(obj,function(err,group){
					    if(err){
					      console.log(err);
					    }
					    else{
					      founduser.groups.push(group);
					      founduser.save();
					      group.members.push(founduser);
						  group.save();

					      res.redirect("/group/"+group._id);
					    }
					  })
				}
			})
		}
	})
	
})

// EDIT - shows edit form for a group
router.get("/:id/edit", isLoggedIn, checkGroupOwnership, function(req, res){
  //render edit template with that post
  res.render("group/edit", {group: req.group});
});

// UPDATE GROUP ROUTES
router.put("/:id",checkGroupOwnership,function(req,res){
	// find and update correct post 
	upload(req,res,function(err){
		if(req.files[0]){
			cloudinary.uploader.upload(req.files[0].path, function(result) { 
					req.body.group["image"]=result.secure_url;
					Group.findByIdAndUpdate(req.params.id,req.body.group,function(err,updatedPost){
						if (err) {
							res.redirect("/group/"+req.params.id);
						}
						else{
							// redirect somewhere
							res.redirect("/group/"+req.params.id);
						}
					})
			})	

		}
		else{
			Group.findByIdAndUpdate(req.params.id,req.body.group,function(err,updatedPost){
				if (err) {
					res.redirect("/group/"+req.params.id);
				}
				else{
					// redirect somewhere
					res.redirect("/group/"+req.params.id);
				}
			})
		}
	});
	
	
})
// DESTROY POST
router.delete("/:id",checkGroupOwnership,function(req,res){
	Group.findByIdAndRemove(req.params.id,function(err){
		if (err) {
			res.redirect("/group/"+req.params.id);
		}
		else{
			res.redirect("/profile");
		}
	});
});

 //ADD MEMBERS
 router.get("/:id/add",function(req,res){
 	res.render("group/search",{id:req.params.id});
 });
 router.post("/:id/search",function(req,res){
   User.find({name:req.body.query},function(err,user){
     if (err) {
       console.log(err);
     }
     else{
       res.render("group/search1",{id:req.params.id,user:user});
     }
   })
 }); 
router.post("/:id/member/:member_Id",function(req,res){
	Group.findById(req.params.id,function(err,foundGroup){
		if (err) {
			res.redirect("back");
		}
		else{
			User.findById(req.params.member_Id,function(err,user){
				if(err){
					res.redirect("back");
				}
				else{
					foundGroup.members.push(user);
					foundGroup.save();
					user.groups.push(foundGroup);
					user.save();
					console.log(foundGroup);
					res.redirect("/group/"+foundGroup._id);
				}
			})
		}
	})
})

// chat application
router.get("/:id/chat",function(req,res){
	Group.findById(req.params.id).populate("comments").exec(function(err,foundGroup){
		if (err) {
			res.redirect("back");
		}
		else{
			res.render("group/chat",{group:foundGroup,user:req.user});
		}

	})
})
// post for chat
router.post("/:id/chat",function(req,res){
	var text=req.body.text;
	var obj={
		text:text
	};
	Group.findById(req.params.id,function(err,foundGroup){
		if (err) {
			res.redirect("back");
		}
		else{
			Comment.create(obj,function(err,data){
				if (err) {
					console.log(err);
					res.redirect("back");

				}
				else{
					// add username and id to comment
					data.author.id=req.user._id;
					data.author.username=req.user.username;
					// save comment
					data.save();
					foundGroup.comments.push(data);
					foundGroup.save();
					res.redirect("/group/"+req.params.id+"/chat");
				}
			})
		}
	})
})


function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	req.flash('error', 'Sorry, you must be logged in to do that');

	res.redirect("/login");
};

function checkGroupOwnership(req, res, next){
    Group.findById(req.params.id, function(err, foundPost){
      if(err || !foundPost){
          console.log(err);
          req.flash('error', 'Sorry, that group does not exist!');
          res.redirect('/profile');
      } else if(foundPost.author.id.equals(req.user._id) || req.user.isAdmin){
          req.group = foundPost;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/group/' + req.params.id);
      }
    });
  }
module.exports=router;