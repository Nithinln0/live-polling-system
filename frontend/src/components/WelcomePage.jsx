import React from 'react';

export default function WelcomePage({ onGetStarted }) {
  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <h1>Welcome to the Live Polling System</h1>
        <button className="primary-button" onClick={onGetStarted}>
          Let's Get Started
        </button>
      </div>
    </div>
  );
}