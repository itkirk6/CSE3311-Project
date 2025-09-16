#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Setup script to create environment files from templates
 * This script helps developers get started quickly by creating
 * the necessary environment files from the examples.
 */

const envFiles = [
  {
    source: path.join(__dirname, '..', 'env.example'),
    target: path.join(__dirname, '..', '.env'),
    description: 'Backend environment variables'
  },
  {
    source: path.join(__dirname, '..', 'frontend', '.env.local.example'),
    target: path.join(__dirname, '..', 'frontend', '.env.local'),
    description: 'Frontend environment variables'
  }
];

function createEnvFile(source, target, description) {
  try {
    if (fs.existsSync(target)) {
      console.log(`✅ ${description} already exists: ${target}`);
      return;
    }

    if (!fs.existsSync(source)) {
      console.log(`⚠️  Source file not found: ${source}`);
      return;
    }

    fs.copyFileSync(source, target);
    console.log(`✅ Created ${description}: ${target}`);
  } catch (error) {
    console.error(`❌ Error creating ${description}:`, error.message);
  }
}

function main() {
  console.log('🚀 Setting up OutdoorSpot environment files...\n');

  envFiles.forEach(({ source, target, description }) => {
    createEnvFile(source, target, description);
  });

  console.log('\n📝 Next steps:');
  console.log('1. Edit the .env files with your actual API keys and configuration');
  console.log('2. Run "npm run setup:db" to set up the database');
  console.log('3. Run "npm run dev" to start the development servers');
  console.log('\n🔑 Required API Keys:');
  console.log('- Google Maps API Key (for maps and geocoding)');
  console.log('- Weather API Key (for weather data)');
  console.log('- Cloudinary credentials (for image uploads)');
  console.log('- Email service API key (for notifications)');
}

if (require.main === module) {
  main();
}

module.exports = { createEnvFile };
