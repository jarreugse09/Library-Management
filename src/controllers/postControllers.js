const Post = require("../models/postModel");

const multer = require('multer');

// Setup multer storage options
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Store images in a folder called 'uploads'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique name for each file
    }
});

// Initialize multer with the storage settings
const upload = multer({ storage: storage });

exports.createPost = async (req, res) => {
    try {
        console.log(req.body);
        const { title, description, image } = req.body;
        const { id, username } = req.user;

        
        
        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        const newPost = await Post.create({
            title,
            description,
            image,
            username,
            user: id
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        const { title, description, image } = req.body;
        post.title = title || post.title;
        post.description = description || post.description;
        post.image = image || post.image;

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.user.toString() !== req.user.id && req.user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        await post.deleteOne();
        res.json({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ error: "Post not found" });

        post.comments.push({ username: req.user.username, text });
        await post.save();

        res.status(201).json(post.comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const commentIndex = post.comments.findIndex(
            (c) => c._id.toString() === req.params.commentId
        );

        if (commentIndex === -1) {
            return res.status(404).json({ error: "Comment not found" });
        }

        const comment = post.comments[commentIndex];
        if (comment.username !== req.user.username && req.user.role !== "admin") {
            return res.status(403).json({ error: "Unauthorized" });
        }

        post.comments.splice(commentIndex, 1);
        await post.save();

        res.json(post.comments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user.id;
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes.pull(userId);
        } else {
            post.likes.push(userId);
            post.dislikes.pull(userId);
        }

        await post.save();
        res.json({ likes: post.likes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.dislikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const userId = req.user.id;
        const alreadyDisliked = post.dislikes.includes(userId);

        if (alreadyDisliked) {
            post.dislikes.pull(userId);
        } else {
            post.dislikes.push(userId);
            post.likes.pull(userId);
        }

        await post.save();
        res.json({ dislikes: post.dislikes.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
