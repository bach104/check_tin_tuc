import { getApiUrl } from '../../utils/utils';
import { NewsItem, FactCheckRequest, FactCheckResponse, StatsResponse } from '../../types/news.types';

class VerifiedNewsApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiUrl('/news');
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      // Create error with status for better handling
      const error: any = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    
    return await response.json() as T;
  }

  // GET /api/news - Get all news
  async getAllNews(): Promise<NewsItem[]> {
    try {
      const response = await fetch(this.baseUrl);
      return this.handleResponse<NewsItem[]>(response);
    } catch (error) {
      console.error('Error fetching all news:', error);
      throw error;
    }
  }

  // GET /api/news/:id - Get single news by ID
  async getNewsById(id: string): Promise<NewsItem> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      return this.handleResponse<NewsItem>(response);
    } catch (error) {
      console.error(`Error fetching news with id ${id}:`, error);
      throw error;
    }
  }

  // POST /api/news/check - Check news with AI
  async checkNews(data: FactCheckRequest): Promise<FactCheckResponse> {
    try {
      console.log('Sending check news request:', data);
      
      const response = await fetch(`${this.baseUrl}/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<FactCheckResponse>(response);
    } catch (error) {
      console.error('Error checking news:', error);
      throw error;
    }
  }

  // POST /api/news - Create news manually
  async createNews(data: Partial<NewsItem>): Promise<{ id: string; news: NewsItem; message: string }> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<{ id: string; news: NewsItem; message: string }>(response);
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  // PUT /api/news/:id - Update news
  async updateNews(id: string, data: Partial<NewsItem>): Promise<{ message: string; news: NewsItem }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      return this.handleResponse<{ message: string; news: NewsItem }>(response);
    } catch (error) {
      console.error(`Error updating news with id ${id}:`, error);
      throw error;
    }
  }

  // DELETE /api/news/:id - Delete news
  async deleteNews(id: string): Promise<{ message: string; id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      return this.handleResponse<{ message: string; id: string }>(response);
    } catch (error) {
      console.error(`Error deleting news with id ${id}:`, error);
      throw error;
    }
  }

  // GET /api/news/stats/all - Get statistics
  async getStats(): Promise<StatsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/stats/all`);
      return this.handleResponse<StatsResponse>(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  // GET /api/news/search/:keyword - Search news
  async searchNews(keyword: string): Promise<NewsItem[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search/${encodeURIComponent(keyword)}`);
      return this.handleResponse<NewsItem[]>(response);
    } catch (error) {
      console.error(`Error searching news with keyword "${keyword}":`, error);
      throw error;
    }
  }
}

export const newsApi = new VerifiedNewsApi();