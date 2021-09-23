const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connect = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
    });
    console.log("monogDB connected");
  } catch (err) {
    console.error(err.message);
    // process exit
    process.exit(1);
  }
};

module.exports = connect;
