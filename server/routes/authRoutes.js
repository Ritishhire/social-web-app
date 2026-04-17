const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

router.post("/register",  async (req, res) => {
  try {
    let { name, email, password } = req.body;

    // Empty field check
    if (!name || !email || !password) {
      return res.status(400).json("All fields are required");
    }
    
    email = email.toLowerCase();

    // Password length check
    if (password.length < 6) {
      return res.status(400).json("Password must be at least 6 characters");
    }

    // Duplicate email check
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json("Email already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json("User registered successfully");

  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
       return res.status(400).json("Email and password required");
    }
    
    const email = req.body.email.toLowerCase();
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("User not found");
    }

    const validPass = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPass) {
      return res.status(400).json("Wrong password");
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      user
    });

  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;