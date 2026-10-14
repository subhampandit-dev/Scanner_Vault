
const express = require("express");
const authMiddleware = require("../middleware/auth");
const Folder = require("../models/Folder");

const router = express.Router();

// Create a folder
router.post("/", authMiddleware, async (req, res) => {
    try {
        const name = req.body.name?.trim();

        if (!name) {
            return res.status(400).json({
                message: "Folder name is required."
            });
        }

        if (name.length > 50) {
            return res.status(400).json({
                message: "Folder name cannot exceed 50 characters."
            });
        }

        const folder = await Folder.create({
            userId: req.user.id,
            name,
            isPrivate: Boolean(req.body.isPrivate)
        });

        res.status(201).json({
            message: "Folder created successfully.",
            folder
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "A folder with this name already exists."
            });
        }

        console.error("Create folder error:", error.message);

        res.status(500).json({
            message: "Failed to create folder."
        });
    }
});

// List the logged-in user's folders
router.get("/", authMiddleware, async (req, res) => {
    try {
        const folders = await Folder.find({
            userId: req.user.id
        }).sort({ name: 1 });

        res.json({
            count: folders.length,
            folders
        });
    } catch (error) {
        console.error("Fetch folders error:", error.message);

        res.status(500).json({
            message: "Failed to fetch folders."
        });
    }
});

module.exports = router;
