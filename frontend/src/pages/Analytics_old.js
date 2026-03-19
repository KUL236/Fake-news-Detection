import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box
} from '@mui/material';
import {
  LineChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import axios from 'axios';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [trends, setTrends] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get('/api/analytics/overview');
      setAnalytics(response.data);

      const trendsResponse = await axios.get('/api/analytics/trend');
      setTrends(trendsResponse.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  // Sample data for charts
  const timeSeriesData = [
    { date: 'Mon', fake: 12, real: 19 },
    { date: 'Tue', fake: 15, real: 18 },
    { date: 'Wed', fake: 10, real: 22 },
    { date: 'Thu', fake: 18, real: 16 },
    { date: 'Fri', fake: 22, real: 20 },
    { date: 'Sat', fake: 28, real: 24 },
    { date: 'Sun', fake: 25, real: 26 }
  ];

  const trendingTopics = [
    { name: 'Health Claims', value: 28, fake: 25 },
    { name: 'Political News', value: 22, fake: 18 },
    { name: 'Celebrity News', value: 18, fake: 16 },
    { name: 'Science', value: 15, fake: 10 },
    { name: 'Other', value: 17, fake: 12 }
  ];

  const COLORS = ['#f44336', '#4caf50', '#ff9800', '#2196f3', '#9c27b0'];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Real-time statistics and trends of fake news detection
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography color="inherit" gutterBottom>
                Total Analyzed
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                2,847
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography color="inherit" gutterBottom>
                Fake Detected
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                1,256
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography color="inherit" gutterBottom>
                Real Detected
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                1,591
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent sx={{ color: 'white' }}>
              <Typography color="inherit" gutterBottom>
                Accuracy Rate
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                94.2%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Time Series */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              📈 Weekly Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fake" stroke="#f44336" strokeWidth={2} />
                <Line type="monotone" dataKey="real" stroke="#4caf50" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              🥧 Fake vs Real Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Fake News', value: 1256 },
                    { name: 'Real News', value: 1591 }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#f44336" />
                  <Cell fill="#4caf50" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Trending Topics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              🔥 Trending Topics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendingTopics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2196f3" name="Total Mentions" />
                <Bar dataKey="fake" fill="#f44336" name="Fake Mentions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Topics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              🎯 Top Fake News Topics
            </Typography>
            <Grid container spacing={2}>
              {[
                { topic: '🏥 Health Misinformation', count: 245, trend: '↑ 12%' },
                { topic: '🏛️ Political Claims', count: 189, trend: '↑ 8%' },
                { topic: '⭐ Celebrity Rumors', count: 156, trend: '↓ 4%' },
                { topic: '🧪 Science Hoax', count: 128, trend: '↑ 6%' },
                { topic: '💰 Financial Scams', count: 98, trend: '↑ 15%' }
              ].map((item, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Card>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {item.topic}
                      </Typography>
                      <Typography variant="h6" color="error">
                        {item.count} reports
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.trend}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
