const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  registerUserFunction,
  dataBaseConnect,
  loginUserFunction,
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

// Registration API
app.post("/registerUser", async (req, res) => {
  const { username, password, email } = req.body;

  // Validate input
  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Check if user already exists
  const existingUser = users.find(
    (user) => user.username === username || user.email === email
  );
  if (existingUser) {
    return res
      .status(400)
      .json({ message: "Username or email already taken!" });
  }

  // Create new user
  const newUser = { username, password, email };
  //users.push(newUser);  // Store user in memory

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) throw err;
    const newUser = { username, password: hashedPassword, email };
    users.push(newUser); // Store user with hashed password
    registerUserFunction(username, email, hashedPassword, (result) => {
      res.status(201).json({ result });
    });
    //res.status(201).json({ message: 'User registered successfully!', user: newUser });
    console.log("user registered is === ");
  });
});

// Login Route
app.post("/loginUser", async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required!" });
  }

  // // Find user by username
  // const user = users.find(u => u.username === username);
  // if (!user) {
  //   return res.status(400).json({ message: 'User not found!' });
  // }

  // Check if the password matches
  // try {
  //     // Compare the password with the hashed password stored in the database
  //     const isPasswordValid = await bcrypt.compare(password, user.password);

  //     if (!isPasswordValid) {
  //       return res.status(400).json({ message: 'Incorrect password!' });
  //     }

  //     // Create JWT token
  //   const payload = { username: user.username};
  //   const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });

  //     // Return success message and user data (don't send the password)
  //     return res.status(200).json({
  //       message: 'Login successful!',
  //       user: { username: user.username, email: user.email, token: token}  // Send only username and email
  //     });
  //   } catch (err) {
  //     return res.status(500).json({ message: 'Server error', error: err });
  //   }

  loginUserFunction(username, password, (message, status, user) => {
    // Return success message and user data
    return res.status(status).json({
      message: message,
      user: user
    });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

dataBaseConnect();
// mongoConnect((client) => {
//   //  console.log('database connected')
// });
