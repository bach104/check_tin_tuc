/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Database, 
  Cpu
} from 'lucide-react';
import { motion } from 'motion/react';

export default function System() {
  return (
    <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-8"
      >
        <h2 className="text-2xl font-bold text-slate-900">Kiến trúc hệ thống</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Cpu className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">AI Engine</h3>
                  <p className="text-sm text-slate-500">Gemini 3 Flash</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sử dụng mô hình ngôn ngữ lớn tiên tiến nhất để phân tích ngữ nghĩa, đối chiếu thông tin và trích xuất bằng chứng từ các nguồn tin cậy trên internet.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100 rounded-xl">
                  <Database className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Data Storage</h3>
                  <p className="text-sm text-slate-500">SQLite (Better-SQLite3)</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                Hệ thống lưu trữ cục bộ hiệu năng cao, đảm bảo dữ liệu được xác thực luôn sẵn sàng để tra cứu và phân tích xu hướng.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-slate-300 font-mono text-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Cpu className="w-32 h-32" />
            </div>
            <h4 className="text-indigo-400 mb-4 font-bold tracking-widest uppercase">System Workflow</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-indigo-500">01</span>
                <p>User inputs news title & content via React Frontend.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-500">02</span>
                <p>Frontend calls Gemini API with Search Grounding enabled.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-500">03</span>
                <p>AI performs real-time web search & cross-references data.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-500">04</span>
                <p>Results are returned, parsed, and displayed to user.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-500">05</span>
                <p>Verified data is synced to SQLite database via Express API.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-indigo-500">06</span>
                <p>Statistics engine aggregates data for visual dashboards.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold mb-2">Bảo mật & Tin cậy</h3>
              <p className="text-indigo-100 max-w-xl">
                Hệ thống áp dụng các tiêu chuẩn xác thực nghiêm ngặt, kết hợp giữa sức mạnh của AI và các nguồn tin chính thống để đảm bảo tính khách quan cao nhất.
              </p>
            </div>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-12 h-12 rounded-full border-2 border-indigo-600 bg-indigo-400 flex items-center justify-center font-bold">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}