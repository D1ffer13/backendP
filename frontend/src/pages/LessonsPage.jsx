// frontend/src/pages/LessonsPage.jsx

import React from 'react';
import LessonList from '../components/lessons/LessonList';

const LessonsPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '20px' }}>📅 Расписание занятий</h1>
      <LessonList />
    </div>
  );
};

export default LessonsPage;
