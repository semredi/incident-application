#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Running Fire Incident Mini-Portal Tests...\n');

try {
  // Run backend tests
  console.log('📋 Running Backend API Tests...');
  execSync('npm test', { stdio: 'inherit' });
  console.log('✅ Backend tests passed!\n');

  // Run frontend tests
  console.log('🎨 Running Frontend Component Tests...');
  execSync(
    'cd client && npm test -- --coverage --watchAll=false --passWithNoTests',
    { stdio: 'inherit' }
  );
  console.log('✅ Frontend tests passed!\n');

  console.log('🎉 All tests completed successfully!');
} catch (error) {
  console.error('❌ Tests failed:', error.message);
  process.exit(1);
}
