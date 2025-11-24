const express = require("express");
const multer = require("multer");
const Post = require("../models/Post.js");
const { auth } = require("../middleware/auth.js");

const router = express.Router();

// test
router.use((req, res, next) => {
  next();
});

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// CREATE POST (text + image)
router.post("/create", auth, upload.single("image"), async (req, res) => {
  try {
    const post = new Post({
      user: req.user.id,
      text: req.body.text,
      image: req.file ? `/uploads/${req.file.filename}` : null,
      comments: [],
    });

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// CREATE POST
router.post("/", auth, async (req, res) => {
  try {
    const { text, image, isPublic } = req.body;

    const post = await Post.create({
      author: req.user.id,
      text,
      image,
      isPublic,
    });

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// GET POSTS
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [{ isPublic: true }, { author: req.user.id }],
    })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// LIKE / UNLIKE
router.post("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(req.user.id);

    if (liked) post.likes.pull(req.user.id);
    else post.likes.push(req.user.id);

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// COMMENT
router.post("/comment/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      user: req.user.id,
      text: req.body.text,
      likes: [],
      replies: [],
    });

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// REPLY TO COMMENT
router.post("/reply/:postId/:commentId", auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({
      user: req.user.id,
      text,
      likes: [],
    });

    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
