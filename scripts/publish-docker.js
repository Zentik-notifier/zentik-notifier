#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory (one level up from scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '..');
const VERSION_FILE = path.join(PROJECT_ROOT, 'version');

/**
 * Executes a command and returns the output
 */
function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
      cwd: options.cwd || process.cwd(),
      ...options 
    });
    return result ? result.trim() : '';
  } catch (error) {
    if (options.ignoreError) {
      return '';
    }
    throw error;
  }
}

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
 * @param {string} version - Current version (x.y.z format)
 * @param {string} versionType - Type of version increment: 'patch', 'minor', or 'major' (default: 'patch')
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
 * Writes the new version to the version file and frontend package.json
 */
function writeVersion(version) {
  // Update the version file
  fs.writeFileSync(VERSION_FILE, version, 'utf-8');
  console.log(`✓ Version updated to: ${version}`);
  
  // Update dockerVersion in frontend package.json
  const frontendPackageJsonPath = path.join(PROJECT_ROOT, 'frontend', 'package.json');
  if (fs.existsSync(frontendPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(frontendPackageJsonPath, 'utf-8'));
    packageJson.dockerVersion = version;
    fs.writeFileSync(frontendPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(`✓ Frontend package.json dockerVersion updated to: ${version}`);
  }
}

/**
 * Checks if there are changes in submodules
 */
function checkSubmodulesStatus() {
  const status = exec('git status --porcelain', { silent: true, cwd: PROJECT_ROOT });
  const hasSubmoduleChanges = status.includes('backend') || status.includes('frontend');
  
  if (!hasSubmoduleChanges) {
    console.log('ℹ No submodule changes detected');
    return false;
  }
  
  console.log('✓ Submodule changes detected');
  return true;
}

/**
 * Updates submodule references
 */
function updateSubmodules() {
  console.log('Updating submodules...');
  exec('git submodule update --remote --merge', { cwd: PROJECT_ROOT });
  console.log('✓ Submodules updated');
}

/**
 * Commits and pushes changes in the frontend submodule
 */
function commitAndPushFrontendSubmodule(version) {
  const frontendPath = path.join(PROJECT_ROOT, 'frontend');
  try {
    console.log('\nCommitting frontend package.json...');
    
    // Add package.json
    exec('git add package.json', { cwd: frontendPath });
    
    // Check if there are changes to commit
    const changedFiles = exec('git diff --cached --name-only', { silent: true, cwd: frontendPath });
    
    if (changedFiles && changedFiles.length > 0) {
      console.log(`Files to be committed in frontend:\n${changedFiles}`);
      
      // Commit
      exec(`git commit -m "chore: update dockerVersion to ${version} [skip ci]"`, { cwd: frontendPath });
      console.log('✓ Frontend package.json committed');
      
      // Push
      exec('git push', { cwd: frontendPath });
      console.log('✓ Frontend changes pushed');
    } else {
      console.log('ℹ No changes in frontend package.json');
    }
  } catch (error) {
    console.error('✗ Failed to commit frontend changes:', error.message);
    throw error;
  }
}

/**
 * Commits and pushes changes with the trigger message
 */
function commitAndPush(version) {
  try {
    // Add all files in root (including submodules and version)
    exec('git add .', { cwd: PROJECT_ROOT });
    
    // Check if there are changes to commit
    const changedFiles = exec('git diff --cached --name-only', { silent: true, cwd: PROJECT_ROOT });
    
    if (!changedFiles || changedFiles.length === 0) {
      console.log('ℹ No changes to commit');
      return false;
    }
    
    console.log(`\nFiles to be committed:\n${changedFiles}`);
    
    // Commit with trigger message
    exec(`git commit -m "[publish] Update submodules to v${version} and trigger full build"`, { cwd: PROJECT_ROOT });
    console.log('✓ Changes committed');
    
    // Push
    exec('git push', { cwd: PROJECT_ROOT });
    console.log('✓ Changes pushed');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to commit and push:', error.message);
    throw error;
  }
}

/**
 * Main command
 */
function main() {
  const args = process.argv.slice(2);
  const forcePublish = args.includes('--force') || args.includes('-f');
  
  // Determine version type (default: patch)
  let versionType = 'patch';
  if (args.includes('--major')) {
    versionType = 'major';
  } else if (args.includes('--minor')) {
    versionType = 'minor';
  } else if (args.includes('--patch')) {
    versionType = 'patch';
  }
  
  console.log('🚀 Starting publish process...\n');
  console.log(`📌 Version increment type: ${versionType}\n`);
  if (forcePublish) {
    console.log('⚠️  Force mode enabled\n');
  }
  
  try {
    // Update submodules
    updateSubmodules();
    
    // Check if there are changes (skip if force)
    if (!forcePublish && !checkSubmodulesStatus()) {
      console.log('\n✓ Nothing to publish');
      console.log('💡 Use --force or -f to publish anyway\n');
      return;
    }
    
    // Increment version
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion, versionType);
    writeVersion(newVersion);
    
    // Commit and push frontend submodule first
    commitAndPushFrontendSubmodule(newVersion);
    
    // Commit and push root (with updated submodule references)
    const published = commitAndPush(newVersion);
    
    if (published) {
      console.log(`\n✅ Successfully published v${newVersion}! The full build pipeline will be triggered.`);
    } else {
      console.log('\n✓ Publish completed (no changes)');
    }
  } catch (error) {
    console.error('\n❌ Publish failed:', error.message);
    console.error('\n💡 Tip: You can use flags to control the publish process:');
    console.error('   --force, -f        Force publish even without changes');
    console.error('   --patch            Increment patch version (default)');
    console.error('   --minor            Increment minor version');
    console.error('   --major            Increment major version\n');
    process.exit(1);
  }
}

main();
