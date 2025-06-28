import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  firstVisit: {
    type: Date,
    default: Date.now
  },
  lastVisit: {
    type: Date,
    default: Date.now
  },
  visitCount: {
    type: Number,
    default: 1
  },
  isUnique: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Compound index for efficient queries
visitorSchema.index({ ipAddress: 1, userAgent: 1 });

// Static method to get total unique visitors
visitorSchema.statics.getUniqueVisitors = function() {
  return this.countDocuments({ isUnique: true });
};

// Static method to get total visits
visitorSchema.statics.getTotalVisits = function() {
  return this.aggregate([
    { $group: { _id: null, total: { $sum: "$visitCount" } } }
  ]).then(result => result[0]?.total || 0);
};

// Static method to track a visit
visitorSchema.statics.trackVisit = async function(ipAddress, userAgent) {
  try {
    // Check if this visitor already exists
    let visitor = await this.findOne({ ipAddress, userAgent });
    
    if (visitor) {
      // Update existing visitor
      visitor.lastVisit = new Date();
      visitor.visitCount += 1;
      await visitor.save();
      return { isNew: false, visitor };
    } else {
      // Create new visitor
      visitor = await this.create({
        ipAddress,
        userAgent,
        isUnique: true
      });
      return { isNew: true, visitor };
    }
  } catch (error) {
    console.error('Error tracking visitor:', error);
    throw error;
  }
};

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor; 