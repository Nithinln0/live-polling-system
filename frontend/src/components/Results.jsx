import React from 'react';

export default function Results({ poll, results }) {
  if (!poll) return null;

  return (
    <div className="results">
      <h3>Live Results</h3>
      {poll.options.map((opt) => (
        <div key={opt} className="result-row">
          <span>{opt}</span>
          <span className="count">{results[opt] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
