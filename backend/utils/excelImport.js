// frontend/src/utils/excelParser.js
import * as XLSX from 'xlsx';

// генерация шаблона — у тебя уже есть
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
      gender: 'm/f',
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

// парсинг Excel в массив студентов
export const parseStudentsExcel = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const students = json.map((row) => ({
          first_name: row.first_name || row['first_name'] || row['Имя'] || '',
          last_name: row.last_name || row['last_name'] || row['Фамилия'] || '',
          middle_name:
            row.middle_name || row['middle_name'] || row['Отчество'] || null,
          phone: row.phone || row['phone'] || row['Телефон'] || null,
          phone_comment:
            row.phone_comment || row['phone_comment'] || row['Комментарий к телефону'] || null,
          email: row.email || row['email'] || row['Email'] || null,
          birth_date: row.birth_date || row['birth_date'] || row['Дата рождения'] || null,
          gender: row.gender || row['gender'] || row['Пол'] || null,
          address: row.address || row['address'] || row['Адрес'] || null,
          status: row.status || row['status'] || 'active',
          balance: row.balance || row['balance'] || 0,
          comment: row.comment || row['comment'] || row['Комментарий'] || null
        }));

        resolve(students);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
