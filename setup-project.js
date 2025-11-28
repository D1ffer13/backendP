const fs = require('fs');
const path = require('path');

// Правильная структура проекта
const structure = {
  backend: {
    config: ['db.js'],
    controllers: [
      'studentController.js',
      'teacherController.js',
      'lessonController.js',
      'enrollmentController.js',
      'attendanceController.js'
    ],
    routes: [
      'students.js',
      'teachers.js',
      'lessons.js',
      'enrollments.js',
      'attendance.js'
    ],
    middleware: ['auth.js'],
    utils: ['excelImport.js']
  },
  frontend: {
    public: [],
    src: {
      components: {
        layout: ['Layout.jsx', 'Sidebar.jsx', 'Header.jsx'],
        common: ['Modal.jsx', 'Button.jsx', 'Input.jsx', 'Table.jsx'],
        students: ['StudentList.jsx', 'StudentForm.jsx', 'StudentCard.jsx', 'StudentImport.jsx'],
        teachers: ['TeacherList.jsx', 'TeacherForm.jsx', 'TeacherCard.jsx', 'TeacherImport.jsx'],
        lessons: ['LessonList.jsx', 'LessonForm.jsx', 'LessonCard.jsx', 'LessonDetails.jsx', 'Calendar.jsx'],
        enrollments: ['EnrollmentList.jsx', 'EnrollmentForm.jsx', 'EnrollmentManager.jsx'],
        attendance: ['AttendanceTable.jsx', 'AttendanceForm.jsx', 'AttendanceSummary.jsx']
      },
      services: [
        'api.js',
        'studentService.js',
        'teacherService.js',
        'lessonService.js',
        'enrollmentService.js',
        'attendanceService.js'
      ],
      utils: ['excelParser.js', 'formatters.js'],
      styles: ['App.css']
    }
  }
};

function createDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Создана папка: ${dirPath}`);
  }
}

function createFile(filePath) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `// ${path.basename(filePath)}\n`);
    console.log(`📄 Создан файл: ${filePath}`);
  }
}

function processStructure(basePath, config) {
  createDirectory(basePath);

  for (const [key, value] of Object.entries(config)) {
    const currentPath = path.join(basePath, key);

    if (Array.isArray(value)) {
      createDirectory(currentPath);
      value.forEach(file => {
        createFile(path.join(currentPath, file));
      });
    } else if (typeof value === 'object') {
      processStructure(currentPath, value);
    }
  }
}

console.log('\n🚀 Создание структуры проекта...\n');

// Создание структуры Backend
processStructure(path.join(__dirname, 'backend'), structure.backend);

// Создание структуры Frontend
processStructure(path.join(__dirname, 'frontend'), structure.frontend);

// Создаем пустые файлы App.jsx и main.jsx в frontend/src
createFile(path.join(__dirname, 'frontend', 'src', 'App.jsx'));
createFile(path.join(__dirname, 'frontend', 'src', 'main.jsx'));

// Создаем server.js в backend
createFile(path.join(__dirname, 'backend', 'server.js'));

console.log('\n✅ Структура проекта успешно создана!\n');