import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Backendurl } from "../../App";

export default function useContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    isTestimonial: false,
    rating: 0,
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    // Additional validation for testimonials
    if (formData.isTestimonial) {
      if (formData.rating === 0) {
        newErrors.rating = "Please select a rating";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const payload = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          isTestimonial: formData.isTestimonial,
          rating: formData.isTestimonial ? parseInt(formData.rating) : undefined,
        };

        const response = await axios.post(`${Backendurl}/api/forms/submit`, payload);
        
        // Show success message based on auto-approval status
        if (formData.isTestimonial && response.data.autoApproved) {
          toast.success("Testimonial submitted and approved! Thank you for your review.",{autoClose:3000});
        } else if (formData.isTestimonial) {
          toast.success("Testimonial submitted successfully! It will be reviewed and published soon.", {autoClose:3000});
        } else {
          toast.success("Message sent successfully!", {autoClose:3000});
        }

        // Reset form
        setFormData({ 
          name: "", 
          email: "", 
          phone: "", 
          message: "", 
          isTestimonial: false, 
          rating: 0 
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        const errorMessage = error.response?.data?.message || "Failed to submit. Please try again.";
        toast.error(errorMessage);
      }
    } else {
      console.log("Validation errors:", errors);
    }
  };

  return { formData, errors, handleChange, handleSubmit };
}
