
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB URI (MongoDB Atlas or local)
const uri = 'mongodb+srv://srinup454:srinup454@cluster0.jmree.mongodb.net/Shop';

// Connect to MongoDB
const dbConnect = () => {
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
};


// Define the User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a Model from the Schema
const users = mongoose.model('users', userSchema);

// Register a new user
const registerUser = async (username, email, password,registrationCallBack) => {
  try {
    const existingUser = await users.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists!');
      registrationCallBack({error:"Register failed"})
      return;
    }

    // Create a new user document
    const newUser = new users({
      username,
      email,
      password, // You should hash the password before saving in production
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    console.log('User registered successfully:', savedUser);
    registrationCallBack({username,email,password});
  } catch (error) {
    console.error('Error registering user:', error);
    registrationCallBack({error:"Register failed"});
  }
};

const loginUser = async (username,password,loginCallBack) => {
       // Find the user by username (or email, etc.)
    const user = await users.findOne({ username });

    if (!user) {
      console.log('User not found');
      loginCallBack('user not found',400,null);
      return;
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      console.log('Login successful');
      // Proceed with the user session or perform other actions
      loginCallBack('Login successful',200,user);
    } else {
      console.log('Invalid password');
      loginCallBack('Invalid password',400,null);
    }

};

module.exports.registerUserFunction = registerUser;
module.exports.loginUserFunction = loginUser
module.exports.dataBaseConnect = dbConnect;