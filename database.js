const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const flatted = require("flatted");

// MongoDB URI (MongoDB Atlas or local)
const uri = "mongodb+srv://srinup454:srinup454@cluster0.jmree.mongodb.net/Shop";

// Connect to MongoDB
const dbConnect = () => {
  mongoose
    .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log("MongoDB connected successfully");
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
    });
};

mongoose.set('debug', true); // Enable Mongoose debug mode

// Define the User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create a Model from the Schema
const users = mongoose.model("users", userSchema);

// Schema for Fruit
const fruitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
});

// Schema for Vegetable
const vegetableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: String, required: true },
  id: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Main Schema that holds Fruits and Vegetables
const productSchema = new mongoose.Schema({
  fruits: [fruitSchema],
  Vegetables: [vegetableSchema]
});

const Product = mongoose.model("products", productSchema);

// Register a new user
const registerUser = async (
  username,
  email,
  password,
  registrationCallBack
) => {
  try {
    const existingUser = await users.findOne({
      $or: [{ email }, { username }],
    });
    if (existingUser) {
      console.log("User already exists!");
      registrationCallBack({ error: "Register failed" });
      return;
    }

    // Create a new user document
    const newUser = new users({
      username,
      email,
      password, 
    });

    // Save the user to the database
    const savedUser = await newUser.save();
    console.log("User registered successfully:", savedUser);
    registrationCallBack({ message:"User registration successfull",username, email });
  } catch (error) {
    console.error("Error registering user:", error);
    registrationCallBack({ error: "Register failed" });
  }
};

const loginUser = async (username, password, loginCallBack) => {
  // Find the user by username (or email, etc.)
  const user = await users.findOne({ username });

  if (!user) {
    console.log("User not found");
    loginCallBack("user not found", 400, null);
    return;
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (isPasswordValid) {
    console.log("Login successful");
    // Proceed with the user session or perform other actions
    loginCallBack("Login successful", 200, user);
  } else {
    console.log("Invalid password");
    loginCallBack("Invalid password", 400, null);
  }
};

const fetchProducts = async (productsCallBack) => { 
  const result = await Product.find();
  console.log(JSON.stringify(result));
  productsCallBack(result)
};

module.exports.registerUserFunction = registerUser;
module.exports.loginUserFunction = loginUser;
module.exports.fetchProductsFunction = fetchProducts;
module.exports.dataBaseConnect = dbConnect;
