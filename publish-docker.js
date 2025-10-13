#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION_FILE = path.join(__dirname, 'version');

/**
 * Esegue un comando e restituisce l'output
 */
function exec(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
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
 * Legge la versione corrente dal file version
 */
function getCurrentVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    return '1.0.0';
  }
  return fs.readFileSync(VERSION_FILE, 'utf-8').trim();
}

/**
 * Incrementa la versione patch (x.y.z -> x.y.z+1)
 */
function incrementVersion(version) {
  const parts = version.split('.');
  if (parts.length !== 3) {
    throw new Error(`Invalid version format: ${version}`);
  }
  const [major, minor, patch] = parts.map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * Scrive la nuova versione nel file version e nel package.json del frontend
 */
function writeVersion(version) {
  // Aggiorna il file version
  fs.writeFileSync(VERSION_FILE, version, 'utf-8');
  console.log(`✓ Version updated to: ${version}`);
  
  // Aggiorna dockerVersion nel package.json del frontend
  const frontendPackageJsonPath = path.join(__dirname, 'frontend', 'package.json');
  if (fs.existsSync(frontendPackageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(frontendPackageJsonPath, 'utf-8'));
    packageJson.dockerVersion = version;
    fs.writeFileSync(frontendPackageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    console.log(`✓ Frontend package.json dockerVersion updated to: ${version}`);
  }
}

/**
 * Verifica se ci sono modifiche nei submoduli
 */
function checkSubmodulesStatus() {
  const status = exec('git status --porcelain', { silent: true });
  const hasSubmoduleChanges = status.includes('backend') || status.includes('frontend');
  
  if (!hasSubmoduleChanges) {
    console.log('ℹ No submodule changes detected');
    return false;
  }
  
  console.log('✓ Submodule changes detected');
  return true;
}

/**
 * Aggiorna i riferimenti dei submoduli
 */
function updateSubmodules() {
  console.log('Updating submodules...');
  exec('git submodule update --remote --merge');
  console.log('✓ Submodules updated');
}

/**
 * Committa e pusha le modifiche nel frontend submodule
 */
function commitAndPushFrontendSubmodule(version) {
  try {
    console.log('\nCommitting frontend package.json...');
    // Entra nel submodulo frontend
    process.chdir(path.join(__dirname, 'frontend'));
    
    // Aggiungi package.json
    exec('git add package.json');
    
    // Verifica se ci sono modifiche da committare
    const changedFiles = exec('git diff --cached --name-only', { silent: true });
    
    if (changedFiles && changedFiles.length > 0) {
      console.log(`Files to be committed in frontend:\n${changedFiles}`);
      
      // Commit
      exec(`git commit -m "chore: update dockerVersion to ${version}"`);
      console.log('✓ Frontend package.json committed');
      
      // Push
      exec('git push');
      console.log('✓ Frontend changes pushed');
    } else {
      console.log('ℹ No changes in frontend package.json');
    }
    
    // Torna alla root
    process.chdir(__dirname);
  } catch (error) {
    // Torna alla root anche in caso di errore
    process.chdir(__dirname);
    console.error('✗ Failed to commit frontend changes:', error.message);
    throw error;
  }
}

/**
 * Committa e pusha le modifiche con il messaggio trigger
 */
function commitAndPush(version) {
  try {
    // Aggiungi tutti i file nella root (inclusi i submoduli e version)
    exec('git add .');
    
    // Verifica se ci sono modifiche da committare
    const changedFiles = exec('git diff --cached --name-only', { silent: true });
    
    if (!changedFiles || changedFiles.length === 0) {
      console.log('ℹ No changes to commit');
      return false;
    }
    
    console.log(`\nFiles to be committed:\n${changedFiles}`);
    
    // Commit con messaggio trigger
    exec(`git commit -m "[publish] Update submodules to v${version} and trigger full build"`);
    console.log('✓ Changes committed');
    
    // Push
    exec('git push');
    console.log('✓ Changes pushed');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to commit and push:', error.message);
    throw error;
  }
}

/**
 * Comando principale
 */
function main() {
  const args = process.argv.slice(2);
  const forcePublish = args.includes('--force') || args.includes('-f');
  
  console.log('🚀 Starting publish process...\n');
  if (forcePublish) {
    console.log('⚠️  Force mode enabled\n');
  }
  
  try {
    // Aggiorna i submoduli
    updateSubmodules();
    
    // Verifica se ci sono modifiche (skip se force)
    if (!forcePublish && !checkSubmodulesStatus()) {
      console.log('\n✓ Nothing to publish');
      console.log('💡 Use --force or -f to publish anyway\n');
      return;
    }
    
    // Incrementa la versione
    const currentVersion = getCurrentVersion();
    const newVersion = incrementVersion(currentVersion);
    writeVersion(newVersion);
    
    // Committa e pusha il frontend submodule prima
    commitAndPushFrontendSubmodule(newVersion);
    
    // Committa e pusha la root (con riferimenti submoduli aggiornati)
    const published = commitAndPush(newVersion);
    
    if (published) {
      console.log(`\n✅ Successfully published v${newVersion}! The full build pipeline will be triggered.`);
    } else {
      console.log('\n✓ Publish completed (no changes)');
    }
  } catch (error) {
    console.error('\n❌ Publish failed:', error.message);
    process.exit(1);
  }
}

main();
