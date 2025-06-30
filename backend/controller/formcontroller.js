import Form from '../models/formmodel.js';
import Testimonial from '../models/testimonialModel.js';
import { shouldAutoApprove, getValidationReport } from '../utils/testimonialValidator.js';

export const submitForm = async (req, res) => {
  try {
    const { name, email, phone, message, isTestimonial, rating } = req.body;

    // If it's a testimonial, save to testimonial collection
    if (isTestimonial) {
      // Validate required fields for testimonial
      if (!name || !email || !message || !rating) {
        return res.status(400).json({ 
          message: 'Name, email, message, and rating are required for testimonials' 
        });
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ 
          message: 'Rating must be between 1 and 5' 
        });
      }

      // Apply smart auto-approval logic
      const approvalDecision = shouldAutoApprove({ name, email, phone, message, rating });
      const validationReport = getValidationReport({ name, email, phone, message, rating });

      const newTestimonial = new Testimonial({
        name,
        email,
        phone,
        message,
        rating,
        isApproved: approvalDecision.autoApprove ? true : null,
        isTestimonial: true,
        validationMetadata: {
          autoApproved: approvalDecision.autoApprove,
          qualityScore: approvalDecision.score,
          failedChecks: approvalDecision.failedChecks || [],
          approvalReason: approvalDecision.reason,
          validatedAt: new Date()
        }
      });

      const savedTestimonial = await newTestimonial.save();

      // Return appropriate message based on approval status
      const responseMessage = approvalDecision.autoApprove 
        ? 'Testimonial submitted and approved! Thank you for your review.'
        : 'Testimonial submitted successfully! It will be reviewed and published soon.';

      return res.json({ 
        message: responseMessage,
        testimonial: savedTestimonial,
        autoApproved: approvalDecision.autoApprove,
        qualityScore: approvalDecision.score
      });
    }

    // Regular contact form
    const newForm = new Form({
      name,
      email,
      phone,
      message,
    });

    const savedForm = await newForm.save();
    
    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error saving form data:', error);
    res.status(500).json({ message: 'Server error', error: error?.stack || error?.message || error });
  }
};

// Get all contact form messages (for admin)
export const getAllForms = async (req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    res.json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching contact form messages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a contact form message by ID
export const deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Form.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};