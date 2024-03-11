const mongoose = require('mongoose');


const userSchema = mongoose.Schema({
    user_id: {
        type: String,
        require: true
    },
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    image: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        require: true
    }

});

//User collection  in database will be created using this function .
module.exports = mongoose.model("User", userSchema); 