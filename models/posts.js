const mongoose = require('mongoose');
var postSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postMessage: {
        type: String
    }
}, { timestamps: true });


module.exports = mongoose.model("Post", postSchema);  //creating