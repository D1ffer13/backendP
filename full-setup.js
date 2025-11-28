const { execSync } = require('child_process');
const fs = require('fs');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runScript(scriptName, description) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${description}`, 'cyan');
  log(`${'='.repeat(60)}\n`, 'cyan');
  
  try {
    execSync(`node ${scriptName}`, { stdio: 'inherit' });
    await sleep(1000);
    return true;
  } catch (error) {
    log(`\n❌ Ошибка при выполнении ${scriptName}`, 'red');
    return false;
  }
}

async function fullSetup() {
  log('\n' + '█'.repeat(60), 'magenta');
  log('█' + ' '.repeat(58) + '█', 'magenta');
  log('█' + '     🎓 EDUCATION CRM - ПОЛНАЯ УСТАНОВКА     '.padEnd(58) + '█', 'magenta');
  log('█' + ' '.repeat(58) + '█', 'magenta');
  log('█'.repeat(60) + '\n', 'magenta');

  log('Этот скрипт выполнит следующие действия:', 'yellow');
  log('1️⃣  Создание структуры проекта', 'blue');
  log('2️⃣  Установка всех зависимостей', 'blue');
  log('3️⃣  Настройка конфигурационных файлов\n', 'blue');

  // Шаг 1: Создание структуры
  const step1 = await runScript('setup-project.js', 'ШАГ 1: Создание структуры проекта');
  if (!step1) {
    log('\n❌ Не удалось создать структуру проекта', 'red');
    process.exit(1);
  }

  // Шаг 2: Установка зависимостей
  const step2 = await runScript('install-dependencies.js', 'ШАГ 2: Установка зависимостей');
  if (!step2) {
    log('\n⚠️  Установка зависимостей завершилась с ошибками', 'yellow');
  }

  // Финальное сообщение
  log('\n' + '█'.repeat(60), 'green');
  log('█' + ' '.repeat(58) + '█', 'green');
  log('█' + '          ✅ УСТАНОВКА ЗАВЕРШЕНА!          '.padEnd(58) + '█', 'green');
  log('█' + ' '.repeat(58) + '█', 'green');
  log('█'.repeat(60) + '\n', 'green');

  log('📋 ЧТО ДАЛЬШЕ?\n', 'yellow');
  
  log('1️⃣  Настройте базу данных:', 'cyan');
  log('   mysql -u root -p < database.sql\n', 'blue');

  log('2️⃣  Настройте backend/.env:', 'cyan');
  log('   Укажите параметры подключения к MySQL\n', 'blue');

  log('3️⃣  Запустите проект:', 'cyan');
  log('   node quick-start.js', 'blue');
  log('   ИЛИ запустите вручную:', 'yellow');
  log('   cd backend && npm run dev', 'blue');
  log('   cd frontend && npm run dev', 'blue');
  log('');

  log('📚 Дополнительные файлы:', 'cyan');
  log('   - README.md - документация проекта');
  log('   - database.sql - структура БД');
  log('   - .gitignore - настроен для Git\n');

  log('🎉 Удачи в разработке!', 'green');
}

fullSetup().catch(error => {
  log('\n❌ Критическая ошибка:', 'red');
  console.error(error);
  process.exit(1);
});