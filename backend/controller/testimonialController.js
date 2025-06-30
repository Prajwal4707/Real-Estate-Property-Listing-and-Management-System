import Testimonial from '../models/testimonialModel.js';
import { AUTO_APPROVAL_CONFIG } from '../utils/testimonialValidator.js';

// Submit a new testimonial
export const submitTestimonial = async (req, res) => {
  try {
    const { name, email, phone, message, rating } = req.body;

    // Validate required fields
    if (!name || !email || !message || !rating) {
      return res.status(400).json({ 
        message: 'Name, email, message, and rating are required' 
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        message: 'Rating must be between 1 and 5' 
      });
    }

    const newTestimonial = new Testimonial({
      name,
      email,
      phone,
      message,
      rating,
      isTestimonial: true
    });

    const savedTestimonial = await newTestimonial.save();

    res.status(201).json({ 
      message: 'Testimonial submitted successfully! It will be reviewed and published soon.',
      testimonial: savedTestimonial
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all approved testimonials
export const getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ 
      isApproved: true 
    })
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all testimonials (admin only)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 });

    res.json({ testimonials });
  } catch (error) {
    console.error('Error fetching all testimonials:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve/Reject testimonial (admin only)
export const updateTestimonialStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ 
      message: `Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`,
      testimonial 
    });
  } catch (error) {
    console.error('Error updating testimonial status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete testimonial (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByIdAndDelete(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get auto-approval configuration (admin only)
export const getAutoApprovalConfig = async (req, res) => {
  try {
    res.json({ config: AUTO_APPROVAL_CONFIG });
  } catch (error) {
    console.error('Error fetching auto-approval config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get testimonial statistics (admin only)
export const getTestimonialStats = async (req, res) => {
  try {
    const total = await Testimonial.countDocuments();
    const approved = await Testimonial.countDocuments({ isApproved: true });
    const pending = await Testimonial.countDocuments({ isApproved: null });
    const rejected = await Testimonial.countDocuments({ isApproved: false });
    const autoApproved = await Testimonial.countDocuments({ 'validationMetadata.autoApproved': true });

    const avgRating = await Testimonial.aggregate([
      { $match: { isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    res.json({
      stats: {
        total,
        approved,
        pending,
        rejected,
        autoApproved,
        avgRating: avgRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 