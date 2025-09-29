const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let currentPoll = null;
let results = {};
let answers = {};
let participants = new Set();
let answeredCount = 0;

function resetPollState() {
  results = {};
  answers = {};
  participants = new Set();
  answeredCount = 0;
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('register', (payload) => {
    if (payload && payload.role === 'student') {
      participants.add(socket.id);
    }

    if (currentPoll) {
      socket.emit('newPoll', { poll: currentPoll, results });
    }
  });

  socket.on('createPoll', (poll) => {
    if (currentPoll) {
      if (participants.size > 0 && answeredCount < participants.size) {
        socket.emit('errorMessage', 'Cannot create new poll until all students answer or poll is closed.');
        return;
      }
    }

    const duration = Math.min(poll.durationSeconds, 60);
    currentPoll = {
      ...poll,
      durationSeconds: duration
    };
    resetPollState();

    poll.options.forEach((o) => (results[o] = 0));
    io.emit('newPoll', { poll: currentPoll, results });

    if (duration && duration > 0) {
      setTimeout(() => {
        io.emit('pollClosed', { pollId: poll.id, results });
        currentPoll = null;
        resetPollState();
      }, duration * 1000);
    }
  });

  socket.on('submitAnswer', (payload) => {
    if (!currentPoll || payload.pollId !== currentPoll.id) {
      socket.emit('errorMessage', 'No active poll or poll mismatch');
      return;
    }

    if (answers[socket.id]) {
      socket.emit('errorMessage', 'Already answered');
      return;
    }

    answers[socket.id] = { pollId: payload.pollId, answer: payload.answer };
    results[payload.answer] = (results[payload.answer] || 0) + 1;
    answeredCount = Object.keys(answers).length;

    io.emit('updateResults', { results, answeredCount, totalParticipants: participants.size });

    if (participants.size > 0 && answeredCount >= participants.size) {
      io.emit('pollClosed', { pollId: currentPoll.id, results });
      currentPoll = null;
      resetPollState();
    }
  });

  socket.on('disconnect', () => {
    if (participants.has(socket.id)) participants.delete(socket.id);
    console.log('Disconnected:', socket.id);
  });
});

app.get('/', (req, res) => res.send({ ok: true }));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));