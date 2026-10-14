
const Tesseract = require("tesseract.js");
const pdfParse = require("pdf-parse");

async function extractText(buffer, mimeType) {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
        throw new Error("A valid document buffer is required.");
    }

    // First, extract selectable text from PDFs.
    if (mimeType === "application/pdf") {
        const pdfData = await pdfParse(buffer);
        const pdfText = pdfData.text?.trim() || "";

        if (pdfText.length > 0) {
            return {
                text: pdfText,
                method: "pdf-text"
            };
        }

        throw new Error(
            "This PDF contains no extractable text. OCR for scanned PDFs will be added next."
        );
    }

    // Recognize text in supported images.
    const allowedImages = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedImages.includes(mimeType)) {
        throw new Error("This file type is not supported for OCR.");
    }

    const worker = await Tesseract.createWorker("eng");

    try {
        const result = await worker.recognize(buffer);

        return {
            text: result.data.text.trim(),
            method: "tesseract-ocr"
        };
    } finally {
        await worker.terminate();
    }
}

module.exports = { extractText };
