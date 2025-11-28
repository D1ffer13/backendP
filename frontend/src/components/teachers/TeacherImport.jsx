import React, { useState } from 'react';
import { FaFileUpload, FaDownload } from 'react-icons/fa';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { teacherService } from '../../services/teacherService';
import { downloadTeacherTemplate } from '../../utils/excelParser';

const TeacherImport = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        setFile(selectedFile);
        setResult(null);
      } else {
        alert('Пожалуйста, выберите файл Excel (.xlsx или .xls)');
        e.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert('Пожалуйста, выберите файл');
      return;
    }

    try {
      setLoading(true);
      const response = await teacherService.importFromExcel(file);
      setResult(response);
      
      if (response.errors === 0) {
        alert(`Успешно импортировано ${response.imported} педагогов`);
        onSuccess();
      } else {
        alert(`Импортировано ${response.imported} педагогов. Ошибок: ${response.errors}`);
      }
    } catch (error) {
      console.error('Error importing teachers:', error);
      alert('Ошибка при импорте педагогов');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Импорт педагогов из Excel">
      <div style={{ padding: '20px 0' }}>
        <div style={{ marginBottom: '20px' }}>
          <Button
            variant="outline"
            icon={<FaDownload />}
            onClick={downloadTeacherTemplate}
          >
            Скачать шаблон Excel
          </Button>
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Скачайте шаблон, заполните данные педагогов и загрузите обратно
          </p>
        </div>

        <div className="form-group">
          <label>Выберите файл Excel</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '10px',
              border: '2px dashed #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          />
          {file && (
            <p style={{ marginTop: '10px', color: '#27ae60' }}>
              Выбран файл: {file.name}
            </p>
          )}
        </div>

        {result && (
          <div className={`alert ${result.errors === 0 ? 'alert-success' : 'alert-error'}`}>
            <p><strong>Результат импорта:</strong></p>
            <p>Импортировано: {result.imported}</p>
            <p>Ошибок: {result.errors}</p>
            {result.errorDetails && result.errorDetails.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>Детали ошибок:</strong></p>
                <ul>
                  {result.errorDetails.map((error, index) => (
                    <li key={index}>
                      {error.teacher}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="form-actions">
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
          <Button
            variant="primary"
            icon={<FaFileUpload />}
            onClick={handleImport}
            disabled={!file || loading}
          >
            {loading ? 'Импорт...' : 'Импортировать'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TeacherImport;