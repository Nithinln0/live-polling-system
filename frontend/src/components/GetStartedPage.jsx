import React, { useEffect, useState } from 'react';

export default function GetStartedPage({ name, setName, onJoin }) {
  const [storedName, setStoredName] = useState('');

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) {
      setStoredName(savedName);
      setName(savedName);
    }
  }, [setName]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    setStoredName(newName);
  };

  const handleJoin = (role) => {
    if (role === 'student' && storedName.trim()) {
      localStorage.setItem('studentName', storedName);
    }
    onJoin(role);
  };

  return (
    <div className="get-started-page">
      <div className="get-started-content">
        <h1>Let's Get Started</h1>
        <div className="input-group">
          <label>Your name</label>
          <input
            type="text"
            placeholder="Enter your name"
            value={storedName}
            onChange={handleNameChange}
          />
        </div>
        <div className="role-selection">
          <button 
            className="role-button teacher" 
            onClick={() => handleJoin('teacher')}
          >
            Join as Teacher
          </button>
          <button 
            className="role-button student" 
            onClick={() => handleJoin('student')}
            disabled={!storedName.trim()}
          >
            Join as Student
          </button>
        </div>
      </div>
    </div>
  );
}