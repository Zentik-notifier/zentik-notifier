#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get the project root directory (one level up from scripts/)
const PROJECT_ROOT = path.resolve(__dirname, '..');

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
 * Checks if there are changes in a specific submodule
 */
function hasSubmoduleChanges(submoduleName) {
  const submodulePath = path.join(PROJECT_ROOT, submoduleName);
  
  // Check for uncommitted changes
  const status = exec('git status --porcelain', { silent: true, cwd: submodulePath, ignoreError: true });
  if (status && status.length > 0) {
    console.log(`✓ Uncommitted changes detected in ${submoduleName}`);
    return true;
  }
  
  // Check for unpushed commits
  const unpushed = exec('git log @{u}.. --oneline', { silent: true, cwd: submodulePath, ignoreError: true });
  if (unpushed && unpushed.length > 0) {
    console.log(`✓ Unpushed commits detected in ${submoduleName}`);
    return true;
  }
  
  return false;
}

/**
 * Checks if the submodule pointer in the root is updated
 */
function hasSubmodulePointerChanges(submoduleName) {
  // Check if the submodule in root has changes
  const status = exec(`git status --porcelain ${submoduleName}`, { silent: true, ignoreError: true, cwd: PROJECT_ROOT });
  if (status && status.length > 0) {
    console.log(`✓ Submodule pointer changes detected in root for ${submoduleName}`);
    return true;
  }
  
  return false;
}

/**
 * Increments the version in a submodule's package.json
 * @param {string} submoduleName - Name of the submodule
 * @param {string} versionType - Type of version increment: 'patch', 'minor', or 'major' (default: 'patch')
 */
function incrementSubmoduleVersion(submoduleName, versionType = 'patch') {
  const packageJsonPath = path.join(PROJECT_ROOT, submoduleName, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  No package.json found in ${submoduleName}, skipping version increment`);
    return null;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version || '0.0.0';
  const parts = currentVersion.split('.');
  let [major, minor, patch] = parts.map(Number);
  
  let newVersion;
  switch (versionType.toLowerCase()) {
    case 'major':
      major += 1;
      minor = 0;
      patch = 0;
      newVersion = `${major}.${minor}.${patch}`;
      break;
    case 'minor':
      minor += 1;
      patch = 0;
      newVersion = `${major}.${minor}.${patch}`;
      break;
    case 'patch':
    default:
      patch += 1;
      newVersion = `${major}.${minor}.${patch}`;
      break;
  }
  
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  
  console.log(`✓ ${submoduleName} version: ${currentVersion} → ${newVersion} (${versionType})`);
  return newVersion;
}

/**
 * Commits and pushes changes in a submodule
 */
function commitAndPushSubmodule(submoduleName, message) {
  const submodulePath = path.join(PROJECT_ROOT, submoduleName);
  
  try {
    console.log(`\nCommitting ${submoduleName}...`);
    
    // Add all files
    exec('git add .', { cwd: submodulePath });
    
    // Check if there are changes to commit
    const changedFiles = exec('git diff --cached --name-only', { silent: true, cwd: submodulePath });
    
    if (!changedFiles || changedFiles.length === 0) {
      console.log(`ℹ No changes to commit in ${submoduleName}`);
      return false;
    }
    
    console.log(`Files to be committed in ${submoduleName}:\n${changedFiles}`);
    
    // Commit without [skip ci] to allow pipeline triggers
    exec(`git commit -m "${message}"`, { cwd: submodulePath });
    console.log(`✓ ${submoduleName} committed`);
    
    // Push
    exec('git push', { cwd: submodulePath });
    console.log(`✓ ${submoduleName} pushed`);
    
    return true;
  } catch (error) {
    console.error(`✗ Failed to commit ${submoduleName}:`, error.message);
    throw error;
  }
}

/**
 * Creates and pushes a tag in the submodule
 */
function createAndPushTag(submoduleName, version) {
  const submodulePath = path.join(PROJECT_ROOT, submoduleName);
  
  try {
    const tagName = `v${version}`;
    
    console.log(`\n🏷️  Creating tag ${tagName} for ${submoduleName}...`);
    
    // Check if the tag already exists
    const existingTag = exec(`git tag -l "${tagName}"`, { silent: true, cwd: submodulePath, ignoreError: true });
    if (existingTag && existingTag.trim() === tagName) {
      console.log(`ℹ Tag ${tagName} already exists in ${submoduleName}, skipping`);
      return false;
    }
    
    // Create the tag
    exec(`git tag -a "${tagName}" -m "Release ${tagName}"`, { cwd: submodulePath });
    console.log(`✓ Tag ${tagName} created`);
    
    // Push the tag
    exec(`git push origin "${tagName}"`, { cwd: submodulePath });
    console.log(`✓ Tag ${tagName} pushed`);
    
    return true;
  } catch (error) {
    console.error(`✗ Failed to create tag for ${submoduleName}:`, error.message);
    throw error;
  }
}

/**
 * Manually updates package-lock.json
 */
function updatePackageLock(submoduleName) {
  const submodulePath = path.join(PROJECT_ROOT, submoduleName);
  const packageJsonPath = path.join(submodulePath, 'package.json');
  const packageLockPath = path.join(submodulePath, 'package-lock.json');
  
  try {
    console.log(`\n📦 Updating package-lock.json for ${submoduleName}...`);
    
    // Read package.json to get the new version
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const newVersion = packageJson.version;
    
    // Read package-lock.json
    if (fs.existsSync(packageLockPath)) {
      const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
      
      // Update version in package-lock.json
      packageLock.version = newVersion;
      
      // Also update packages[""] if it exists (npm v7+)
      if (packageLock.packages && packageLock.packages[""]) {
        packageLock.packages[""].version = newVersion;
      }
      
      // Write the updated file
      fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n', 'utf8');
      console.log(`✓ package-lock.json updated to version ${newVersion}`);
    } else {
      console.log(`ℹ No package-lock.json found for ${submoduleName}`);
    }
    
    return true;
  } catch (error) {
    console.warn(`⚠️  Failed to update package-lock.json for ${submoduleName}: ${error.message}`);
    return false;
  }
}

/**
 * Updates submodule references in the root
 */
function updateRootSubmoduleReferences() {
  try {
    console.log('\n📦 Updating root submodule references...');
    
    // Add submodule references
    exec('git add frontend backend docs', { cwd: PROJECT_ROOT });
    
    // Check if there are changes
    const changedFiles = exec('git diff --cached --name-only', { silent: true, cwd: PROJECT_ROOT });
    
    if (!changedFiles || changedFiles.length === 0) {
      console.log('ℹ No submodule reference changes to commit');
      return false;
    }
    
    console.log(`Submodule references to be updated:\n${changedFiles}`);
    
    // Commit without [skip ci] to allow pipeline triggers
    exec('git commit -m "chore: update submodule references"', { cwd: PROJECT_ROOT });
    console.log('✓ Root submodule references committed');
    
    // Push
    exec('git push', { cwd: PROJECT_ROOT });
    console.log('✓ Root changes pushed');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to update root references:', error.message);
    throw error;
  }
}

/**
 * Main command
 */
function main() {
  const args = process.argv.slice(2);
  const skipDocker = args.includes('--skip-docker');
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
  
  console.log('🚀 Starting full publish process...\n');
  console.log(`📌 Version increment type: ${versionType}\n`);
  if (forcePublish) {
    console.log('⚠️  Force mode enabled - will increment all versions\n');
  }
  
  const results = {
    frontend: { hasChanges: false, version: null },
    backend: { hasChanges: false, version: null },
    docs: { hasChanges: false, version: null },
    docker: false
  };
  
  try {
    // 1. Update submodules
    console.log('📥 Updating submodules...');
    exec('git submodule update --remote --merge', { cwd: PROJECT_ROOT });
    console.log('✓ Submodules updated\n');
    
    // 2. Check frontend changes
    console.log('🔍 Checking frontend changes...');
    const frontendHasLocalChanges = hasSubmoduleChanges('frontend');
    const frontendHasPointerChanges = hasSubmodulePointerChanges('frontend');
    results.frontend.hasChanges = forcePublish || frontendHasLocalChanges || frontendHasPointerChanges;
    
    if (results.frontend.hasChanges) {
      // Increment frontend version
      results.frontend.version = incrementSubmoduleVersion('frontend', versionType);
      
      // Update package-lock.json
      updatePackageLock('frontend');
      
      // Commit and push frontend
      commitAndPushSubmodule('frontend', `chore: bump version to ${results.frontend.version}`);
      
      // Create and push tag to trigger GitHub pipelines (EAS + Railway)
      createAndPushTag('frontend', results.frontend.version);
      console.log('   → GitHub pipelines will handle EAS update and Railway deploy');
    } else {
      console.log('ℹ No changes in frontend, skipping\n');
    }
    
    // 3. Check backend changes
    console.log('🔍 Checking backend changes...');
    const backendHasLocalChanges = hasSubmoduleChanges('backend');
    const backendHasPointerChanges = hasSubmodulePointerChanges('backend');
    results.backend.hasChanges = forcePublish || backendHasLocalChanges || backendHasPointerChanges;
    
    if (results.backend.hasChanges) {
      // Increment backend version
      results.backend.version = incrementSubmoduleVersion('backend', versionType);
      
      // Update package-lock.json
      updatePackageLock('backend');
      
      // Commit and push backend
      commitAndPushSubmodule('backend', `chore: bump version to ${results.backend.version}`);
      
      // Create and push tag to trigger GitHub pipeline (Railway deploy)
      createAndPushTag('backend', results.backend.version);
      console.log('   → GitHub pipeline will handle Railway deploy');
    } else {
      console.log('ℹ No changes in backend, skipping\n');
    }
    
    // 4. Check docs changes
    console.log('🔍 Checking docs changes...');
    const docsHasLocalChanges = hasSubmoduleChanges('docs');
    const docsHasPointerChanges = hasSubmodulePointerChanges('docs');
    results.docs.hasChanges = forcePublish || docsHasLocalChanges || docsHasPointerChanges;
    
    if (results.docs.hasChanges) {
      // Increment docs version
      results.docs.version = incrementSubmoduleVersion('docs', versionType);
      
      // Update package-lock.json
      updatePackageLock('docs');
      
      // Commit and push docs
      commitAndPushSubmodule('docs', `chore: bump version to ${results.docs.version}`);
      
      // Create and push tag to trigger GitHub pipeline (Railway deploy)
      createAndPushTag('docs', results.docs.version);
      console.log('   → GitHub pipeline will handle Railway deploy');
    } else {
      console.log('ℹ No changes in docs, skipping\n');
    }
    
    // 5. Docker build (if there are changes in frontend or backend and not skipped)
    if (!skipDocker && (results.frontend.hasChanges || results.backend.hasChanges)) {
      console.log('🐳 Running Docker publish...');
      const publishDockerPath = path.join(__dirname, 'publish-docker.js');
      exec(`node "${publishDockerPath}" --force`);
      results.docker = true;
      console.log('✓ Docker publish completed');
    } else if (skipDocker) {
      console.log('ℹ Docker publish skipped (--skip-docker flag)\n');
    } else {
      console.log('ℹ No changes for Docker build, skipping\n');
    }
    
    // 6. Update submodule references in root
    if (results.frontend.hasChanges || results.backend.hasChanges || results.docs.hasChanges) {
      updateRootSubmoduleReferences();
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PUBLISH SUMMARY');
    console.log('='.repeat(60));
    
    if (results.frontend.hasChanges) {
      console.log(`\n✅ Frontend v${results.frontend.version}`);
      console.log(`   - Tag: v${results.frontend.version} created and pushed`);
      console.log(`   - GitHub pipelines will handle EAS update and Railway deploy`);
    } else {
      console.log('\nℹ️  Frontend: No changes');
    }
    
    if (results.backend.hasChanges) {
      console.log(`\n✅ Backend v${results.backend.version}`);
      console.log(`   - Tag: v${results.backend.version} created and pushed`);
      console.log(`   - GitHub pipeline will handle Railway deploy`);
    } else {
      console.log('\nℹ️  Backend: No changes');
    }
    
    if (results.docs.hasChanges) {
      console.log(`\n✅ Docs v${results.docs.version}`);
      console.log(`   - Tag: v${results.docs.version} created and pushed`);
      console.log(`   - GitHub pipeline will handle Railway deploy`);
    } else {
      console.log('\nℹ️  Docs: No changes');
    }
    
    if (results.docker) {
      console.log('\n✅ Docker: Published to GHCR');
    } else {
      console.log('\nℹ️  Docker: Skipped');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Full publish process completed!\n');
    
  } catch (error) {
    console.error('\n❌ Publish failed:', error.message);
    console.error('\n💡 Tip: You can use flags to control the publish process:');
    console.error('   --force, -f        Force publish all submodules (increment versions)');
    console.error('   --patch            Increment patch version (default)');
    console.error('   --minor            Increment minor version');
    console.error('   --major            Increment major version');
    console.error('   --skip-docker      Skip Docker build');
    console.error('\n📝 Note: Railway and EAS deploys are handled automatically by GitHub pipelines\n');
    process.exit(1);
  }
}

main();
