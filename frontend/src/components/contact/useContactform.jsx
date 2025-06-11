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
        await axios.post(`${Backendurl}/api/forms/submit`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
        });
        toast.success("Message sent successfully!");

        // Reset form
        setFormData({ name: "", email: "", phone: "", message: "" });
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("Failed to submit. Please try again.");
      }
    } else {
      console.log("Validation errors:", errors); // Debugging log
    }
  };

  return { formData, errors, handleChange, handleSubmit };
}
