import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  Home,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Eye,
  AlertCircle,
  Loader,
  RefreshCcw,
  X
} from "lucide-react";
import { backendurl } from "../App";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    totalViews: 0,
    pendingAppointments: 0,
    recentActivity: [],
    viewsData: {},
    uniqueVisitors: 0,
    totalVisits: 0,
    todayVisitors: 0,
    thisMonthVisitors: 0,
    loading: true,
    error: null,
  });
  const [showVisitorDetails, setShowVisitorDetails] = useState(false);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Property Views Over Time",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${backendurl}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setStats((prev) => ({
          ...prev,
          ...response.data.stats,
          loading: false,
          error: null,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch stats");
      }
    } catch (error) {
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to fetch dashboard data",
      }));
      console.error("Error fetching stats:", error);
    }
  };

  const handleResetViews = async () => {
    if (window.confirm("Are you sure you want to reset all property views? This action cannot be undone.")) {
      try {
        const response = await axios.post(
          `${backendurl}/api/admin/reset-views`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (response.data.success) {
          alert(response.data.message);
          fetchStats(); // Refresh stats after resetting views
        } else {
          alert(response.data.message || "Failed to reset property views.");
        }
      } catch (error) {
        console.error("Error resetting property views:", error);
        alert(error.response?.data?.message || "An error occurred while resetting views.");
      }
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    {
      title: "Total Properties",
      value: stats.totalProperties,
      icon: Home,
      color: "bg-blue-500",
      description: "Total properties listed",
    },
    {
      title: "Active Listings",
      value: stats.activeListings,
      icon: Activity,
      color: "bg-green-500",
      description: "Currently active listings",
    },
    {
      title: "Total Views",
      value: stats.totalViews,
      icon: Eye,
      color: "bg-purple-500",
      description: "Property page views",
    },
    {
      title: "Total Visits",
      value: stats.totalVisits || 0,
      icon: TrendingUp,
      color: "bg-teal-500",
      description: "Total page visits",
      clickable: true,
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: Calendar,
      color: "bg-orange-500",
      description: "Awaiting confirmation",
    },
  ];

  if (stats.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-gray-500 mb-4">{stats.error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
              transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <TrendingUp className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen pt-24 sm:pt-32 px-2 sm:px-4 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Overview of your property management system
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 \
              transition-colors duration-200 flex items-center gap-2 text-sm sm:text-base"
          >
            <TrendingUp className="w-4 h-4" />
            Refresh Data
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${stat.clickable ? 'cursor-pointer hover:ring-2 hover:ring-teal-400' : ''}`}
              onClick={stat.clickable ? () => setShowVisitorDetails(true) : undefined}
              title={stat.clickable ? 'Click to view visitor details' : undefined}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-500">
                  Last 30 days
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">
                {stat.title}
              </h3>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Property Views Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg overflow-x-auto"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex justify-between items-center">
              <span>Property Views</span>
              <button
                onClick={handleResetViews}
                className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-md text-xs sm:text-sm hover:bg-red-600 transition-colors flex items-center gap-1"
              >
                <RefreshCcw className="w-3 h-3" />
                Reset Views
              </button>
            </h2>
            <div className="h-[300px] sm:h-[400px] min-w-[320px]">
              {stats.viewsData && Object.keys(stats.viewsData).length > 0 ? (
                <Line data={stats.viewsData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No view data available</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-lg"
          >
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
              Recent Activity
            </h2>
            <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto">
              {stats.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-gray-50 rounded-lg \
                      transition-colors duration-200"
                  >
                    <div className="p-1 sm:p-2 bg-blue-100 rounded-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-xs sm:text-base">
                        {activity.description}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-base">
                  No recent activity
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Visitor Details Modal */}
      {showVisitorDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Visitor Details
              </h3>
              <button
                onClick={() => setShowVisitorDetails(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Unique Visitors</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {stats.uniqueVisitors?.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  New visitors who have never been to the site before
                </p>
              </div>
              <div className="bg-green-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Total Visits</span>
                  </div>
                  <span className="text-xl font-bold text-green-600">
                    {stats.totalVisits?.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total number of page visits including returning visitors
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Today's Visitors</span>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {stats.todayVisitors?.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Visitors who came to the site today
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">This Month</span>
                  </div>
                  <span className="text-xl font-bold text-orange-600">
                    {stats.thisMonthVisitors?.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Visitors who came to the site this month
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {stats.totalVisits > 0 ? Math.round((stats.uniqueVisitors / stats.totalVisits) * 100) : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    New Visitor Rate
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Percentage of visits from new visitors
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowVisitorDetails(false)}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Dashboard;
