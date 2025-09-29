import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import socket from '../socket';

export default function TeacherPanel() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState(30);
  const [statusMsg, setStatusMsg] = useState("");
  const [activePoll, setActivePoll] = useState(null);
  const [results, setResults] = useState({});
  const [answeredCount, setAnsweredCount] = useState(0);
  const [totalParticipants, setTotalParticipants] = useState(0);

  useEffect(() => {
    socket.on("newPoll", ({ poll, results }) => {
      setActivePoll(poll);
      setResults(results);
      setStatusMsg(`New poll started: ${poll.question}`);
      setAnsweredCount(0);
    });

    socket.on("updateResults", ({ results, answeredCount, totalParticipants }) => {
      setResults(results);
      setAnsweredCount(answeredCount);
      setTotalParticipants(totalParticipants);
    });

    socket.on("pollClosed", ({ results }) => {
      setActivePoll(null);
      setResults(results);
      setStatusMsg("Poll closed");
      setAnsweredCount(0);
      setTotalParticipants(0);
    });

    return () => {
      socket.off("newPoll");
      socket.off("updateResults");
      socket.off("pollClosed");
    };
  }, []);

  const addOption = () => setOptions([...options, ""]);
  const setOption = (i, value) => {
    const copy = [...options];
    copy[i] = value;
    setOptions(copy);
  };
  const removeOption = (i) => {
    if (options.length > 2) {
      const copy = [...options];
      copy.splice(i, 1);
      setOptions(copy);
    }
  };

  const createPoll = () => {
    const filtered = options.map(o => o.trim()).filter(Boolean);
    if (!question.trim() || filtered.length < 2) {
      alert("Provide question and at least 2 options");
      return;
    }

    const pollDuration = Math.min(Math.max(Number(duration), 5), 60);
    
    const poll = {
      id: uuidv4(),
      question: question.trim(),
      options: filtered,
      durationSeconds: pollDuration,
    };

    socket.emit("createPoll", poll);
    setStatusMsg("Poll created and sent!");

    setQuestion("");
    setOptions(["", ""]);
    setDuration(30);
  };

  const dynamicStatus = !question.trim()
    ? "No question has been asked yet"
    : activePoll && answeredCount < totalParticipants
    ? "All students have not answered the previous question"
    : statusMsg;

  return (
    <div className="teacher-panel">
      <div className="panel-header">
        <h2>Teacher Panel</h2>
      </div>
      
      <div className="poll-creation">
        <h3>Create New Poll</h3>
        
        <div className="input-group">
          <label>Question</label>
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question"
          />
        </div>

        <div className="options-section">
          <label>Options</label>
          {options.map((opt, i) => (
            <div key={i} className="option-row">
              <input
                value={opt}
                onChange={(e) => setOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              {options.length > 2 && (
                <button className="remove-btn" onClick={() => removeOption(i)}>
                  Remove
                </button>
              )}
            </div>
          ))}
          <button className="add-option-btn" onClick={addOption}>
            Add Option
          </button>
        </div>

        <div className="input-group">
          <label>Duration (seconds, max 60)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min="5"
            max="60"
          />
          <small>Duration will be capped at 60 seconds</small>
        </div>

        <div className="actions">
          <button
            className="create-poll-btn"
            onClick={createPoll}
            disabled={
              !question.trim() || 
              (activePoll && answeredCount < totalParticipants)
            }
          >
            Create Poll
          </button>
        </div>

        <div className="status-message">
          <p>{dynamicStatus}</p>
          {activePoll && (
            <p>
              {answeredCount}/{totalParticipants} students have answered
            </p>
          )}
        </div>
      </div>

      <div className="results-section">
        <h3>Live Results</h3>
        {activePoll ? (
          <div className="results-container">
            <p className="poll-question">
              <strong>{activePoll.question}</strong>
            </p>
            {Object.entries(results).map(([opt, count]) => (
              <div key={opt} className="result-row">
                <span>{opt}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p>No active poll</p>
        )}
      </div>
    </div>
  );
}