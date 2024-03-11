const express = require('express');
const userRoute = express();
const multer = require("multer");
const path = require('path');
const auth = require('../middleware/auth');

userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }));

userRoute.use(express.static('public'));

// Require User Controllers
const userControllers = require('../controllers/userControllers');



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../public/userImage"));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});
const upload = multer({ storage: storage })

//All Route

userRoute.post('/register', upload.single('image'), userControllers.addUser);

userRoute.post('/login', userControllers.loginUser);

userRoute.post('/upate-profile',auth.verifyToken, upload.single('image') ,userControllers.updateUserProfile);

userRoute.get('/view-profile', auth.verifyToken, userControllers.viewUserProfile);

userRoute.get('/delete-profile', auth.verifyToken, userControllers.deleteUserProfile);

// all Posts Routes 

userRoute.post('/create-post', auth.verifyToken, userControllers.createPost);

userRoute.post('/update-post', auth.verifyToken, userControllers.updatePost);

userRoute.get('/', auth.verifyToken, userControllers.allPosts);

userRoute.get('/delete-post', auth.verifyToken, userControllers.deletePosts);

//Follower Routes

userRoute.post('/follow',auth.verifyToken,userControllers.followAndFollowingUser);

module.exports = userRoute; 