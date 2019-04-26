var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var DateOnly = require('mongoose-dateonly')(mongoose);

var userSchema = new mongoose.Schema({
	username:String,
	name:String,
	password:String,
	email:String,
	age:Number,
	facebook:{
		id:String,
		token:String,
		email:String,
		name:String
	},
	google: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	groups:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Group"
		}
	],
	// DOB:DateOnly,
	coverPhoto:String,
	profilePhoto:String,
	address:String,
	description:String,
	created:{type:Date,default:Date.now}
});
userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",userSchema);

module.exports = User;
