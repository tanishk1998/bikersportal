var express = require("express");
// to make the appended route at the app.js work
var router = express.Router({mergeParams:true});
var Post =require("../modules/post");
var Comment	= require("../modules/comment");
var methodOverride = require("method-override");
router.use(methodOverride("_method"));


// =========================
// COMMENT ROUTES
// =========================

// COMMENTS NEW
router.get("/new",isLoggedIn,function(req,res){
	// find campground by id
	Post.findById(req.params.id,function(err,foundPost){
		if (err) {
			console.log(err);
		}
		else{
			res.render("comments/new",{post:foundPost});
		}
	})
})

// COMMENTS CREATE
router.post("/",isLoggedIn,function(req,res){
	Post.findById(req.params.id,function(err,post){
				if (err) {
					console.log(err);
					res.redirect("/posts");
				}
				else{
					// console.log(req.body.comment);
					Comment.create(req.body.comment,function(err,data){
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
							post.comments.push(data);
							post.save();
							res.redirect("/posts/"+req.params.id);
						}
					})
				}
	})	
})

// EDIT
router.get("/:comment_id/edit", isLoggedIn, checkCommentOwnership, function(req, res){
  res.render("comments/edit", {post_id: req.params.id, comment: req.comment});
});
// UPDATE
router.put("/:comment_id",checkCommentOwnership,isLoggedIn,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,foundComment){
		if (err) {
			console.log(req.params.comment_id);
			console.log(err);
			res.redirect("back");
		}
		else{
			res.redirect("/posts/"+req.params.id)
		}
	})
})
// DELETE
router.delete("/:comment_id",checkCommentOwnership,isLoggedIn,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err,comment){
		if (err) {
			console.log(err||!comment);
			console.log(comment);
			res.redirect("back");
		}
		else{
			res.redirect("/posts/"+req.params.id);
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
function checkCommentOwnership(req,res,next){
	// is the user logged in?
	if (req.isAuthenticated()) {

		Comment.findById(req.params.comment_id,function(err,foundCampground){
			if(err){
				res.redirect("back");
			}
			else{
				// does the user own the campground?
				if (foundCampground.author.id.equals(req.user._id)) {
						// this runs whatever code we have inside of the route handler
						req.comment=foundCampground;
						next();

				}
				else{
					// otherwise ,redirect

					res.redirect("back");
				}
			}
		})

	}
	else{
		// if not , redirect
		// will send the user back to the page from where the user comes from
		res.redirect("back");
	}

} 
module.exports=router;