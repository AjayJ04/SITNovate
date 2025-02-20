import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SentimentDashboard = () => {
  const [sentimentData, setSentimentData] = useState([
    { date: '2024-01', positive: 65, negative: 20, neutral: 15 },
    { date: '2024-02', positive: 70, negative: 15, neutral: 15 },
    { date: '2024-03', positive: 60, negative: 25, neutral: 15 }
  ]);

  const [keywordData, setKeywordData] = useState([
    { word: 'quality', count: 120 },
    { word: 'delivery', count: 90 },
    { word: 'price', count: 80 },
    { word: 'service', count: 70 },
    { word: 'style', count: 60 }
  ]);

  const generateSentimentData = () => {
    const positive = Math.floor(Math.random() * 40) + 40;
    const negative = Math.floor(Math.random() * 30);
    const neutral = 100 - positive - negative;
    const currentDate = new Date();
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return { date: dateStr, positive, negative, neutral };
  };

  const updateKeywords = () => {
    const words = ['quality', 'delivery', 'price', 'service', 'style', 'fit', 'color', 'size', 'material', 'shipping'];
    return words.map(word => ({
      word,
      count: Math.floor(Math.random() * 100) + 50
    })).sort((a, b) => b.count - a.count).slice(0, 5);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSentimentData(prev => [...prev.slice(-5), generateSentimentData()]);
      setKeywordData(updateKeywords());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Real-Time Sentiment Analysis Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-md">
          <h3 className="text-green-500">Positive Sentiment</h3>
          <p className="text-3xl font-bold">{sentimentData[sentimentData.length - 1]?.positive}%</p>
        </div>
        <div className="p-4 bg-white shadow rounded-md">
          <h3 className="text-red-500">Negative Sentiment</h3>
          <p className="text-3xl font-bold">{sentimentData[sentimentData.length - 1]?.negative}%</p>
        </div>
        <div className="p-4 bg-white shadow rounded-md">
          <h3 className="text-gray-500">Neutral Sentiment</h3>
          <p className="text-3xl font-bold">{sentimentData[sentimentData.length - 1]?.neutral}%</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white shadow rounded-md">
          <h2 className="text-xl font-semibold mb-4">Sentiment Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="positive" stroke="#22c55e" fill="#22c55e" name="Positive" />
              <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="#ef4444" name="Negative" />
              <Area type="monotone" dataKey="neutral" stroke="#64748b" fill="#64748b" name="Neutral" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-4 bg-white shadow rounded-md">
          <h2 className="text-xl font-semibold mb-4">Top Keywords</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={keywordData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="word" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" name="Frequency" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SentimentDashboard;
