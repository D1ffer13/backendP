const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, cwd) {
  try {
    log(`\n▶️  Выполняется: ${command}`, 'blue');
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      encoding: 'utf-8'
    });
    return true;
  } catch (error) {
    log(`❌ Ошибка при выполнении команды: ${command}`, 'red');
    return false;
  }
}

// Backend package.json
const backendPackageJson = {
  "name": "education-crm-backend",
  "version": "1.0.0",
  "description": "Backend for Education CRM",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "multer": "^1.4.5-lts.1",
    "xlsx": "^0.18.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["crm", "education", "nodejs"],
  "author": "",
  "license": "ISC"
};

// Frontend package.json
const frontendPackageJson = {
  "name": "education-crm-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "date-fns": "^2.30.0",
    "react-calendar": "^4.7.0",
    "xlsx": "^0.18.5",
    "react-icons": "^4.12.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
};

// Vite config
const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
`;

// Backend .env.example
const backendEnvExample = `# Server Configuration
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=education_crm

# JWT Secret (generate a random string)
JWT_SECRET=your_jwt_secret_here
`;

// Frontend .env.example
const frontendEnvExample = `# API Configuration
VITE_API_URL=http://localhost:5000/api
`;

// Frontend index.html
const indexHtml = `<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Учебный центр - CRM</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`;

async function setupProject() {
  log('\n🚀 Начинается настройка проекта Education CRM\n', 'green');

  // Проверка существования папок
  const backendExists = fs.existsSync('backend');
  const frontendExists = fs.existsSync('frontend');

  if (!backendExists || !frontendExists) {
    log('❌ Папки backend или frontend не найдены!', 'red');
    log('⚠️  Сначала запустите setup-project.js для создания структуры проекта', 'yellow');
    process.exit(1);
  }

  // Создание package.json для backend
  log('\n📦 Создание package.json для Backend...', 'blue');
  fs.writeFileSync(
    path.join('backend', 'package.json'),
    JSON.stringify(backendPackageJson, null, 2)
  );
  log('✅ Backend package.json создан', 'green');

  // Создание package.json для frontend
  log('\n📦 Создание package.json для Frontend...', 'blue');
  fs.writeFileSync(
    path.join('frontend', 'package.json'),
    JSON.stringify(frontendPackageJson, null, 2)
  );
  log('✅ Frontend package.json создан', 'green');

  // Создание vite.config.js
  log('\n⚙️  Создание vite.config.js...', 'blue');
  fs.writeFileSync(
    path.join('frontend', 'vite.config.js'),
    viteConfig
  );
  log('✅ vite.config.js создан', 'green');

  // Создание .env.example файлов
  log('\n🔐 Создание .env.example файлов...', 'blue');
  fs.writeFileSync(
    path.join('backend', '.env.example'),
    backendEnvExample
  );
  fs.writeFileSync(
    path.join('frontend', '.env.example'),
    frontendEnvExample
  );
  log('✅ .env.example файлы созданы', 'green');

  // Создание index.html для frontend
  log('\n📄 Создание index.html...', 'blue');
  const publicDir = path.join('frontend', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join('frontend', 'index.html'),
    indexHtml
  );
  log('✅ index.html создан', 'green');

  // Установка зависимостей для Backend
  log('\n📥 Установка зависимостей Backend...', 'yellow');
  log('⏳ Это может занять несколько минут...', 'yellow');
  const backendInstalled = execCommand('npm install', 'backend');
  
  if (backendInstalled) {
    log('✅ Зависимости Backend успешно установлены', 'green');
  } else {
    log('⚠️  Не удалось установить зависимости Backend', 'yellow');
  }

  // Установка зависимостей для Frontend
  log('\n📥 Установка зависимостей Frontend...', 'yellow');
  log('⏳ Это может занять несколько минут...', 'yellow');
  const frontendInstalled = execCommand('npm install', 'frontend');
  
  if (frontendInstalled) {
    log('✅ Зависимости Frontend успешно установлены', 'green');
  } else {
    log('⚠️  Не удалось установить зависимости Frontend', 'yellow');
  }

  // Создание .env из .env.example
  log('\n🔐 Создание .env файлов из примеров...', 'blue');
  
  if (!fs.existsSync(path.join('backend', '.env'))) {
    fs.copyFileSync(
      path.join('backend', '.env.example'),
      path.join('backend', '.env')
    );
    log('✅ backend/.env создан (не забудьте настроить параметры БД!)', 'green');
  } else {
    log('ℹ️  backend/.env уже существует', 'blue');
  }

  if (!fs.existsSync(path.join('frontend', '.env'))) {
    fs.copyFileSync(
      path.join('frontend', '.env.example'),
      path.join('frontend', '.env')
    );
    log('✅ frontend/.env создан', 'green');
  } else {
    log('ℹ️  frontend/.env уже существует', 'blue');
  }

  // Финальные инструкции
  log('\n' + '='.repeat(60), 'green');
  log('✅ Установка завершена успешно!', 'green');
  log('='.repeat(60) + '\n', 'green');

  log('📋 СЛЕДУЮЩИЕ ШАГИ:\n', 'yellow');
  
  log('1️⃣  Настройте базу данных:', 'blue');
  log('   - Создайте базу данных MySQL');
  log('   - Выполните: mysql -u root -p < database.sql');
  log('   - Или импортируйте database.sql через phpMyAdmin\n');

  log('2️⃣  Настройте backend/.env:', 'blue');
  log('   - Откройте файл backend/.env');
  log('   - Укажите параметры подключения к БД');
  log('   - DB_HOST, DB_USER, DB_PASSWORD, DB_NAME\n');

  log('3️⃣  Запустите Backend:', 'blue');
  log('   cd backend');
  log('   npm run dev\n');

  log('4️⃣  Запустите Frontend (в новом терминале):', 'blue');
  log('   cd frontend');
  log('   npm run dev\n');

  log('🌐 После запуска:', 'green');
  log('   Backend:  http://localhost:5000');
  log('   Frontend: http://localhost:3000\n');

  log('📚 Документация и помощь:', 'blue');
  log('   - README.md содержит дополнительную информацию');
  log('   - Файл database.sql содержит структуру БД\n');
}

// Запуск установки
setupProject().catch(error => {
  log('\n❌ Произошла критическая ошибка:', 'red');
  console.error(error);
  process.exit(1);
});