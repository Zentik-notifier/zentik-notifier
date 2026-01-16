#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION_FILE = path.join(__dirname, 'version');

/**
 * Reads the current version from the version file
 */
function getCurrentVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    return '1.0.0';
  }
  return fs.readFileSync(VERSION_FILE, 'utf-8').trim();
}

/**
 * Increments the version based on the specified type
 * @param {string} version - Current version (x.y.z)
 * @param {string} versionType - Increment type: 'patch', 'minor', or 'major' (default: 'patch')
 */
function incrementVersion(version, versionType = 'patch') {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`);
  }
  let [major, minor, patch] = parts.map(Number);
  
  switch (versionType.toLowerCase()) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      break;
    case 'patch':
    default:
      patch += 1;
      break;
  }
  
  return `${major}.${minor}.${patch}`;
}

/**
 * Writes the new version to the version file
 */
function writeVersion(version) {
  fs.writeFileSync(VERSION_FILE, version, 'utf-8');
  console.log(`✓ Version updated to: ${version}`);
}

/**
 * Commits and pushes changes
 */
function commitAndPush(version) {
  try {
    execSync('git config user.name "GitHub Actions"', { stdio: 'inherit' });
    execSync('git config user.email "actions@github.com"', { stdio: 'inherit' });
    execSync('git add version', { stdio: 'inherit' });
    execSync(`git commit -m "chore: bump version to ${version} [skip ci]"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log(`✓ Version ${version} committed and pushed`);
  } catch (error) {
    console.error('✗ Failed to commit and push:', error.message);
    throw error;
  }
}

/**
 * Main command
 */
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'get':
      // Returns the current version
      console.log(getCurrentVersion());
      break;

    case 'increment':
      // Increments the version (doesn't save it, only calculates)
      const versionType = process.argv[3] || 'patch';
      const currentVersion = getCurrentVersion();
      const newVersion = incrementVersion(currentVersion, versionType);
      // Don't save here, just return the new version
      // The workflow will handle saving it if needed
      console.log(newVersion);
      break;

    case 'commit':
      // Commit and push the new version
      const version = getCurrentVersion();
      commitAndPush(version);
      break;

    default:
      console.error('Usage:');
      console.error('  node docker-full.js get                    - Get current version');
      console.error('  node docker-full.js increment [patch|minor|major] - Increment version (default: patch)');
      console.error('  node docker-full.js commit                 - Commit and push version file');
      process.exit(1);
  }
}

main();
