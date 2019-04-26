var mongoose = require("mongoose");


var bikeSchema = new mongoose.Schema({
	image:String,
	rtoNo:String,
	model:String,
	description:String,
    author:{
    	id:{
    		type:mongoose.Schema.Types.ObjectId,
    		ref:"User"
    	},
    	username:String
    }
});

var Bike = mongoose.model("Bike",bikeSchema);

module.exports = Bike;

