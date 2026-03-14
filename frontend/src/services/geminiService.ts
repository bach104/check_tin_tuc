import { FactCheckRequest, FactCheckResponse } from '../types/news.types';
import { newsApi } from '../redux/db/verified_news.Api';

class GeminiService {
  private maxRetries = 3;
  private retryDelay = 1000; 

  /**
   * Kiểm tra tin tức với Gemini AI
   * @param title Tiêu đề tin tức
   * @param content Nội dung tin tức
   * @returns Kết quả kiểm chứng
   */
  async factCheck(title: string, content: string): Promise<FactCheckResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        // Validate input
        if (!title.trim() || !content.trim()) {
          throw new Error('Tiêu đề và nội dung không được để trống');
        }

        // Gọi API kiểm chứng
        const result = await newsApi.checkNews({ title, content });
        return result;
        
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a quota error (429)
        if (error.message?.includes('429') || error.status === 429) {
          console.warn(`Gemini API quota exceeded (attempt ${attempt}/${this.maxRetries})`);
          
          if (attempt < this.maxRetries) {
            // Wait before retrying
            await this.delay(this.retryDelay * attempt);
            continue;
          }
        } else {
          // Non-quota error, break the loop
          break;
        }
      }
    }

    console.error('Gemini service error:', lastError);
    throw new Error(lastError?.message || 'Có lỗi xảy ra khi kiểm chứng tin tức');
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Format kết quả kiểm chứng thành text dễ đọc
   */
  formatFactCheckResult(result: FactCheckResponse): string {
    const verdictColors = {
      TRUE: '✅',
      FALSE: '❌',
      MISLEADING: '⚠️',
      UNVERIFIED: '❓'
    };

    const emoji = verdictColors[result.verdict] || '📄';
    
    let formatted = `${emoji} **KẾT QUẢ KIỂM CHỨNG**\n\n`;
    formatted += `**Phán quyết:** ${result.verdict}\n`;
    formatted += `**Độ tin cậy:** ${result.confidence}%\n\n`;
    formatted += `**Giải thích:**\n${result.explanation}\n\n`;

    if (result.sources && result.sources.length > 0) {
      formatted += `**Nguồn tham khảo:**\n`;
      result.sources.forEach((source, index) => {
        formatted += `${index + 1}. [${source.title}](${source.url})\n`;
      });
    }

    return formatted;
  }
}

export const geminiService = new GeminiService();