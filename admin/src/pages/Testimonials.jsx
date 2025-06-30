import React, { useState, useEffect } from 'react';
import { Star, Check, X, Trash2, Eye, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [contactMessages, setContactMessages] = useState([]);

  useEffect(() => {
    fetchTestimonials();
    fetchContactMessages();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/testimonials/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTestimonials(response.data.testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const fetchContactMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/forms/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContactMessages(response.data.forms);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast.error('Failed to fetch contact messages');
    }
  };

  const handleStatusUpdate = async (id, isApproved) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/testimonials/${id}/status`,
        { isApproved },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Testimonial ${isApproved ? 'approved' : 'rejected'} successfully`);
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      toast.error('Failed to update testimonial status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/testimonials/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const handleDeleteContactMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Contact message deleted successfully');
      fetchContactMessages();
    } catch (error) {
      console.error('Error deleting contact message:', error);
      toast.error('Failed to delete contact message');
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    if (filter === 'all') return true;
    if (filter === 'pending') return testimonial.isApproved === null || testimonial.isApproved === undefined;
    if (filter === 'approved') return testimonial.isApproved === true;
    if (filter === 'rejected') return testimonial.isApproved === false;
    return true;
  });

  const getStatusBadge = (isApproved, validationMetadata) => {
    if (isApproved === undefined || isApproved === null) {
      const isAutoApproved = validationMetadata?.autoApproved;
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          {isAutoApproved ? 'Auto-Approved' : 'Pending'}
        </span>
      );
    }
    return isApproved ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Check className="w-3 h-3 mr-1" />
        Approved
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <X className="w-3 h-3 mr-1" />
        Rejected
      </span>
    );
  };

  const getQualityScoreBadge = (score) => {
    if (score >= 6) return 'bg-green-100 text-green-800';
    if (score >= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Testimonials Management</h1>
        <p className="text-gray-600">Manage customer reviews and testimonials</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-4 border-b border-gray-200">
          {[
            { key: 'all', label: 'All', count: testimonials.length },
            { key: 'pending', label: 'Pending', count: testimonials.filter(t => t.isApproved === null || t.isApproved === undefined).length },
            { key: 'approved', label: 'Approved', count: testimonials.filter(t => t.isApproved === true).length },
            { key: 'rejected', label: 'Rejected', count: testimonials.filter(t => t.isApproved === false).length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                filter === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTestimonials.map((testimonial) => (
          <div
            key={testimonial._id}
            className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.email}</p>
                </div>
              </div>
              {getStatusBadge(testimonial.isApproved, testimonial.validationMetadata)}
            </div>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {testimonial.rating}/5
              </span>
              {testimonial.validationMetadata?.qualityScore && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getQualityScoreBadge(testimonial.validationMetadata.qualityScore)}`}>
                  Quality: {testimonial.validationMetadata.qualityScore}/8
                </span>
              )}
            </div>

            {/* Message */}
            <div className="mb-4">
              <p className="text-gray-700 text-sm leading-relaxed">
                {testimonial.message.length > 150
                  ? `${testimonial.message.substring(0, 150)}...`
                  : testimonial.message}
              </p>
              {testimonial.message.length > 150 && (
                <button
                  onClick={() => {
                    setSelectedTestimonial(testimonial);
                    setShowModal(true);
                  }}
                  className="text-blue-600 text-sm hover:text-blue-800 mt-2"
                >
                  Read more
                </button>
              )}
            </div>

            {/* Date */}
            <div className="text-xs text-gray-500 mb-4">
              {new Date(testimonial.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              {testimonial.isApproved === null || testimonial.isApproved === undefined ? (
                <>
                  <button
                    onClick={() => handleStatusUpdate(testimonial._id, true)}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(testimonial._id, false)}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStatusUpdate(testimonial._id, !testimonial.isApproved)}
                  className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {testimonial.isApproved ? 'Reject' : 'Approve'}
                </button>
              )}
              <button
                onClick={() => handleDelete(testimonial._id)}
                className="bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Contact Messages Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Contact Messages</h2>
        {contactMessages.length === 0 ? (
          <p className="text-gray-500">No contact messages found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {contactMessages.map((msg) => (
              <div key={msg._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="font-semibold text-gray-900">{msg.name}</div>
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</div>
                    <button
                      onClick={() => handleDeleteContactMessage(msg._id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      title="Delete message"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-1">{msg.email}</div>
                {msg.phone && <div className="text-sm text-gray-500 mb-1">{msg.phone}</div>}
                <div className="text-gray-700 text-sm mt-2 whitespace-pre-line">{msg.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredTestimonials.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Star className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'No testimonials have been submitted yet.'
              : `No ${filter} testimonials found.`
            }
          </p>
        </div>
      )}

      {/* Modal for full testimonial */}
      {showModal && selectedTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {selectedTestimonial.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedTestimonial.name}</h3>
                    <p className="text-gray-500">{selectedTestimonial.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < selectedTestimonial.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {selectedTestimonial.rating}/5
                </span>
              </div>

              <div className="mb-4">
                <p className="text-gray-700 leading-relaxed">{selectedTestimonial.message}</p>
              </div>

              {/* Validation Details */}
              {selectedTestimonial.validationMetadata && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Validation Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quality Score:</span>
                      <span className={`font-medium ${getQualityScoreBadge(selectedTestimonial.validationMetadata.qualityScore)} px-2 py-1 rounded`}>
                        {selectedTestimonial.validationMetadata.qualityScore}/7
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Auto-Approved:</span>
                      <span className={`font-medium ${selectedTestimonial.validationMetadata.autoApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                        {selectedTestimonial.validationMetadata.autoApproved ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {selectedTestimonial.validationMetadata.failedChecks?.length > 0 && (
                      <div>
                        <span className="text-gray-600">Failed Checks:</span>
                        <div className="mt-1">
                          {selectedTestimonial.validationMetadata.failedChecks.map((check, index) => (
                            <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {check}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedTestimonial.validationMetadata.approvalReason && (
                      <div>
                        <span className="text-gray-600">Reason:</span>
                        <p className="text-gray-800 mt-1">{selectedTestimonial.validationMetadata.approvalReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-gray-500 mb-6">
                Submitted on {new Date(selectedTestimonial.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>

              <div className="flex space-x-3">
                {selectedTestimonial.isApproved === null || selectedTestimonial.isApproved === undefined ? (
                  <>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedTestimonial._id, true);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedTestimonial._id, false);
                        setShowModal(false);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      handleStatusUpdate(selectedTestimonial._id, !selectedTestimonial.isApproved);
                      setShowModal(false);
                    }}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    {selectedTestimonial.isApproved ? 'Reject' : 'Approve'}
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedTestimonial._id);
                    setShowModal(false);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md font-medium hover:bg-gray-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Testimonials;
