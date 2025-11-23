require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// routes
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");

// app
const app = express();

// middlewares
app.use(express.json());
const corsOptions = {
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// routes

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// root
app.get("/", (req, res) => {
  res.json({ message: "API running" });
});

app.get("/test-token", (req, res) => {
  res.json({ headers: req.headers });
});

// connect DB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 4000, () =>
      console.log(`Server running on port: ${process.env.PORT || 4000}`)
    );
  })
  .catch((err) => console.log(err));
