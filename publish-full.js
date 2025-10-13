#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Esegue un comando e restituisce l'output
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
 * Verifica se ci sono modifiche in un submodulo specifico
 */
function hasSubmoduleChanges(submoduleName) {
  const submodulePath = path.join(__dirname, submoduleName);
  
  // Controlla se ci sono modifiche non committate
  const status = exec('git status --porcelain', { silent: true, cwd: submodulePath, ignoreError: true });
  if (status && status.length > 0) {
    console.log(`✓ Uncommitted changes detected in ${submoduleName}`);
    return true;
  }
  
  // Controlla se ci sono commit non pushati
  const unpushed = exec('git log @{u}.. --oneline', { silent: true, cwd: submodulePath, ignoreError: true });
  if (unpushed && unpushed.length > 0) {
    console.log(`✓ Unpushed commits detected in ${submoduleName}`);
    return true;
  }
  
  return false;
}

/**
 * Incrementa la versione patch nel package.json di un submodulo
 */
function incrementSubmoduleVersion(submoduleName) {
  const packageJsonPath = path.join(__dirname, submoduleName, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`⚠️  No package.json found in ${submoduleName}, skipping version increment`);
    return null;
  }
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const currentVersion = packageJson.version || '0.0.0';
  const parts = currentVersion.split('.');
  const [major, minor, patch] = parts.map(Number);
  const newVersion = `${major}.${minor}.${patch + 1}`;
  
  packageJson.version = newVersion;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  
  console.log(`✓ ${submoduleName} version: ${currentVersion} → ${newVersion}`);
  return newVersion;
}

/**
 * Committa e pusha le modifiche in un submodulo
 */
function commitAndPushSubmodule(submoduleName, message) {
  const submodulePath = path.join(__dirname, submoduleName);
  
  try {
    console.log(`\nCommitting ${submoduleName}...`);
    
    // Aggiungi tutti i file
    exec('git add .', { cwd: submodulePath });
    
    // Verifica se ci sono modifiche da committare
    const changedFiles = exec('git diff --cached --name-only', { silent: true, cwd: submodulePath });
    
    if (!changedFiles || changedFiles.length === 0) {
      console.log(`ℹ No changes to commit in ${submoduleName}`);
      return false;
    }
    
    console.log(`Files to be committed in ${submoduleName}:\n${changedFiles}`);
    
    // Commit
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
 * Esegue il deploy Railway per un submodulo
 */
function deployToRailway(submoduleName, newVersion) {
  const submodulePath = path.join(__dirname, submoduleName);
  const deployScript = submoduleName === 'backend' ? 'deploy:patch' : 'release:web:patch';
  
  try {
    console.log(`\n🚂 Deploying ${submoduleName} to Railway...`);
    
    // Verifica se esiste lo script nel package.json
    const packageJsonPath = path.join(submodulePath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (!packageJson.scripts || !packageJson.scripts[deployScript]) {
      console.log(`⚠️  No ${deployScript} script found in ${submoduleName}, skipping Railway deploy`);
      return false;
    }
    
    // Esegui il deploy
    exec(`npm run ${deployScript}`, { cwd: submodulePath });
    console.log(`✓ ${submoduleName} deployed to Railway`);
    
    return true;
  } catch (error) {
    console.error(`✗ Failed to deploy ${submoduleName} to Railway:`, error.message);
    throw error;
  }
}

/**
 * Esegue EAS update per il frontend
 */
function runEasUpdate() {
  const frontendPath = path.join(__dirname, 'frontend');
  
  try {
    console.log('\n📱 Running EAS update...');
    
    // Verifica se esiste lo script update:patch
    const packageJsonPath = path.join(frontendPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    if (!packageJson.scripts || !packageJson.scripts['update:patch']) {
      console.log('⚠️  No update:patch script found in frontend, skipping EAS update');
      return false;
    }
    
    // Esegui l'update
    exec('npm run update:patch', { cwd: frontendPath });
    console.log('✓ EAS update completed');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to run EAS update:', error.message);
    throw error;
  }
}

/**
 * Aggiorna i riferimenti dei submoduli nella root
 */
function updateRootSubmoduleReferences() {
  try {
    console.log('\n📦 Updating root submodule references...');
    
    // Aggiungi i riferimenti dei submoduli
    exec('git add frontend backend');
    
    // Verifica se ci sono modifiche
    const changedFiles = exec('git diff --cached --name-only', { silent: true });
    
    if (!changedFiles || changedFiles.length === 0) {
      console.log('ℹ No submodule reference changes to commit');
      return false;
    }
    
    console.log(`Submodule references to be updated:\n${changedFiles}`);
    
    // Commit
    exec('git commit -m "chore: update submodule references"');
    console.log('✓ Root submodule references committed');
    
    // Push
    exec('git push');
    console.log('✓ Root changes pushed');
    
    return true;
  } catch (error) {
    console.error('✗ Failed to update root references:', error.message);
    throw error;
  }
}

/**
 * Comando principale
 */
function main() {
  const args = process.argv.slice(2);
  const skipDocker = args.includes('--skip-docker');
  const skipRailway = args.includes('--skip-railway');
  const skipEas = args.includes('--skip-eas');
  const forcePublish = args.includes('--force') || args.includes('-f');
  
  console.log('🚀 Starting full publish process...\n');
  if (forcePublish) {
    console.log('⚠️  Force mode enabled - will increment all versions\n');
  }
  
  const results = {
    frontend: { hasChanges: false, version: null, railway: false, eas: false },
    backend: { hasChanges: false, version: null, railway: false },
    docker: false
  };
  
  try {
    // 1. Aggiorna i submoduli
    console.log('📥 Updating submodules...');
    exec('git submodule update --remote --merge');
    console.log('✓ Submodules updated\n');
    
    // 2. Controlla modifiche frontend
    console.log('🔍 Checking frontend changes...');
    results.frontend.hasChanges = forcePublish || hasSubmoduleChanges('frontend');
    
    if (results.frontend.hasChanges) {
      // Incrementa versione frontend
      results.frontend.version = incrementSubmoduleVersion('frontend');
      
      // Committa e pusha frontend
      commitAndPushSubmodule('frontend', `chore: bump version to ${results.frontend.version}`);
      
      // Deploy Railway frontend (se non skippato)
      if (!skipRailway) {
        results.frontend.railway = deployToRailway('frontend', results.frontend.version);
      }
      
      // EAS update (se non skippato)
      if (!skipEas) {
        results.frontend.eas = runEasUpdate();
      }
    } else {
      console.log('ℹ No changes in frontend, skipping\n');
    }
    
    // 3. Controlla modifiche backend
    console.log('🔍 Checking backend changes...');
    results.backend.hasChanges = forcePublish || hasSubmoduleChanges('backend');
    
    if (results.backend.hasChanges) {
      // Incrementa versione backend
      results.backend.version = incrementSubmoduleVersion('backend');
      
      // Committa e pusha backend
      commitAndPushSubmodule('backend', `chore: bump version to ${results.backend.version}`);
      
      // Deploy Railway backend (se non skippato)
      if (!skipRailway) {
        results.backend.railway = deployToRailway('backend', results.backend.version);
      }
    } else {
      console.log('ℹ No changes in backend, skipping\n');
    }
    
    // 4. Docker build (se ci sono modifiche in frontend o backend e non skippato)
    if (!skipDocker && (results.frontend.hasChanges || results.backend.hasChanges)) {
      console.log('🐳 Running Docker publish...');
      exec('node publish-docker.js --force');
      results.docker = true;
      console.log('✓ Docker publish completed');
    } else if (skipDocker) {
      console.log('ℹ Docker publish skipped (--skip-docker flag)\n');
    } else {
      console.log('ℹ No changes for Docker build, skipping\n');
    }
    
    // 5. Aggiorna riferimenti submoduli nella root
    if (results.frontend.hasChanges || results.backend.hasChanges) {
      updateRootSubmoduleReferences();
    }
    
    // Riepilogo finale
    console.log('\n' + '='.repeat(60));
    console.log('📊 PUBLISH SUMMARY');
    console.log('='.repeat(60));
    
    if (results.frontend.hasChanges) {
      console.log(`\n✅ Frontend v${results.frontend.version}`);
      console.log(`   - Railway: ${results.frontend.railway ? '✓ Deployed' : '✗ Skipped/Failed'}`);
      console.log(`   - EAS Update: ${results.frontend.eas ? '✓ Published' : '✗ Skipped/Failed'}`);
    } else {
      console.log('\nℹ️  Frontend: No changes');
    }
    
    if (results.backend.hasChanges) {
      console.log(`\n✅ Backend v${results.backend.version}`);
      console.log(`   - Railway: ${results.backend.railway ? '✓ Deployed' : '✗ Skipped/Failed'}`);
    } else {
      console.log('\nℹ️  Backend: No changes');
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
    console.error('   --force, -f     Force publish all submodules (increment versions)');
    console.error('   --skip-docker   Skip Docker build');
    console.error('   --skip-railway  Skip Railway deploys');
    console.error('   --skip-eas      Skip EAS update\n');
    process.exit(1);
  }
}

main();
