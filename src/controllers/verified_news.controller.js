import VerifiedNews from "../models/verified_news.model.js";
import { factCheckNews } from "../services/geminiService.js";

/**
 * @desc    Get all verified news
 * @route   GET /api/news
 * @access  Public
 */

export const getAllNews = async (req, res) => {
  try {
    const news = await VerifiedNews.find()
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json(news);
    console.log(`📊 Fetched all news, total count: ${news.length}`);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ 
      message: "Error fetching news", 
      error: error.message 
    });
  }
};

/**
 * @desc    Get single news by ID
 * @route   GET /api/news/:id
 * @access  Public
 */

export const getNewsById = async (req, res) => {
  try {
    const news = await VerifiedNews.findById(req.params.id).lean();
    
    if (!news) {
      return res.status(404).json({ message: "News not found" });
    }
    res.status(200).json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ 
      message: "Error fetching news", 
      error: error.message 
    });
  }
};

/**
 * @desc    Check news with Gemini AI
 * @route   POST /api/news/check
 * @access  Public
 * @body    {title: string, content: string}
 */
export const checkNews = async (req, res) => {
  try {
    console.log("\n📝 Received fact-check request");
    
    const { title, content } = req.body;

    // Validate input
    if (!title || !content) {
      console.log("❌ Missing title or content");
      return res.status(400).json({
        message: "Missing required fields: title and content"
      });
    }

    console.log("🤖 Processing with Gemini AI...");

    // Call Gemini API
    const factCheckResult = await factCheckNews(title, content);

    // Save to database
    const newsData = {
      title,
      content,
      verdict: factCheckResult.verdict,
      confidence: factCheckResult.confidence,
      explanation: factCheckResult.explanation || "",
      sources: factCheckResult.sources || []
    };

    const news = new VerifiedNews(newsData);
    const savedNews = await news.save();

    console.log("✅ News saved to database");

    res.status(201).json({
      message: "News checked and saved successfully",
      id: savedNews._id,
      ...factCheckResult
    });

  } catch (error) {
    console.error("🔥 Error checking news:", error);

    res.status(500).json({
      message: "Error checking news",
      error: error.message
    });
  }
};

/**
 * @desc    Create new verified news (manual entry)
 * @route   POST /api/news
 * @access  Public
 */
export const createNews = async (req, res) => {
  try {
    console.log("📥 Request body:", req.body);

    const { title, content, verdict, confidence, sources, explanation } = req.body;

    if (!title || !content || !verdict || confidence === undefined) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        message: "Missing required fields: title, content, verdict, confidence"
      });
    }

    // Parse sources if it's a string (from frontend)
    let parsedSources = sources;

    if (typeof sources === "string") {
      try {
        parsedSources = JSON.parse(sources);
        console.log("📦 Parsed sources:", parsedSources);
      } catch (e) {
        console.log("⚠️ Sources parse error:", e.message);
        parsedSources = [];
      }
    }

    const newsData = {
      title,
      content,
      verdict,
      confidence,
      explanation: explanation || "",
      sources: parsedSources || []
    };

    console.log("📝 Creating news with data:", newsData);

    const news = new VerifiedNews(newsData);
    const savedNews = await news.save();

    console.log("✅ News saved successfully:", savedNews);

    res.status(201).json({
      message: "News created successfully",
      id: savedNews._id,
      news: savedNews
    });

  } catch (error) {
    console.error("🔥 Error creating news:", error);

    res.status(500).json({
      message: "Error creating news",
      error: error.message
    });
  }
};

/**
 * @desc    Update verified news
 * @route   PUT /api/news/:id
 * @access  Public
 */
export const updateNews = async (req, res) => {
  try {
    const { title, content, verdict, confidence, sources, explanation } = req.body;
    
    // Parse sources if it's a string
    let parsedSources = sources;
    if (typeof sources === 'string') {
      try {
        parsedSources = JSON.parse(sources);
      } catch (e) {
        parsedSources = [];
      }
    }

    const updatedNews = await VerifiedNews.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        verdict,
        confidence,
        explanation: explanation || "",
        sources: parsedSources || []
      },
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({
      message: "News updated successfully",
      news: updatedNews
    });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ 
      message: "Error updating news", 
      error: error.message 
    });
  }
};

/**
 * @desc    Delete verified news
 * @route   DELETE /api/news/:id
 * @access  Public
 */
export const deleteNews = async (req, res) => {
  try {
    const deletedNews = await VerifiedNews.findByIdAndDelete(req.params.id);

    if (!deletedNews) {
      return res.status(404).json({ message: "News not found" });
    }

    res.status(200).json({ 
      message: "News deleted successfully",
      id: req.params.id 
    });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ 
      message: "Error deleting news", 
      error: error.message 
    });
  }
};

/**
 * @desc    Get statistics
 * @route   GET /api/news/stats/all
 * @access  Public
 */
export const getStats = async (req, res) => {
  try {
    // Get total count
    const total = await VerifiedNews.countDocuments();

    // Get verdict distribution
    const verdicts = await VerifiedNews.aggregate([
      {
        $group: {
          _id: "$verdict",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          verdict: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get last 7 days history
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const history = await VerifiedNews.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id": 1 }
      },
      {
        $project: {
          date: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      total,
      verdicts,
      history
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ 
      message: "Error fetching statistics", 
      error: error.message 
    });
  }
};

/**
 * @desc    Search news by keyword
 * @route   GET /api/news/search/:keyword
 * @access  Public
 */
export const searchNews = async (req, res) => {
  try {
    const keyword = req.params.keyword;
    
    const news = await VerifiedNews.find({
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { content: { $regex: keyword, $options: "i" } }
      ]
    })
    .sort({ createdAt: -1 })
    .lean();
    res.status(200).json(news);
    console.log(`🔍 Search completed for keyword: "${keyword}", found ${news.length} results.`);
    console.log("📊 Search results:", news.map(n => ({ id: n._id, title: n.title, content: n.content , verdict: n.verdict, confidence: n.confidence })));
  } catch (error) {
    console.error("Error searching news:", error);
    res.status(500).json({ 
      message: "Error searching news", 
      error: error.message 
    });
  }
};