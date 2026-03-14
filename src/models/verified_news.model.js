import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  }
}, { _id: false });
const verifiedNewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  verdict: {
    type: String,
    required: true,
    enum: ["TRUE", "FALSE", "MISLEADING", "UNVERIFIED"]
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  explanation: {
    type: String,
    default: ""
  },
  sources: {
    type: [sourceSchema],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
verifiedNewsSchema.index({ createdAt: -1 });
verifiedNewsSchema.index({ verdict: 1 });
verifiedNewsSchema.index({ title: "text", content: "text" });

const VerifiedNews = mongoose.model("VerifiedNews", verifiedNewsSchema);

export default VerifiedNews;