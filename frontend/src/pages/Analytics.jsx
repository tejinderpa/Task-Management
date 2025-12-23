import { useEffect, useState } from 'react';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiDownload } from 'react-icons/fi';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import useTaskStore from '../store/taskStore';
import { exportStatsToPDF } from '../utils/exportUtils';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns';

const Analytics = () => {
  const { tasks, stats, fetchTasks, fetchStats } = useTaskStore();
  const [timeRange, setTimeRange] = useState('week'); // week, month, all

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Prepare data for status distribution pie chart
  const statusData = [
    { name: 'To Do', value: stats.TODO || 0, color: '#6366f1' },
    { name: 'In Progress', value: stats.IN_PROGRESS || 0, color: '#f59e0b' },
    { name: 'Review', value: stats.REVIEW || 0, color: '#8b5cf6' },
    { name: 'Done', value: stats.DONE || 0, color: '#10b981' }
  ].filter(item => item.value > 0);

  // Prepare data for priority distribution
  const priorityData = [
    { name: 'Urgent', value: stats.urgent || 0, color: '#ef4444' },
    { name: 'High', value: stats.high || 0, color: '#f97316' },
    { name: 'Medium', value: stats.medium || 0, color: '#f59e0b' },
    { name: 'Low', value: stats.low || 0, color: '#10b981' }
  ].filter(item => item.value > 0);

  // Prepare completion trend data (last 7 days)
  const getCompletionTrend = () => {
    const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 60;
    const dateRange = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return dateRange.map(date => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        return (
          taskDate.toDateString() === date.toDateString() &&
          task.status === 'DONE'
        );
      });

      return {
        date: format(date, 'MMM dd'),
        completed: dayTasks.length,
        fullDate: format(date, 'MMM dd, yyyy')
      };
    });
  };

  const completionTrend = getCompletionTrend();

  // Task creation vs completion
  const getTaskActivityData = () => {
    const days = 7;
    const dateRange = eachDayOfInterval({
      start: subDays(new Date(), days - 1),
      end: new Date()
    });

    return dateRange.map(date => {
      const created = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate.toDateString() === date.toDateString();
      }).length;

      const completed = tasks.filter(task => {
        const taskDate = new Date(task.updatedAt);
        return (
          taskDate.toDateString() === date.toDateString() &&
          task.status === 'DONE'
        );
      }).length;

      return {
        date: format(date, 'MMM dd'),
        created,
        completed
      };
    });
  };

  const activityData = getTaskActivityData();

  // Productivity metrics
  const calculateProductivity = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'DONE').length;
    const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;
    
    const overdueTasks = tasks.filter(t => {
      if (!t.dueDate || t.status === 'DONE') return false;
      return new Date(t.dueDate) < new Date();
    }).length;
    
    const onTimeRate = totalTasks > 0 ? (((totalTasks - overdueTasks) / totalTasks) * 100).toFixed(1) : 100;

    return {
      completionRate,
      onTimeRate,
      avgTasksPerDay: (completedTasks / 30).toFixed(1),
      productivityScore: ((parseFloat(completionRate) + parseFloat(onTimeRate)) / 2).toFixed(1)
    };
  };

  const productivity = calculateProductivity();

  const handleExportReport = () => {
    const result = exportStatsToPDF(stats);
    if (result.success) {
      toast.success('Analytics report exported!');
    } else {
      toast.error('Failed to export report');
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center space-x-3">
                <FiTrendingUp className="w-8 h-8" />
                <span>Analytics Dashboard</span>
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Track your productivity and task completion trends
              </p>
            </div>
            <button
              onClick={handleExportReport}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiDownload className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex items-center space-x-2 mt-6">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Last 60 Days
            </button>
          </div>
        </div>

        {/* Productivity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
                  {productivity.completionRate}%
                </p>
              </div>
              <FiPieChart className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">On-Time Rate</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {productivity.onTimeRate}%
                </p>
              </div>
              <FiBarChart2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Tasks/Day</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {productivity.avgTasksPerDay}
                </p>
              </div>
              <FiTrendingUp className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Productivity Score</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {productivity.productivityScore}%
                </p>
              </div>
              <FiTrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Completion Trend Line Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Completion Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={completionTrend}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCompleted)"
                  name="Completed Tasks"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Task Activity Bar Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Task Activity (Created vs Completed)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="created" fill="#6366f1" name="Created" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Status Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Priority Distribution Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Priority Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Summary Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">By Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">To Do</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.TODO || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.IN_PROGRESS || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Review</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.REVIEW || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Done</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.DONE || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">By Priority</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Urgent</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.urgent || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">High</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.high || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Medium</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.medium || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Low</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.low || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Important Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Total Tasks</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{stats.total || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Overdue</span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400">{stats.overdue || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Due Today</span>
                  <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">{stats.dueToday || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">This Week</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{stats.upcomingWeek || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
