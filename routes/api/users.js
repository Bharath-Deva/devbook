const express = require("express");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const config = require("config");
const router = express.Router();
const User = require("../../models/User");

// @route   POST api/users
// @desc    Test route
// @access  Public
router.post(
  "/",
  // express validator which is send as an middleware the second parameter in check is the error message
  [
    check("name", "Name is rquired").not().isEmpty(),
    check("password", "password length should be greater than 6").isLength({
      min: 6,
    }),
    check("email", "Please include a valid email").isEmail(),
  ],
  async (req, res) => {
    //getting errors from express-validator to access the err mesgs we need to use errors.array()
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //post data
      const { name, email, password } = req.body;

      // checking user exist
      let user = await User.findOne({ email: email });
      if (user) {
        return res.status(400).json({ msg: "User alredy exists" });
      }

      // getting users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // creating user
      user = new User({
        name,
        email,
        password,
      });

      // hashing password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

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
