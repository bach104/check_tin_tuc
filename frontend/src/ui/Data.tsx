/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  ExternalLink,
  History,
  Search,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchAllNews, deleteNews, searchNews, clearSearchResults } from '../redux/db/verified_news.Slice';
import { NewsItem } from '../types/news.types';
import { getVerdictColor, getVerdictIcon, formatDate, truncateText } from '../utils/utils';

export default function Data() {
  const dispatch = useAppDispatch();
  const { items, searchResults, loading } = useAppSelector((state) => state.news);
  
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllNews());
  }, [dispatch]);

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      dispatch(clearSearchResults());
      return;
    }
    
    setIsSearching(true);
    await dispatch(searchNews(searchKeyword));
    setIsSearching(false);
  };

  const handleDelete = async (id: string) => {
    await dispatch(deleteNews(id));
    setShowDeleteConfirm(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const displayItems = searchKeyword.trim() ? searchResults : items;

  const renderVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'FALSE': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'MISLEADING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      default: return <HelpCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const renderVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return <span className="text-emerald-700 font-semibold">ĐÚNG SỰ THẬT</span>;
      case 'FALSE': return <span className="text-red-700 font-semibold">SAI SỰ THẬT</span>;
      case 'MISLEADING': return <span className="text-amber-700 font-semibold">GÂY HIỂU LẦM</span>;
      default: return <span className="text-slate-600 font-semibold">CHƯA XÁC MINH</span>;
    }
  };

  return (
    <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-6 h-6 text-indigo-500" />
              Cơ sở dữ liệu tin tức
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Danh sách các tin tức đã được kiểm chứng bởi AI
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => dispatch(fetchAllNews())}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="text-sm bg-slate-100 px-4 py-2 rounded-lg text-slate-600 flex items-center gap-2">
              <History className="w-4 h-4" />
              <span className="font-medium">{displayItems.length}</span> bản ghi
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang tìm...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Tìm kiếm</span>
                </>
              )}
            </button>
            {searchKeyword && (
              <button
                onClick={() => {
                  setSearchKeyword('');
                  dispatch(clearSearchResults());
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium rounded-lg transition-colors"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !displayItems.length && (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <div className="inline-block p-4 bg-indigo-50 rounded-full mb-4">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
            <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        )}

        {/* News List */}
        <AnimatePresence mode="popLayout">
          {!loading && displayItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {displayItems.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Delete Confirmation */}
                  <AnimatePresence>
                    {showDeleteConfirm === item._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-red-50 px-6 py-3 border-b border-red-100"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-red-700">
                            Bạn có chắc muốn xóa tin tức này?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                              Xóa
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1 border border-slate-200 hover:bg-white text-slate-600 text-sm font-medium rounded-lg transition-colors"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {renderVerdictIcon(item.verdict)}
                        {renderVerdictLabel(item.verdict)}
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${getVerdictColor(item.verdict)}`}>
                          {item.confidence}% tin cậy
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedItem(selectedItem?._id === item._id ? null : item)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {selectedItem?._id === item._id ? 'Thu gọn' : 'Xem chi tiết'}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(item._id)}
                          className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 text-sm mb-4">
                      {selectedItem?._id === item._id ? item.content : truncateText(item.content, 200)}
                    </p>

                    {/* Sources */}
                    {item.sources && item.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.sources.slice(0, 3).map((source, idx) => (
                          <a
                            key={idx}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-medium transition-colors group"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="truncate max-w-39">
                              {source.title.length > 30 ? source.title.substring(0, 30) + '...' : source.title}
                            </span>
                          </a>
                        ))}
                        {item.sources.length > 3 && (
                          <span className="text-xs text-slate-400 self-center">
                            +{item.sources.length - 3} nguồn khác
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-4 text-slate-400">
                        <span>ID: {item._id.substring(0, 8)}...</span>
                        <span>•</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                      {item.explanation && (
                        <div className="text-indigo-600 font-medium">
                          Xem phân tích
                        </div>
                      )}
                    </div>

                    {/* Explanation (expanded) */}
                    {selectedItem?._id === item._id && item.explanation && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-4 border-t border-slate-100"
                      >
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Phân tích chi tiết
                        </h4>
                        <p className="text-sm text-slate-600">{item.explanation}</p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300"
            >
              <Database className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {searchKeyword ? 'Không tìm thấy kết quả nào' : 'Chưa có dữ liệu nào được xác thực'}
              </p>
              {searchKeyword && (
                <button
                  onClick={() => {
                    setSearchKeyword('');
                    dispatch(clearSearchResults());
                  }}
                  className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium text-sm"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </main>
  );
}