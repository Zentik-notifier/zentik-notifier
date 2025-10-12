#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const VERSION_FILE = path.join(__dirname, 'version');

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
 * Scrive la nuova versione nel file version
 */
function writeVersion(version) {
  fs.writeFileSync(VERSION_FILE, version, 'utf-8');
  console.log(`✓ Version updated to: ${version}`);
}

/**
 * Commit e push delle modifiche
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
 * Comando principale
 */
function main() {
  const command = process.argv[2];

  switch (command) {
    case 'get':
      // Restituisce la versione corrente
      console.log(getCurrentVersion());
      break;

    case 'increment':
      // Incrementa la versione e la salva
      const currentVersion = getCurrentVersion();
      const newVersion = incrementVersion(currentVersion);
      writeVersion(newVersion);
      console.log(newVersion);
      break;

    case 'commit':
      // Commit e push della nuova versione
      const version = getCurrentVersion();
      commitAndPush(version);
      break;

    default:
      console.error('Usage:');
      console.error('  node docker-full.js get       - Get current version');
      console.error('  node docker-full.js increment - Increment patch version');
      console.error('  node docker-full.js commit    - Commit and push version file');
      process.exit(1);
  }
}

main();
