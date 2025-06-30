// Smart testimonial validation and auto-approval system

// Configuration for auto-approval criteria
const AUTO_APPROVAL_CONFIG = {
  minLength: 20,                    // Minimum message length
  maxLength: 500,                   // Maximum message length
  minRating: 4,                     // Minimum rating to auto-approve
  maxRating: 5,                     // Maximum rating to auto-approve
  spamKeywords: [                   // Keywords that indicate spam
    'spam', 'fake', 'test', 'check', 'verify', 'click here',
    'buy now', 'free money', 'make money fast', 'work from home',
    'earn money', 'get rich', 'lottery', 'winner', 'prize'
  ],
  suspiciousPatterns: [             // Regex patterns for suspicious content
    /https?:\/\/[^\s]+/g,           // URLs
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
    /\b\d{10,}\b/g,                 // Long numbers (phone/ID)
    /\b[A-Z]{5,}\b/g                // All caps words
  ],
  trustedEmailDomains: [            // Trusted email domains
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
    'icloud.com', 'protonmail.com', 'aol.com'
  ],
  maxCapsPercentage: 0.3,           // Maximum percentage of capital letters
  minUniqueWords: 5                 // Minimum unique words in message
};

/**
 * Check if email domain is trusted
 */
const isTrustedEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return AUTO_APPROVAL_CONFIG.trustedEmailDomains.includes(domain);
};

/**
 * Check if message contains spam keywords
 */
const containsSpamKeywords = (message) => {
  const lowerMessage = message.toLowerCase();
  return AUTO_APPROVAL_CONFIG.spamKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
};

/**
 * Check if message matches suspicious patterns
 */
const hasSuspiciousPatterns = (message) => {
  return AUTO_APPROVAL_CONFIG.suspiciousPatterns.some(pattern => 
    pattern.test(message)
  );
};

/**
 * Calculate percentage of capital letters
 */
const getCapsPercentage = (message) => {
  const totalLetters = message.replace(/[^a-zA-Z]/g, '').length;
  const capsLetters = message.replace(/[^A-Z]/g, '').length;
  return totalLetters > 0 ? capsLetters / totalLetters : 0;
};

/**
 * Count unique words in message
 */
const getUniqueWordCount = (message) => {
  const words = message.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2);
  return new Set(words).size;
};

/**
 * Validate testimonial content quality
 */
const validateContentQuality = (testimonial) => {
  const { message, rating, email, name } = testimonial;
  
  const checks = {
    length: message.length >= AUTO_APPROVAL_CONFIG.minLength && 
            message.length <= AUTO_APPROVAL_CONFIG.maxLength,
    rating: rating >= AUTO_APPROVAL_CONFIG.minRating && 
            rating <= AUTO_APPROVAL_CONFIG.maxRating,
    spamFree: !containsSpamKeywords(message),
    noSuspiciousPatterns: !hasSuspiciousPatterns(message),
    trustedEmail: isTrustedEmailDomain(email),
    capsPercentage: getCapsPercentage(message) <= AUTO_APPROVAL_CONFIG.maxCapsPercentage,
    uniqueWords: getUniqueWordCount(message) >= AUTO_APPROVAL_CONFIG.minUniqueWords,
    validName: name && name.trim().length >= 2 && name.trim().length <= 50
  };

  return {
    isValid: Object.values(checks).every(check => check),
    checks,
    score: Object.values(checks).filter(Boolean).length
  };
};

/**
 * Determine if testimonial should be auto-approved
 */
const shouldAutoApprove = (testimonial) => {
  const validation = validateContentQuality(testimonial);
  
  // Auto-approve if all checks pass
  if (validation.isValid) {
    return {
      autoApprove: true,
      reason: 'High-quality testimonial meets all criteria',
      score: validation.score
    };
  }
  
  // Manual review required
  const failedChecks = Object.entries(validation.checks)
    .filter(([key, value]) => !value)
    .map(([key]) => key);
  
  return {
    autoApprove: false,
    reason: `Manual review required: Failed checks - ${failedChecks.join(', ')}`,
    score: validation.score,
    failedChecks
  };
};

/**
 * Get detailed validation report
 */
const getValidationReport = (testimonial) => {
  const validation = validateContentQuality(testimonial);
  const approvalDecision = shouldAutoApprove(testimonial);
  
  return {
    testimonial: {
      name: testimonial.name,
      email: testimonial.email,
      rating: testimonial.rating,
      messageLength: testimonial.message.length,
      uniqueWords: getUniqueWordCount(testimonial.message),
      capsPercentage: getCapsPercentage(testimonial.message)
    },
    validation,
    approvalDecision,
    timestamp: new Date().toISOString()
  };
};

export {
  shouldAutoApprove,
  validateContentQuality,
  getValidationReport,
  AUTO_APPROVAL_CONFIG
}; 