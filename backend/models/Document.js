const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        folderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Folder",
            default: null
        },

        originalName: {
            type: String,
            required: true,
            trim: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        cloudinaryPublicId: {
            type: String,
            default: null
        },

        mimeType: {
            type: String,
            required: true
        },

        size: {
            type: Number,
            default: 0
        },

        type: {
            type: String,
            enum: [
                "ID",
                "Invoice",
                "Certificate",
                "Receipt",
                "Note",
                "Other"
            ],
            default: "Other"
        },

        // Encrypted OCR text will be stored here
        extractedText: {
            type: String,
            default: ""
        },

        // Extracted document fields
        fields: {
            name: { type: String, default: "" },
            vendor: { type: String, default: "" },
            amount: { type: Number, default: null },
            date: { type: String, default: "" },
            idNumber: { type: String, default: "" },
            invoiceNumber: { type: String, default: "" }
        },

        summary: {
            type: String,
            default: ""
        },

        // Non-sensitive keywords for searching
        searchText: {
            type: String,
            default: "",
            index: true
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        },

        deletedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Document", documentSchema);