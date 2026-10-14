require("dotenv").config();

const authRoutes = require("./routes/auth");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const documentRoutes = require("./routes/documents");
const cloudinary = require("./config/cloudinary");
const folderRoutes = require("./routes/folders");
const multer = require("multer");

const connectDB = require("./config/db");

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors());

// Parse JSON requests
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

//Folders
app.use("/api/folders", folderRoutes);

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Scanner Vault API is running HELLO🚀"
    });
});

app.get("/api/cloudinary-test", async (req, res) => {
    try {
        const result = await cloudinary.api.ping();

        res.json({
            message: "Cloudinary connected successfully!",
            status: result.status
        });
    } catch (error) {
        console.error("Cloudinary connection error:", error.message);

        res.status(500).json({
            message: "Cloudinary connection failed."
        });
    }
});


app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                message: "File too large. Maximum size is 10 MB."
            });
        }

        if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
                message: "Only one file can be uploaded at a time."
            });
        }

        return res.status(400).json({
            message: "File upload rejected."
        });
    }

    if (err.message ===
        "Only JPG, PNG, WEBP, and PDF files are allowed.") {
        return res.status(400).json({
            message: err.message
        });
    }

    console.error("Unhandled server error:", err.message);

    return res.status(500).json({
        message: "An unexpected server error occurred."
    });
});


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});