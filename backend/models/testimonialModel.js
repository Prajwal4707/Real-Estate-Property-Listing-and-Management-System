import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  isApproved: {
    type: Boolean,
    default: null
  },
  isTestimonial: {
    type: Boolean,
    default: true
  },
  // Auto-approval metadata
  validationMetadata: {
    autoApproved: {
      type: Boolean,
      default: false
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 8
    },
    failedChecks: [{
      type: String
    }],
    approvalReason: {
      type: String
    },
    validatedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
testimonialSchema.index({ isApproved: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ 'validationMetadata.autoApproved': 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
