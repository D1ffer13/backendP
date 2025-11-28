// backend/createTestUsers.js

const bcrypt = require('bcryptjs');
const db = require('./config/db');

const createTestUsers = async () => {
  try {
    console.log('🔧 Creating test users...\n');

    // Хешируем пароли
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const teacherPasswordHash = await bcrypt.hash('teacher123', 10);

    console.log('Admin password hash:', adminPasswordHash);
    console.log('Teacher password hash:', teacherPasswordHash);
    console.log('');

    // Удаляем старых тестовых пользователей
    await db.query(`DELETE FROM users WHERE email IN ('admin@example.com', 'teacher@school.com')`);
    await db.query(`DELETE FROM teachers WHERE email = 'teacher@school.com'`);

    // Создаём админа
    await db.query(
      `INSERT INTO users (email, password_hash, role, is_active) 
       VALUES (?, ?, 'admin', 1)`,
      ['admin@example.com', adminPasswordHash]
    );
    console.log('✅ Admin created: admin@example.com / admin123');

    // Создаём преподавателя
    const [teacherResult] = await db.query(
      `INSERT INTO teachers (first_name, last_name, middle_name, phone, email, status) 
       VALUES ('Иван', 'Иванов', 'Петрович', '+79001234567', 'teacher@school.com', 'active')`
    );

    await db.query(
      `INSERT INTO users (email, password_hash, role, teacher_id, is_active) 
       VALUES (?, ?, 'teacher', ?, 1)`,
      ['teacher@school.com', teacherPasswordHash, teacherResult.insertId]
    );
    console.log('✅ Teacher created: teacher@school.com / teacher123');

    console.log('\n🎉 Test users created successfully!');
    console.log('\nYou can now login with:');
    console.log('  Admin: admin@example.com / admin123');
    console.log('  Teacher: teacher@school.com / teacher123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
