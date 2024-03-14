// Require all the modules
const User = require('../models/userModels');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const Post = require('../models/posts');
const Follow = require('../models/follows');

// Generate a UUID
const { v4: uuidv4 } = require('uuid');


// Convert a password to secure Password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        console.log(passwordHash);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}


//Create a Token 
const createToken = async (data) => {
    try {
        const userData = {
            userId: data.user_id,
            email: data.email
        }

        const token = jwt.sign({ userData }, config.secret_jwt, { expiresIn: "2h" });
        return token;
    } catch (error) {
        console.log(error.message);
    }
}

// Register a new  user
const addUser = async (req, res) => {
    try {
        const reqBody = req.body;
        const { name, email, password, mobile } = reqBody;
        const { image } = req.file.filename;

        if (!name || !email || !password || !mobile || !image)
            return res.status(400).json({ success: false, message: "All fields are  required" });

        const secure_Password = await securePassword(password);
        const isExist = await User.findOne({ email: email });
        const uuid = uuidv4();
        // check if user already exists in the database
        if (!isExist) {
            await User.create({
                user_id: uuid,
                name: name,
                email: email,
                password: secure_Password,
                mobile: mobile,
                image: 'iamge/' + image
            });

            res.status(200).send({ success: true, message: "User has been Registered successfully." });
        } else {
            res.status(400).json({ success: false, message: "User all ready exists " });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}


//Login And genrate a token 
const loginUser = async (req, res) => {
    try {
        const reqBody = req.body;
        const { email, password } = reqBody;
        if (!email || !password)
            return res.status(400).json({ success: false, message: "All fields  are required" });
        let userData = await User.findOne({ email: email });
       
        if (userData) {
            const passwordMatch = await bcrypt.compare(password, userData.password);
            if (passwordMatch) {
                const token = await createToken(userData);

                res.status(200).json({ success: true, message: "Login  Successfully", data: userData, token: token })

            } else {
                res.status(400).json({ success: false, message: "Email Or Password is Wrong!." });
            }
        } else {
            res.status(400).json({ success: false, message: "Email Or Password is Wrong!." });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// Update Own profile
const updateUserProfile = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { name, email, mobile, password } = reqBody;
        var image = req.file.filename;
        if (name || email || mobile || password || image) {
            //  Check Email Is Exists or not
            const isExist = await User.findOne({ email: userData.email });
            const passwordMatch = await bcrypt.compare(password, isExist.password);
            if(passwordMatch){
            if (isExist) {
                await User.findOneAndUpdate(
                    { email: email },
                    {
                        $set:
                        {
                            name: name,
                            email: email,
                            mobile: mobile,
                            image: 'iamge/' + image,
                        }
                    });
                res.status(200).json({ success: true, message: "Your Profile Updated Successfully!" });
                
            } else {
                res.status(400).json({ success: false, message: "User doesn't exist!" });
            }
            }else{
                 res.status(400).json({ success: false, message: "Please Enter correct password for update your Daitle !" });
            }      

        } else {
            res.status(400).json({ success: false, message: "You can't Update your Name or Email or Mobile Number!" })
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// View Own Profile
const viewUserProfile = async (req, res) => {
    try {
        const userData = req.user.userData;
        const validUser = await User.findOne({ email: userData.email });
        if (validUser) {
            res.status(200).json({ success: true, message: "User Profile!", Data: validUser });
        } else {
            res.status(400).json({ success: false, message: "Unauthorized Access" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}
// Delete  a User 
const deleteUserProfile = async (req, res) => {
    try {
        const userData = req.user.userData;
        const isValidUser = await User.findOne({ email: userData.email });
        if (isValidUser) {
             const passwordMatch = await bcrypt.compare(password, isValidUser.password);
            if(passwordMatch){
                await User.findOneAndDelete({ email: userData.email }).exec();
                 res.status(200).json({ success: true, message: 'Account has been deleted!' })
            }else{
            res.status(400).send("Please enter a right password to delete your account !");
            }
            
        } else {
            res.status(400).send("You can not Delete your own Account!");
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });

    }

}

// Create new Post
const createPost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { postMessage } = reqBody;
        if (!postMessage || !userData)
            return res.status(400).json({ success: false, message: "Please provide a Post!" });
        const validUser = await User.findOne({ email: userData.email });
        if (validUser) {
            await Post.create({
                user_id: validUser.user_id,
                postMessage: postMessage
            });
            res.status(200).json({ success: true, message: 'Post created successfully!' });

        } else {
            res.status(400).json({ success: false, message: "Invalid User" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });

    }
}

// Update Post
const updatePost = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { postMessage } = reqBody;
        if (!postMessage || !userData)
            return res.status(400).json({ success: false, message: "Please provide a Post!" });
        const validUser = await User.findOne({ email: userData.email });
        
        if (validUser) {
            const isPost = await Post.findOne({ user_id: userData.user_id });
            if (isPost) {
                await Post.findOneAndUpdate({ user_id: userData.user_id }, { $set: { postMessage: postMessage } });
                res.status(200).json({ success: true, message: 'Post updated successfully!' });
            } else {
                res.status(400).json({ success: false, message: "Post isn't avilible!" });
            }
        } else {
            res.status(400).json({ success: false, message: 'User not valid for update post!' });

        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// View all posts
const allPosts = async (req, res) => {
    try {
        const userData = req.user.userData;
        const validUser = await User.findOne({ email: userData.email });
        if (validUser) {
            let posts = await Post.find({});
            res.status(200).json({ success: true, message: "All Posts are", posts });
        } else {
            res.status(400).json({ success: false, message: "User not valid for views post!" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// Delete Post
const deletePosts = async (req, res) => {
    try {
        const userData = req.user.userData;
        const validUser = await User.findOne({ email: userData.email });
        if (validUser) {
            const isPost = await Post.findOne({ user_id: validUser.user_id });
            if (isPost) {
                await findOneAndDelete({ user_id: validUser.user_id });
                res.status(200).json({ success: true, message: "Post  Deleted Successfully!" });
            } else {
                res.status(400).json({ success: false, message: "You don't have any post" });
            }
        } else {
            res.status(400).json({ success: false, message: "Unauthorized User!" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

//follow user 
const followAndFollowingUser = async (req, res) => {
    try {
        const userData = req.user.userData;
        const reqBody = req.body;
        const { user_id } = reqBody;
        if (user_id)
            return res.status(400).send({ success: false, message: "User Id is required for follow!" });
        const validUser = await User.findOne({ email: userData.email });
        if (validUser) {
            const isExist = await User.findOne({ user_id: user_id });
            if (isExist) {
                const isFollow = await Follow.findOne({ $or: [{ following: user_id }, { follower: validUser.user_id }] })
                if (!isFollow) {
                    await Follow.create({
                        follower: validUser.user_id,
                        following: user_id
                    });
                    res.status(200).json({ success: true, message: "You  are now follow this user!." });

                } else {
                    res.status(400).json({ success: false, message: "You already follow this user!" });

                }
            } else {
                res.status(400).json({ success: false, message: "User dontn't exists!" });

            }
        } else {
            res.status(400).json({ success: false, message: "You are not a valid user!" });
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = {
    addUser,
    loginUser,
    updateUserProfile,
    viewUserProfile,
    deleteUserProfile,
    createPost,
    updatePost,
    allPosts,
    deletePosts,
    followAndFollowingUser
}
