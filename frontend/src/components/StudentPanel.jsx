import React, { useEffect, useState, useRef } from 'react';
import socket from '../socket';

export default function StudentPanel() {
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState({});
  const [hasAnswered, setHasAnswered] = useState(false);
  const [remaining, setRemaining] = useState(null);
  const [studentName, setStudentName] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem('studentName');
    if (savedName) {
      setStudentName(savedName);
    }

    const handleNewPoll = ({ poll, results }) => {
      setPoll(poll);
      setResults(results || {});
      setHasAnswered(false);
      if (poll && poll.durationSeconds) {
        setRemaining(poll.durationSeconds);
      } else {
        setRemaining(null);
      }
    };

    const handleUpdateResults = ({ results }) => {
      setResults(results || {});
    };

    const handlePollClosed = () => {
      setPoll(null);
      setHasAnswered(false);
      setRemaining(null);
    };

    const handleError = (msg) => {
      console.warn('Server:', msg);
    };

    socket.on('newPoll', handleNewPoll);
    socket.on('updateResults', handleUpdateResults);
    socket.on('pollClosed', handlePollClosed);
    socket.on('errorMessage', handleError);

    return () => {
      socket.off('newPoll', handleNewPoll);
      socket.off('updateResults', handleUpdateResults);
      socket.off('pollClosed', handlePollClosed);
      socket.off('errorMessage', handleError);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (remaining == null) return;

    if (remaining <= 0) {
      setRemaining(null);
      return;
    }

    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev == null) return null;
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [remaining]);

  const submitAnswer = (opt) => {
    if (!poll) return;
    if (hasAnswered) return;
    if (remaining !== null && remaining <= 0) return;

    socket.emit('submitAnswer', { pollId: poll.id, answer: opt });
    setHasAnswered(true);
  };

  return (
    <div className="student-panel">
      <div className="panel-header">
        <h2>Student Panel</h2>
        {studentName && <p className="student-name">Welcome, {studentName}</p>}
      </div>

      {poll ? (
        <div className="active-poll">
          <div className="poll-question">
            <h3>{poll.question}</h3>
          </div>

          <div className="poll-options">
            {poll.options.map((opt) => (
              <button
                key={opt}
                className={`option-btn ${hasAnswered ? 'answered' : ''}`}
                disabled={hasAnswered || (remaining !== null && remaining <= 0)}
                onClick={() => submitAnswer(opt)}
              >
                {opt}
              </button>
            ))}
          </div>

          {remaining !== null && (
            <div className="timer">
              Time left: <span className="time-remaining">{remaining}s</span>
            </div>
          )}

          <div className="poll-results">
            <h4>Live Results</h4>
            <div className="results-list">
              {poll.options.map((opt) => (
                <div key={opt} className="result-item">
                  <span className="option-text">{opt}</span>
                  <span className="vote-count">{results[opt] ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          {hasAnswered && (
            <div className="confirmation">
              <p>Thanks — you have answered.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="no-poll">
          <p>No active poll. Wait for the teacher to start one.</p>
        </div>
      )}
    </div>
  );
}