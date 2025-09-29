import React, { useState } from 'react';
import WelcomePage from './components/WelcomePage';
import GetStartedPage from './components/GetStartedPage';
import TeacherPanel from './components/TeacherPanel';
import StudentPanel from './components/StudentPanel';
import socket from './socket';

export default function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [role, setRole] = useState(null);
  const [name, setName] = useState('');

  const handleGetStarted = () => {
    setCurrentPage('getStarted');
  };

  const handleJoin = (selectedRole) => {
    setRole(selectedRole);
    socket.emit('register', { role: selectedRole, name });
    setCurrentPage(selectedRole);
  };

  return (
    <div className="app-container">
      {currentPage === 'welcome' && <WelcomePage onGetStarted={handleGetStarted} />}
      {currentPage === 'getStarted' && (
        <GetStartedPage 
          name={name} 
          setName={setName} 
          onJoin={handleJoin} 
        />
      )}
      {currentPage === 'teacher' && <TeacherPanel />}
      {currentPage === 'student' && <StudentPanel />}
    </div>
  );
}