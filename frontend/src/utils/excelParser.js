// frontend/src/utils/excelParser.js
import * as XLSX from 'xlsx';

/**
 * ШАБЛОН УЧЕНИКОВ
 */
export const downloadStudentTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      first_name: 'Иван',
      last_name: 'Иванов',
      middle_name: 'Иванович',
      phone: '+7...',
      phone_comment: '',
      email: 'ivan@example.com',
      birth_date: '2005-01-01',
      gender: 'm',
      address: '',
      status: 'active',
      balance: 0,
      comment: ''
    }
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Students');
  XLSX.writeFile(wb, 'students_template.xlsx');
};

export const parseStudentsExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // получаем массив объектов: { 'Имя': '...', 'телефон': '...', ... }
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const students = json.map((row) => {
          // забираем значения по твоим реальным заголовкам
          const name =
            row['Имя'] ||
            row['имя'] ||
            row['Name'] ||
            row['name'] ||
            '';

          const phone =
            row['телефон'] ||
            row['Телефон'] ||
            row['phone'] ||
            row['Phone'] ||
            '';

          const phoneComment =
            row['Комментарий к телефону'] ||
            row['комментарий к телефону'] ||
            row['Комментарий к телефону '] || // на случай пробела
            row['phone_comment'] ||
            '';

          const email =
            row['Email'] ||
            row['email'] ||
            row['E-mail'] ||
            row['e-mail'] ||
            '';

          const birthDate =
            row['дата рождения'] ||
            row['Дата рождения'] ||
            row['birth_date'] ||
            row['Birth date'] ||
            '';

          const gender =
            row['пол'] ||
            row['Пол'] ||
            row['gender'] ||
            '';

          const address =
            row['адрес'] ||
            row['Адрес'] ||
            row['address'] ||
            '';

          const status =
            row['статус'] ||
            row['Статус'] ||
            row['status'] ||
            '';

          const balance =
            row['баланс'] ||
            row['Баланс'] ||
            row['balance'] ||
            0;

          const comment =
            row['комментарий'] ||
            row['Комментарий'] ||
            row['comment'] ||
            '';

          return {
            // минимум, что нужно бэкенду
            first_name: name || '',
            // если в БД last_name обязательно — продублируем имя
            last_name: name || '',
            middle_name: null,

            phone: phone || null,
            phone_comment: phoneComment || null,
            email: email || null,
            birth_date: birthDate || null,
            gender: gender || null,
            address: address || null,
            status: status || 'active',
            balance: Number(balance) || 0,
            comment: comment || null
          };
        });

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);

    reader.readAsArrayBuffer(file);
  });
/**
 * ШАБЛОН ПРЕПОДАВАТЕЛЕЙ
 */
export const downloadTeacherTemplate = () => {
  const ws = XLSX.utils.json_to_sheet([
    {
      first_name: 'Анна',
      last_name: 'Петрова',
      middle_name: 'Сергеевна',
      phone: '+7...',
      email: 'teacher@example.com',
      subject: 'Математика',
      rate: 1000,
      comment: ''
    }
  ]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
  XLSX.writeFile(wb, 'teachers_template.xlsx');
};

// по желанию — парсер для учителей
export const parseTeachersExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const teachers = json.map((row) => ({
          first_name:
            row.first_name || row['first_name'] || row['Имя'] || '',
          last_name:
            row.last_name || row['last_name'] || row['Фамилия'] || '',
          middle_name:
            row.middle_name || row['middle_name'] || row['Отчество'] || null,
          phone: row.phone || row['phone'] || row['Телефон'] || null,
          email: row.email || row['email'] || row['Email'] || null,
          subject: row.subject || row['subject'] || row['Предмет'] || null,
          rate: row.rate || row['rate'] || row['Ставка'] || 0,
          comment:
            row.comment || row['comment'] || row['Комментарий'] || null
        }));

        resolve(teachers);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);

    reader.readAsArrayBuffer(file);
  });
