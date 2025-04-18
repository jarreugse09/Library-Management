    const express = require("express");
    const router = express.Router();
    const postController = require("../controllers/postControllers");
    const authMiddleware = require("../middlewares/authMiddleware");

    // All routes require user to be authenticated
    router.use(authMiddleware);

    // Create a post (only poster or admin)
    router.post("/", postController.createPost);

    // Get all posts
    router.get("/", postController.getAllPosts);

    // Get single post
    router.get("/:id", postController.getPostById);

    // Update post
    router.put("/:id", postController.updatePost);

    // Delete post
    router.delete("/:id", postController.deletePost);

    // Add comment
    router.post("/:id/comments", postController.addComment);

    // Delete comment
    router.delete("/:id/comments/:commentId", postController.deleteComment);

    // Like post
    router.post("/:id/like", postController.likePost);

    // Dislike post
    router.post("/:id/dislike", postController.dislikePost);

    module.exports = router;
    