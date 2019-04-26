var mongoose = require("mongoose");
var groupSchema = new mongoose.Schema({
	name:String,
	description:String,
	image:String,
	comments:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"Comment"
		}
	],
	members:[
		{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		}
	],
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			// ref refers to the model that we are going to refer to with objectID
			ref:"User"
		},
		username:String
	},
	created:{type:Date,default:Date.now}

});
var Group = mongoose.model("Group",groupSchema);
module.exports = Group;