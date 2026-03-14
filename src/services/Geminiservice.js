import { GoogleGenAI } from "@google/genai";

/**
 * @typedef {Object} FactCheckResult
 * @property {"TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED"} verdict
 * @property {string} explanation
 * @property {number} confidence
 * @property {{title: string, url: string}[]} sources
 */

/**
 * Kiểm chứng tin tức bằng Google Gemini API
 * @param {string} title - Tiêu đề bài báo
 * @param {string} content - Nội dung bài báo
 * @returns {Promise<FactCheckResult>} Kết quả kiểm chứng
 */
export async function factCheckNews(title, content) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please set it in your .env file.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Bạn là một chuyên gia kiểm chứng sự thật (fact-checker) chuyên nghiệp.
Nhiệm vụ: Kiểm tra tính xác thực của thông tin dưới đây bằng cách sử dụng công cụ tìm kiếm thời gian thực.

Tiêu đề: ${title}
Nội dung: ${content}

QUY TẮC BẮT BUỘC:
1. TRA CỨU THỜI GIAN THỰC: Bạn PHẢI sử dụng công cụ tìm kiếm để tìm các bài báo, thông cáo báo chí hoặc dữ liệu chính thống mới nhất.
2. ĐỐI CHIẾU NGUỒN TIN: 
   - Nếu kết luận là ĐÚNG (TRUE): Các nguồn tin phải xác nhận thông tin này là thật.
   - Nếu kết luận là SAI (FALSE): Các nguồn tin phải là bài đính chính, bác bỏ hoặc cung cấp bằng chứng ngược lại.
   - Nếu kết luận là GÂY HIỂU LẦM (MISLEADING): Chỉ ra phần nào đúng, phần nào bị bóp méo.
3. CHỈ TRÍCH DẪN LINK THẬT: Các đường link trong phần "sources" phải là link thực tế bạn tìm thấy qua công cụ tìm kiếm. KHÔNG ĐƯỢC tự tạo link hoặc dùng link giả định.
4. GIẢI THÍCH CHI TIẾT: Trong phần "explanation", hãy nêu rõ nguồn nào (tên báo, tổ chức) đã nói gì về thông tin này.

Cấu trúc JSON phản hồi:
{
  "verdict": "TRUE" | "FALSE" | "MISLEADING" | "UNVERIFIED",
  "explanation": "Giải thích chi tiết bằng tiếng Việt, có trích dẫn cụ thể từ các nguồn tìm được.",
  "confidence": số từ 0-100,
  "sources": [
    {
      "title": "Tiêu đề bài báo",
      "url": "URL chính xác"
    }
  ]
}`;

  try {
    console.log("📝 Gửi yêu cầu kiểm chứng tới Gemini API...");
    console.log(`📰 Tiêu đề: ${title}`);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }]
      },
    });

    const text = response.text || "{}";
    let result;

    try {
      result = JSON.parse(text);
      console.log("✅ Phân tích hoàn tất!");
    } catch (e) {
      console.error("❌ JSON Parse Error:", text);
      throw new Error("AI returned invalid JSON format.");
    }
    
    // Extract verified grounding URLs from Google Search metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const verifiedSearchSources = groundingChunks
      ?.filter(chunk => chunk.web && chunk.web.uri)
      .map(chunk => ({
        title: chunk.web?.title || "Nguồn tin xác thực",
        url: chunk.web?.uri || ""
      })) || [];

    // Combine sources, prioritizing verified search results
    let finalSources = [...verifiedSearchSources];

    if (result.sources && Array.isArray(result.sources)) {
      result.sources.forEach(s => {
        // Add AI-suggested sources if they look valid and aren't duplicates
        if (s.url && s.url.startsWith('http') && !finalSources.some(fs => fs.url === s.url)) {
          finalSources.push(s);
        }
      });
    }

    result.sources = finalSources.filter(s => s.url && s.url.includes('.') && s.url.length > 12);

    console.log(`📊 Verdict: ${result.verdict}`);
    console.log(`💯 Confidence: ${result.confidence}%`);
    console.log(`🔗 Sources found: ${result.sources.length}`);

    return result;
  } catch (error) {
    console.error("🔥 Fact check error:", error);
    throw error;
  }
}