// frontend/src/components/layout/Layout.jsx
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="container">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
