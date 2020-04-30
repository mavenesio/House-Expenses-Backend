const mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;


var UserPreferenceSchema = new mongoose.Schema({ 
    key:{
        type: String,
        required: true,
        trim: true,
    },
    value: {
        type: String,
        required: true,
        trim: true,
    },
    userId:{
       type:ObjectId,
       required:true,
       ref:'User'
    }
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);