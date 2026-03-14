/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { checkNewsWithAI } from '../redux/db/verified_news.Slice';
import { FactCheckResponse } from '../types/news.types';
import { geminiService } from '../services/geminiService';

export default function Home() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.news);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FactCheckResponse | null>(null);

  const handleCheck = async () => {
    if (!title || !content) return;
    
    setIsChecking(true);
    setResult(null);
    
    try {
      // Sử dụng geminiService để kiểm tra tin tức
      const res = await geminiService.factCheck(title, content);
      setResult(res);
      
      // Tự động lưu vào database thông qua Redux
      await dispatch(checkNewsWithAI({ title, content })).unwrap();
      
    } catch (error) {
      console.error('Lỗi khi kiểm tra tin tức:', error);
      // Có thể thêm toast notification ở đây
    } finally {
      setIsChecking(false);
    }
  };

  const renderVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'FALSE': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'MISLEADING': return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      default: return <HelpCircle className="w-6 h-6 text-slate-400" />;
    }
  };

  const renderVerdictLabel = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return (
        <div>
          <span className="text-emerald-700 font-bold text-xl">ĐÚNG SỰ THẬT</span>
          <p className="text-emerald-600 text-sm mt-1">Thông tin này đã được xác minh và chính xác</p>
        </div>
      );
      case 'FALSE': return (
        <div>
          <span className="text-red-700 font-bold text-xl">SAI SỰ THẬT</span>
          <p className="text-red-600 text-sm mt-1">Thông tin này không chính xác hoặc bịa đặt</p>
        </div>
      );
      case 'MISLEADING': return (
        <div>
          <span className="text-amber-700 font-bold text-xl">GÂY HIỂU LẦM</span>
          <p className="text-amber-600 text-sm mt-1">Thông tin có thể bị bóp méo hoặc thiếu ngữ cảnh</p>
        </div>
      );
      default: return (
        <div>
          <span className="text-slate-700 font-bold text-xl">CHƯA XÁC MINH</span>
          <p className="text-slate-600 text-sm mt-1">Không đủ dữ liệu để đưa ra kết luận</p>
        </div>
      );
    }
  };

  const getVerdictBackground = (verdict: string) => {
    switch (verdict) {
      case 'TRUE': return 'bg-emerald-50 border-emerald-100';
      case 'FALSE': return 'bg-red-50 border-red-100';
      case 'MISLEADING': return 'bg-amber-50 border-amber-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  return (
    <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
          >
            AI FACT CHECKER
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-slate-600 max-w-2xl mx-auto"
          >
            Nhập tin tức cần kiểm tra, AI sẽ phân tích và đưa ra kết luận chính xác
          </motion.p>
        </div>

        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Search className="w-6 h-6 text-indigo-500" />
            Kiểm tra tin tức
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tiêu đề bài báo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Phát hiện sinh vật lạ ở sa mạc Sahara..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50 hover:bg-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nội dung bài báo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="Dán nội dung bài báo vào đây để kiểm tra..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-slate-50 hover:bg-white resize-none"
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{content.length} ký tự</span>
              <span className={`${title && content ? 'text-green-600' : 'text-slate-400'}`}>
                {title && content ? '✓ Sẵn sàng kiểm tra' : '⏳ Nhập đầy đủ thông tin'}
              </span>
            </div>

            <button
              onClick={handleCheck}
              disabled={isChecking || !title.trim() || !content.trim()}
              className="w-full bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-300 disabled:to-indigo-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:shadow-none"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI đang phân tích...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Kiểm tra ngay với AI</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isChecking && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center"
          >
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Đang phân tích tin tức</h3>
            <p className="text-slate-600">
              AI đang tra cứu và đối chiếu với các nguồn tin đáng tin cậy...
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}

        {/* Result Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden"
          >
            {/* Verdict Header */}
            <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${getVerdictBackground(result.verdict)}`}>
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {renderVerdictIcon(result.verdict)}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    KẾT LUẬN TỪ AI
                  </p>
                  {renderVerdictLabel(result.verdict)}
                </div>
              </div>
              
              <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:pl-6">
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    ĐỘ TIN CẬY
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${result.confidence}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full ${
                          result.confidence >= 80 ? 'bg-emerald-500' :
                          result.confidence >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">{result.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                  PHÂN TÍCH CHI TIẾT
                </h3>
                <div className="prose prose-slate max-w-none">
                  <ReactMarkdown>{result.explanation}</ReactMarkdown>
                </div>
              </div>

              {/* Sources */}
              {result.sources && result.sources.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                    NGUỒN THAM KHẢO ({result.sources.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.sources.map((source, idx) => (
                      <motion.a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all group"
                      >
                        <span className="text-sm font-medium text-slate-700 truncate mr-2">
                          {source.title}
                        </span>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
                <span>ID: {result.id}</span>
                <span>Được kiểm tra bởi Gemini AI</span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}