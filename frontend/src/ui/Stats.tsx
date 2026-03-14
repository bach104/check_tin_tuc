/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Award,
  Zap,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  TooltipProps
} from 'recharts';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { fetchStats } from '../redux/db/verified_news.Slice';
import { VerdictCount, HistoryItem } from '../types/news.types';

// Define types for chart data
interface VerdictStat {
  name: string;
  value: number;
  verdict: string;
}

interface TrendData {
  date: string;
  count: number;
}

// Define custom payload type
interface CustomPayload {
  name: string;
  value: number;
  payload?: {
    name?: string;
    verdict?: string;
    [key: string]: any;
  };
}

const COLORS = {
  TRUE: '#10b981',
  FALSE: '#ef4444',
  MISLEADING: '#f59e0b',
  UNVERIFIED: '#94a3b8'
};

const RADIAN = Math.PI / 180;

// Custom label for pie chart
const renderCustomizedLabel = ({ 
  cx, 
  cy, 
  midAngle, 
  innerRadius, 
  outerRadius, 
  percent 
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// Custom tooltip for pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
        <p className="text-sm font-medium text-slate-900">{data.name}</p>
        <p className="text-sm text-slate-600">{data.value} tin tức</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for line chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100">
        <p className="text-sm font-medium text-slate-900">Ngày: {label}</p>
        <p className="text-sm text-indigo-600">{payload[0].value} tin tức</p>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const dispatch = useAppDispatch();
  const { stats, loading } = useAppSelector((state) => state.news);
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | 'all'>('7days');

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  const getVerdictLabel = (verdict: string): string => {
    switch (verdict) {
      case 'TRUE': return 'Đúng sự thật';
      case 'FALSE': return 'Sai sự thật';
      case 'MISLEADING': return 'Gây hiểu lầm';
      default: return 'Chưa xác minh';
    }
  };

  const calculateAccuracy = (): string => {
    if (!stats?.verdicts) return '0';
    const total = stats.verdicts.reduce((acc: number, v: VerdictCount) => acc + v.count, 0);
    const correct = stats.verdicts.find((v: VerdictCount) => v.verdict === 'TRUE')?.count || 0;
    return total > 0 ? ((correct / total) * 100).toFixed(1) : '0';
  };

  const getTrendData = (): TrendData[] => {
    if (!stats?.history) return [];
    
    // Filter based on time range
    let data = [...stats.history];
    if (timeRange === '7days') {
      data = data.slice(-7);
    } else if (timeRange === '30days') {
      data = data.slice(-30);
    }
    
    // Format dates
    return data.map((item: HistoryItem) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit' 
      })
    }));
  };

  const getVerdictStats = (): VerdictStat[] => {
    if (!stats?.verdicts) return [];
    return stats.verdicts.map((v: VerdictCount) => ({
      name: getVerdictLabel(v.verdict),
      value: v.count,
      verdict: v.verdict
    }));
  };

  return (
    <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Thống kê & Phân tích
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Tổng quan về hoạt động kiểm chứng tin tức
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <Shield className="w-8 h-8 opacity-80" />
              <span className="text-xs font-medium uppercase tracking-wider opacity-80">Tổng quan</span>
            </div>
            <p className="text-4xl font-bold mb-1">{stats?.total || 0}</p>
            <p className="text-sm opacity-90">Tin tức đã kiểm chứng</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">Độ chính xác</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{calculateAccuracy()}%</p>
            <p className="text-sm text-slate-500">Tỉ lệ tin chính xác</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Zap className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">Tin sai</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.verdicts?.find((v: VerdictCount) => v.verdict === 'FALSE')?.count || 0}
            </p>
            <p className="text-sm text-slate-500">Tin tức sai sự thật</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-xs font-medium text-slate-400">Gây hiểu lầm</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">
              {stats?.verdicts?.find((v: VerdictCount) => v.verdict === 'MISLEADING')?.count || 0}
            </p>
            <p className="text-sm text-slate-500">Tin tức gây hiểu lầm</p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Xu hướng kiểm tra
              </h3>
              <div className="flex gap-2">
                {(['7days', '30days', 'all'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                      timeRange === range
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {range === '7days' ? '7 ngày' : range === '30days' ? '30 ngày' : 'Tất cả'}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getTrendData()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomLineTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#6366f1" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              Phân bổ kết quả kiểm chứng
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getVerdictStats()}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {getVerdictStats().map((entry: VerdictStat, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.verdict as keyof typeof COLORS] || '#94a3b8'}
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Legend 
                    layout="vertical" 
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    formatter={(value: string) => (
                      <span className="text-sm text-slate-600">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart - Verdict Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2"
          >
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              Chi tiết phân bổ theo kết quả
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getVerdictStats()}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomPieTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {getVerdictStats().map((entry: VerdictStat, index: number) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[entry.verdict as keyof typeof COLORS] || '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-slate-600">Đang tải thống kê...</span>
            </div>
          </div>
        )}
      </motion.div>
    </main>
  );
}