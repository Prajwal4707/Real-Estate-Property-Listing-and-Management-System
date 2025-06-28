import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Backendurl } from '../App';

const VisitorCounter = () => {
  const [visitorStats, setVisitorStats] = useState({
    uniqueVisitors: 0,
    totalVisits: 0,
    todayVisitors: 0,
    thisMonthVisitors: 0
  });
  const [loading, setLoading] = useState(true);

  // Track visit when component mounts
  useEffect(() => {
    const trackVisit = async () => {
      try {
        await axios.post(`${Backendurl || "http://localhost:4000"}/api/visitors/track`);
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, []);

  // Fetch visitor statistics
  useEffect(() => {
    let intervalId;
    const fetchVisitorStats = async () => {
      try {
        const response = await axios.get(`${Backendurl || "http://localhost:4000"}/api/visitors/stats`);
        if (response.data.success) {
          setVisitorStats(response.data.stats);
        }
      } catch (error) {
        console.error('Error fetching visitor stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorStats();
    intervalId = setInterval(fetchVisitorStats, 5000); // Poll every 5 seconds
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600">
        <Users className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
      title={`${visitorStats.totalVisits} total visits • ${visitorStats.uniqueVisitors} unique visitors`}
    >
      <Users className="w-4 h-4" />
      <span className="text-sm font-medium">
        {visitorStats.totalVisits.toLocaleString()} visits
      </span>
    </motion.div>
  );
};

export default VisitorCounter; 