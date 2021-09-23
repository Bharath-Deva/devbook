const express = require("express");
const authMiddleWare = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const bcrypt = require("bcryptjs");

const router = express.Router();

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/", authMiddleWare, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ errMessage: "server error" });
  }
});

// @route   POST api/auth
// @desc    authenticate user so that they can get the token
// @access  Public
router.post(
  "/",
  // express validator which is send as an middleware the second parameter in check is the error message
  [
    check("password", "password is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
  ],
  async (req, res) => {
    console.log("into post auth");
    //getting errors from express-validator to access the err mesgs we need to use errors.array()
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //post data
      const { email, password } = req.body;

      // checking user exist
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ msg: "Invalid user credentials" });
      }

      // checking the password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid user credentials" });
      }

      // creating the jwt token
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );

      // need to return json web tokens
    } catch (err) {
      console.error(err.message);
      res.status(500).json({});
    }
  }
);

module.exports = router;
