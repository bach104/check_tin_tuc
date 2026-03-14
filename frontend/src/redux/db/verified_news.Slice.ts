import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { newsApi } from './verified_news.Api';
import { NewsState, NewsItem, FactCheckRequest, StatsResponse } from '../../types/news.types';

const initialState: NewsState = {
  items: [],
  selectedItem: null,
  stats: null,
  loading: false,
  error: null,
  searchResults: [],
};

// Async thunks
export const fetchAllNews = createAsyncThunk(
  'news/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await newsApi.getAllNews();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch news');
    }
  }
);

export const fetchNewsById = createAsyncThunk(
  'news/fetchById',
  async (id: string, { rejectWithValue }) => {
    try {
      return await newsApi.getNewsById(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch news');
    }
  }
);

export const checkNewsWithAI = createAsyncThunk(
  'news/checkWithAI',
  async (data: FactCheckRequest, { rejectWithValue }) => {
    try {
      return await newsApi.checkNews(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check news');
    }
  }
);

export const createNews = createAsyncThunk(
  'news/create',
  async (data: Partial<NewsItem>, { rejectWithValue }) => {
    try {
      return await newsApi.createNews(data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create news');
    }
  }
);

export const updateNews = createAsyncThunk(
  'news/update',
  async ({ id, data }: { id: string; data: Partial<NewsItem> }, { rejectWithValue }) => {
    try {
      return await newsApi.updateNews(id, data);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update news');
    }
  }
);

export const deleteNews = createAsyncThunk(
  'news/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      return await newsApi.deleteNews(id);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete news');
    }
  }
);

export const fetchStats = createAsyncThunk(
  'news/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await newsApi.getStats();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch stats');
    }
  }
);

export const searchNews = createAsyncThunk(
  'news/search',
  async (keyword: string, { rejectWithValue }) => {
    try {
      return await newsApi.searchNews(keyword);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search news');
    }
  }
);

const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedItem: (state) => {
      state.selectedItem = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all news
      .addCase(fetchAllNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllNews.fulfilled, (state, action: PayloadAction<NewsItem[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAllNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch news by id
      .addCase(fetchNewsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewsById.fulfilled, (state, action: PayloadAction<NewsItem>) => {
        state.loading = false;
        state.selectedItem = action.payload;
      })
      .addCase(fetchNewsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Check news with AI
      .addCase(checkNewsWithAI.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkNewsWithAI.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(checkNewsWithAI.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create news
      .addCase(createNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNews.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update news
      .addCase(updateNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateNews.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete news
      .addCase(deleteNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteNews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload.id);
      })
      .addCase(deleteNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch stats
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action: PayloadAction<StatsResponse>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Search news
      .addCase(searchNews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchNews.fulfilled, (state, action: PayloadAction<NewsItem[]>) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedItem, clearSearchResults } = newsSlice.actions;
export default newsSlice.reducer;