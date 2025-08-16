#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Fitness Tracker - Deployment Helper\n');

const deploymentOptions = [
  { name: 'Vercel', command: 'npm run deploy:vercel', description: 'Free, easy, recommended for full-stack apps' },
  { name: 'Railway', command: 'npm run deploy:railway', description: 'Free tier, good for apps with databases' },
  { name: 'Netlify', command: 'npm run deploy:netlify', description: 'Free, great for static sites with serverless' },
  { name: 'Heroku', command: 'git push heroku main', description: 'Paid but reliable, traditional choice' },
  { name: 'Manual Setup', command: null, description: 'Follow DEPLOYMENT.md for detailed instructions' }
];

console.log('Choose your deployment platform:\n');

deploymentOptions.forEach((option, index) => {
  console.log(`${index + 1}. ${option.name} - ${option.description}`);
});

console.log('\n');

rl.question('Enter your choice (1-5): ', (choice) => {
  const selectedOption = deploymentOptions[parseInt(choice) - 1];
  
  if (!selectedOption) {
    console.log('❌ Invalid choice. Please run the script again.');
    rl.close();
    return;
  }

  console.log(`\n🎯 Selected: ${selectedOption.name}`);
  
  if (selectedOption.command) {
    console.log(`\n📋 Executing: ${selectedOption.command}`);
    console.log('⏳ Please wait...\n');
    
    try {
      execSync(selectedOption.command, { stdio: 'inherit' });
      console.log('\n✅ Deployment completed successfully!');
    } catch (error) {
      console.log('\n❌ Deployment failed. Please check the error messages above.');
      console.log('\n💡 Tips:');
      console.log('- Make sure you have the platform CLI installed');
      console.log('- Ensure you are logged in to the platform');
      console.log('- Check that all environment variables are set');
      console.log('- Review DEPLOYMENT.md for detailed instructions');
    }
  } else {
    console.log('\n📖 Please follow the detailed instructions in DEPLOYMENT.md');
    console.log('This will guide you through the manual setup process.');
  }
  
  rl.close();
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
  console.log('\n\n👋 Deployment cancelled. Goodbye!');
  process.exit(0);
});
