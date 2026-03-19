import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  LinearProgress
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
import './Analytics.css';

const COLORS = ['#dc2626', '#22c55e', '#3b82f6', '#f59e0b'];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('all');

  // Sample data
  const timeSeriesData = [
    { date: 'Mon', fake: 24, real: 20 },
    { date: 'Tue', fake: 30, real: 18 },
    { date: 'Wed', fake: 22, real: 25 },
    { date: 'Thu', fake: 28, real: 22 },
    { date: 'Fri', fake: 35, real: 20 },
    { date: 'Sat', fake: 32, real: 24 },
    { date: 'Sun', fake: 26, real: 28 }
  ];

  const trendingTopics = [
    { name: 'Politics', value: 156, fake: 95 },
    { name: 'Health', value: 142, fake: 78 },
    { name: 'Tech', value: 128, fake: 52 },
    { name: 'Science', value: 98, fake: 35 }
  ];

  const stats = [
    { icon: '📊', label: 'Total Analysis', value: '2,847', change: '+12%' },
    { icon: '❌', label: 'Fake Detected', value: '1,256', change: '+8%' },
    { icon: '✅', label: 'Real News', value: '1,591', change: '+15%' },
    { icon: '🎯', label: 'Accuracy Rate', value: '94.2%', change: '+2%' }
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4, mt: 2 }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Track trends and statistics for fake news detection
        </Typography>
      </Box>

      {/* Time Range Selector */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1}>
          {['day', 'week', 'month', 'year'].map((range) => (
            <Chip
              key={range}
              label={range.charAt(0).toUpperCase() + range.slice(1)}
              onClick={() => setTimeRange(range)}
              color={timeRange === range ? 'primary' : 'default'}
              sx={{ fontWeight: 600 }}
            />
          ))}
        </Stack>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Metric</InputLabel>
          <Select value={selectedMetric} label="Metric" onChange={(e) => setSelectedMetric(e.target.value)}>
            <MenuItem value="all">All Metrics</MenuItem>
            <MenuItem value="fake">Fake News Only</MenuItem>
            <MenuItem value="real">Real News Only</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                background: `linear-gradient(135deg, rgba(102, 126, 234, ${0.1 + idx * 0.05}) 0%, rgba(118, 75, 162, ${0.1 + idx * 0.05}) 100%)`,
                borderLeft: `4px solid #667eea`,
                borderRadius: '16px'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography sx={{ fontSize: '2rem' }}>
                    {stat.icon}
                  </Typography>
                  <Chip
                    label={stat.change}
                    color={stat.change.includes('+') ? 'success' : 'error'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Typography color="textSecondary" variant="body2" sx={{ mb: 1 }}>
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Weekly Trend */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              📈 Weekly Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="fake" stroke="#dc2626" strokeWidth={2} name="Fake News" />
                <Line type="monotone" dataKey="real" stroke="#22c55e" strokeWidth={2} name="Real News" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              🥧 Distribution
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
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#dc2626" />
                  <Cell fill="#22c55e" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Trending Topics */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              🔥 Trending Topics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendingTopics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Total Mentions" />
                <Bar dataKey="fake" fill="#dc2626" name="Fake Mentions" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Top Topics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              🏆 Top Fake Topics
            </Typography>
            {[
              { topic: 'Political News', count: 342, pct: 88 },
              { topic: 'Health Claims', count: 278, pct: 72 },
              { topic: 'Conspiracy Theories', count: 245, pct: 95 },
              { topic: 'Financial Advice', count: 189, pct: 65 }
            ].map((item, idx) => (
              <Box key={idx} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {item.topic}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {item.count} posts
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.pct}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: '#fee2e2',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#dc2626',
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              ⚡ Detection Insights
            </Typography>
            <Stack spacing={2}>
              {[
                { label: 'Avg. Analysis Time', value: '87ms', icon: '⏱️' },
                { label: 'Most Active Hour', value: '2 PM UTC', icon: '🕐' },
                { label: 'Peak Fake Topics', value: 'Politics', icon: '📌' },
                { label: 'Detection Confidence', value: '94.2%', icon: '🎯' }
              ].map((insight, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 2,
                    backgroundColor: '#f1f5f9',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>
                      {insight.icon}
                    </Typography>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {insight.label}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {insight.value}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
