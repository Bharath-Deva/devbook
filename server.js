const express = require("express");
const connectDB = require("./config/db");

const auth = require("./routes/api/auth");
const posts = require("./routes/api/posts");
const profile = require("./routes/api/profile");
const users = require("./routes/api/users");

const app = express();

// DATABASE
connectDB();

const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json({ extended: false }));

app.get("/", (req, res) => {
  res.send("API running");
});

// routes
app.use("/api/auth", auth);
app.use("/api/posts", posts);
app.use("/api/profile", profile);
app.use("/api/users", users);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
