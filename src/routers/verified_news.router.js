import express from "express";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getStats,
  searchNews,
  checkNews
} from "../controllers/verified_news.controller.js";

const router = express.Router();

router.get("/", getAllNews);
router.get("/stats/all", getStats);
router.get("/search/:keyword", searchNews);
router.get("/:id", getNewsById);

router.post("/check", checkNews); 
router.post("/", createNews);

router.put("/:id", updateNews);

router.delete("/:id", deleteNews);

export default router;