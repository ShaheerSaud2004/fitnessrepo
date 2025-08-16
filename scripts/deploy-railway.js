#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Fitness Tracker - Railway Deployment\n');

console.log('📋 Prerequisites:');
console.log('1. Create a Railway account at https://railway.app');
console.log('2. Install Railway CLI: npm install -g @railway/cli');
console.log('3. Login to Railway: railway login\n');

console.log('🎯 Deployment Steps:');
console.log('1. Initialize Railway project');
console.log('2. Deploy to Railway');
console.log('3. Set environment variables\n');

rl.question('Are you ready to deploy to Railway? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('👋 Deployment cancelled. Goodbye!');
    rl.close();
    return;
  }

  console.log('\n🚀 Starting Railway deployment...\n');

  try {
    // Check if Railway CLI is installed
    console.log('📦 Checking Railway CLI...');
    execSync('railway --version', { stdio: 'pipe' });
    console.log('✅ Railway CLI is installed\n');

    // Initialize Railway project
    console.log('🔧 Initializing Railway project...');
    execSync('railway init', { stdio: 'inherit' });
    console.log('✅ Railway project initialized\n');

    // Deploy to Railway
    console.log('🚀 Deploying to Railway...');
    execSync('railway up', { stdio: 'inherit' });
    console.log('✅ Deployment completed!\n');

    // Get the deployment URL
    console.log('🌐 Getting deployment URL...');
    const url = execSync('railway domain', { encoding: 'utf8' }).trim();
    console.log(`✅ Your app is live at: ${url}\n`);

    console.log('🔧 Next Steps:');
    console.log('1. Set environment variables:');
    console.log('   railway variables set JWT_SECRET=your-super-secret-jwt-key');
    console.log('   railway variables set NODE_ENV=production');
    console.log('2. Test your application at the URL above');
    console.log('3. Share your app with users!\n');

    console.log('🎉 Congratulations! Your fitness app is now live on Railway!');

  } catch (error) {
    console.log('\n❌ Deployment failed. Please check the error messages above.');
    console.log('\n💡 Troubleshooting:');
    console.log('- Make sure you are logged in to Railway: railway login');
    console.log('- Check that all dependencies are installed');
    console.log('- Ensure you have a Railway account');
    console.log('- Try running the commands manually');
  }

  rl.close();
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
  console.log('\n\n👋 Deployment cancelled. Goodbye!');
  process.exit(0);
});
