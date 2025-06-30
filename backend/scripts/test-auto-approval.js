import { shouldAutoApprove, validateContentQuality } from '../utils/testimonialValidator.js';

// Test cases for auto-approval system
const testCases = [
  {
    name: "High-Quality Testimonial",
    testimonial: {
      name: "John Doe",
      email: "john.doe@gmail.com",
      phone: "+1-555-123-4567",
      message: "BuildEstate made finding my dream home incredibly easy! The 3-step process was smooth and the team was very professional. I found my perfect apartment within a week and couldn't be happier with the service.",
      rating: 5
    },
    expected: true
  },
  {
    name: "Low Rating Testimonial",
    testimonial: {
      name: "Jane Smith",
      email: "jane.smith@yahoo.com",
      phone: "+1-555-987-6543",
      message: "The service was okay, nothing special.",
      rating: 2
    },
    expected: false
  },
  {
    name: "Spam Testimonial",
    testimonial: {
      name: "Spam User",
      email: "spam@spam.com",
      phone: "+1-555-000-0000",
      message: "CLICK HERE TO MAKE MONEY FAST! BUY NOW!",
      rating: 5
    },
    expected: false
  },
  {
    name: "Short Testimonial",
    testimonial: {
      name: "Short User",
      email: "short@email.com",
      phone: "+1-555-111-1111",
      message: "Good service.",
      rating: 5
    },
    expected: false
  },
  {
    name: "Suspicious Pattern Testimonial",
    testimonial: {
      name: "Suspicious User",
      email: "suspicious@email.com",
      phone: "+1-555-222-2222",
      message: "Check out my website: https://spam.com and email me at spam@spam.com",
      rating: 5
    },
    expected: false
  },
  {
    name: "Medium Quality Testimonial",
    testimonial: {
      name: "Medium User",
      email: "medium@hotmail.com",
      phone: "+1-555-333-3333",
      message: "I had a good experience with BuildEstate. The property search was easy and the staff was helpful. Would recommend to others looking for properties.",
      rating: 4
    },
    expected: true
  }
];

const runTests = () => {
  console.log("🧪 Testing Smart Auto-Approval System\n");
  
  let passed = 0;
  let failed = 0;

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    
    const result = shouldAutoApprove(testCase.testimonial);
    const validation = validateContentQuality(testCase.testimonial);
    
    console.log(`  Rating: ${testCase.testimonial.rating}/5`);
    console.log(`  Message Length: ${testCase.testimonial.message.length} characters`);
    console.log(`  Quality Score: ${validation.score}/7`);
    console.log(`  Auto-Approve: ${result.autoApprove}`);
    console.log(`  Reason: ${result.reason}`);
    
    if (result.autoApprove === testCase.expected) {
      console.log(`  ✅ PASSED\n`);
      passed++;
    } else {
      console.log(`  ❌ FAILED - Expected: ${testCase.expected}, Got: ${result.autoApprove}\n`);
      failed++;
    }
  });

  console.log(`\n📊 Test Results:`);
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${testCases.length}`);
  console.log(`  Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);

  if (failed === 0) {
    console.log("\n🎉 All tests passed! Auto-approval system is working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Please review the auto-approval logic.");
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests }; 