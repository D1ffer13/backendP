const { spawn } = require('child_process');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function startServer(name, command, cwd, color) {
  log(`\n🚀 Запуск ${name}...`, color);
  
  const isWindows = process.platform === 'win32';
  const shell = isWindows ? 'cmd.exe' : 'sh';
  const shellArg = isWindows ? '/c' : '-c';
  
  const server = spawn(shell, [shellArg, command], {
    cwd: path.join(__dirname, cwd),
    stdio: 'pipe'
  });

  server.stdout.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[${name}] ${output}`, color);
    }
  });

  server.stderr.on('data', (data) => {
    const output = data.toString().trim();
    if (output) {
      log(`[${name}] ${output}`, 'yellow');
    }
  });

  server.on('close', (code) => {
    log(`\n❌ ${name} остановлен с кодом ${code}`, 'red');
  });

  return server;
}

log('\n' + '='.repeat(60), 'green');
log('🎓 EDUCATION CRM - Запуск системы', 'green');
log('='.repeat(60) + '\n', 'green');

const backend = startServer('Backend', 'npm run dev', 'backend', 'blue');
const frontend = startServer('Frontend', 'npm run dev', 'frontend', 'cyan');

log('\n✅ Оба сервера запущены!', 'green');
log('\n🌐 Доступ к приложению:', 'yellow');
log('   Backend:  http://localhost:5000', 'blue');
log('   Frontend: http://localhost:3000', 'cyan');
log('\n⚠️  Нажмите Ctrl+C для остановки обоих серверов\n', 'yellow');

// Обработка завершения
process.on('SIGINT', () => {
  log('\n\n🛑 Остановка серверов...', 'yellow');
  backend.kill();
  frontend.kill();
  setTimeout(() => {
    log('✅ Серверы остановлены', 'green');
    process.exit(0);
  }, 1000);
});