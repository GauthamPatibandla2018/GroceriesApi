const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const tokenVerification = require('./authorization');

const {
  registerUserFunction,
  dataBaseConnect,
  loginUserFunction,
  fetchProductsFunction
} = require("./database");

const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory store for users (real-time data simulation)
let users = [];

// Secret key to sign the JWT
const secretKey = "ABDEVEILLIERS";

//host
app.get("/", (req, res) => {
  res.send("Node started");
});

// Registration Route
app.post("/registerUser", async (req, res) => {
  const { username, password, email } = req.body;

  // Validate input
  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required!" });
  } 
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;
    registerUserFunction(username, email, hashedPassword, (result) => {
      res.status(201).json({ result });
    });
    console.log("user registered is === ");
  });
});


// Login Route
app.post("/loginUser",  async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required!" });
  }
  loginUserFunction(username, password, (message, status, user) => {
    // Return success message and user data
    // JWT options
    const options = {
         expiresIn: '50min'  // The token will expire in 1 hour
     };
    let tokenData = null;
    if (status == 200) {
      tokenData =  jwt.sign({username},secretKey,options);
    }
    return res.status(status).json({
      message: message,
      token: tokenData
    });
  });
});


// Get products route
  app.get("/products", tokenVerification, async(req,res)=> {
         fetchProductsFunction(products => {
          return res.status(200).json({
              products
          });
         });

  });



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

dataBaseConnect();

