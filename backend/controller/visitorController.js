import Visitor from '../models/visitorModel.js';

// Track a new visit
export const trackVisit = async (req, res) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    const result = await Visitor.trackVisit(ipAddress, userAgent);
    
    res.json({
      success: true,
      isNewVisitor: result.isNew,
      message: result.isNew ? 'New visitor tracked' : 'Returning visitor tracked'
    });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking visit'
    });
  }
};

// Get visitor statistics
export const getVisitorStats = async (req, res) => {
  try {
    const [uniqueVisitors, totalVisits] = await Promise.all([
      Visitor.getUniqueVisitors(),
      Visitor.getTotalVisits()
    ]);

    // Get today's visitors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayVisitors = await Visitor.countDocuments({
      lastVisit: { $gte: today }
    });

    // Get this month's visitors
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    const thisMonthVisitors = await Visitor.countDocuments({
      lastVisit: { $gte: thisMonth }
    });

    res.json({
      success: true,
      stats: {
        uniqueVisitors,
        totalVisits,
        todayVisitors,
        thisMonthVisitors
      }
    });
  } catch (error) {
    console.error('Error getting visitor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor statistics'
    });
  }
};

// Get visitor statistics for admin dashboard
export const getAdminVisitorStats = async (req, res) => {
  try {
    const [uniqueVisitors, totalVisits] = await Promise.all([
      Visitor.getUniqueVisitors(),
      Visitor.getTotalVisits()
    ]);

    // Get visitors for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentVisitors = await Visitor.aggregate([
      {
        $match: {
          lastVisit: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastVisit" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format data for chart
    const labels = [];
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split("T")[0];
      labels.push(dateString);

      const stat = recentVisitors.find((s) => s._id === dateString);
      data.push(stat ? stat.count : 0);
    }

    res.json({
      success: true,
      stats: {
        uniqueVisitors,
        totalVisits,
        visitorChartData: {
          labels,
          datasets: [{
            label: "Daily Visitors",
            data,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            fill: true
          }]
        }
      }
    });
  } catch (error) {
    console.error('Error getting admin visitor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching visitor statistics'
    });
  }
}; 