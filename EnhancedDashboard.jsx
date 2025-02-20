import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Card, CardHeader, CardContent, Typography } from '@mui/material';
import { AlertCircle, TrendingUp, MessageCircle, Users, Search, Filter } from 'lucide-react';

// Sample data
const initialData = {
  sentimentTrends: [
    { date: '2024-01', positive: 65, negative: 20, neutral: 15 },
    { date: '2024-02', positive: 70, negative: 15, neutral: 15 },
    { date: '2024-03', positive: 60, negative: 25, neutral: 15 },
    { date: '2024-04', positive: 75, negative: 10, neutral: 15 }
  ],
  topKeywords: [
    { word: 'service', count: 150 },
    { word: 'quality', count: 120 },
    { word: 'price', count: 100 },
    { word: 'support', count: 80 }
  ],
  sourceData: [
    { name: 'Twitter', value: 40 },
    { name: 'Facebook', value: 25 },
    { name: 'Instagram', value: 20 },
    { name: 'Reviews', value: 15 }
  ]
};

const EnhancedDashboard = () => {
  const [timeRange, setTimeRange] = useState('1M');
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ source: 'all', sentiment: 'all', date: 'all' });
  const [view, setView] = useState('overview');

  // WebSocket connection setup
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5000');
  
    ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setData((prevData) => ({
        ...prevData,
        sentimentTrends: [...prevData.sentimentTrends, newData]
      }));
    };
  
    ws.onerror = (error) => console.error('WebSocket error:', error);
  
    return () => ws.close();
  }, []);
  

  // Filtered data
  const filteredData = React.useMemo(() => {
    let filtered = { ...data };

    if (searchTerm) {
      filtered.topKeywords = data.topKeywords.filter(
        item => item.word.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.source !== 'all') {
      filtered.sourceData = data.sourceData.filter(item => item.name === filters.source);
    }

    return filtered;
  }, [data, searchTerm, filters]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Sentiment Analysis Dashboard</h1>

      {/* Search & Filters */}
      <div className="flex gap-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search keywords..."
            className="pl-8 h-10 rounded-md border border-input bg-background px-3 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3"
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
        >
          <option value="all">All Sources</option>
          <option value="Twitter">Twitter</option>
          <option value="Facebook">Facebook</option>
          <option value="Instagram">Instagram</option>
        </select>
      </div>

      {/* Time Range Buttons */}
      <div className="flex gap-2">
        {['1D', '1W', '1M', '3M', '1Y'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded ${timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Typography variant="h6">Total Feedback</Typography>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <Typography variant="h6">Sentiment Over Time</Typography>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={filteredData.sentimentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="positive" stackId="1" stroke="#0088FE" fill="#0088FE" />
                <Area type="monotone" dataKey="negative" stackId="1" stroke="#FF8042" fill="#FF8042" />
                <Area type="monotone" dataKey="neutral" stackId="1" stroke="#FFBB28" fill="#FFBB28" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Typography variant="h6">Top Keywords</Typography>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={filteredData.topKeywords}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="word" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
