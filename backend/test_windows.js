// Test Windows API directly
const { exec } = require('child_process');

console.log('=== TESTING WINDOWS API ===');

// Test 1: Try tasklist command
try {
  const { stdout } = exec('tasklist /fo csv | findstr /i ".exe"', { encoding: 'utf8' });
  console.log('Tasklist output (first 500 chars):', stdout.substring(0, 500));
  
  // Parse some common applications
  const lines = stdout.split('\n');
  const apps = lines.filter(line => {
    const parts = line.split(',');
    return parts.length >= 2 && parts[0] && parts[0] !== '"Image Name"';
  }).map(line => {
    const parts = line.split(',');
    return {
      name: parts[0].replace(/"/g, ''),
      pid: parts[1],
      sessionName: parts[2],
      memUsage: parts[4],
      title: parts[8] || ''
    };
  });
  
  console.log('Found apps:', apps.length);
  apps.slice(0, 10).forEach((app, i) => {
    console.log(`  ${i+1}. ${app.name} (${app.title})`);
  });
  
} catch (error) {
  console.error('Tasklist error:', error.message);
}

// Test 2: Try PowerShell Get-Process
try {
  const { stdout } = exec('powershell "Get-Process | Select-Object Name, MainWindowTitle | ConvertTo-Json"', { encoding: 'utf8' });
  console.log('PowerShell output:', stdout);
} catch (error) {
  console.error('PowerShell error:', error.message);
}

console.log('=== WINDOWS API TEST COMPLETE ===');
