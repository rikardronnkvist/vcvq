import 'dotenv/config';
        import express from 'express';
        import http from 'http';
        import path from 'path';
        import { fileURLToPath } from 'url';
        import { Server as SocketIOServer } from 'socket.io';
        import cors from 'cors';

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const app = express();
        app.use(cors());
        app.use(express.json());

        const server = http.createServer(app);
        const io = new SocketIOServer(server, {
          cors: {
            origin: '*',
            methods: ['GET', 'POST']
          }
        });

        const PORT = process.env.PORT || 3030;
        const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';

        // In-memory room state
        const rooms = new Map(); // roomId -> state

        function randomRoomCode() {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let out = '';
          for (let i=0;i<5;i++) out += chars[Math.floor(Math.random()*chars.length)];
          return out;
        }

        const PLAYER_COLORS = ['#1F75FE', '#FF3B30', '#34C759', '#AF52DE']; // blue, red, green, purple

        function defaultNames(lang='sv') {
          // Defaults per requirements (English text enforced), Swedish UI elsewhere
          return [
            'Driver',
            'Front Passenger',
            'Left Back Passenger',
            'Right Back Passenger'
          ];
        }

        function validateQuestions(questions) {
          if (!Array.isArray(questions)) return false;
          if (questions.length !== 10) return false;
          return questions.every(q =>
            q && typeof q.question === 'string' &&
            Array.isArray(q.options) && q.options.length === 6 &&
            Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex < 6
          );
        }

        function tryParseJSONfromText(text) {
          // Strip MD code fences if present
          const fenced = text.match(/```[\s\S]*?```/);
          if (fenced) {
            const inner = fenced[0].replace(/^```[a-zA-Z]*?/, '').replace(/```$/, '');
            try { return JSON.parse(inner); } catch {}
          }
          // Try direct JSON
          try { return JSON.parse(text); } catch {}
          // Try to extract first { ... }
          const firstBrace = text.indexOf('{');
          const lastBrace = text.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const candidate = text.slice(firstBrace, lastBrace+1);
            try { return JSON.parse(candidate); } catch {}
          }
          return null;
        }

        async function generateQuestions(topic, lang='sv') {
          const prompt = `Generate a quiz in ${lang === 'sv' ? 'Swedish' : 'English'} with EXACTLY 10 questions. Each question must have EXACTLY 6 answer options and EXACTLY one correct answer. Topic: "${topic}". Return STRICT JSON only with this schema:
{
  "questions": [
    {"question": string, "options": string[6], "correctIndex": number (0-5)}
  ]
}`;
          if (!GEMINI_API_KEY) {
            // Fallback: deterministic sample content so app is still usable for demo
            const sample = Array.from({length:10}).map((_,i)=>({
              question: `${lang==='sv'?'Exempel':'Sample'} Q${i+1}: ${topic}?`,
              options: ['A','B','C','D','E','F'].map(x=>`${x}`),
              correctIndex: i%6
            }));
            return sample;
          }
          try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.6 }
              })
            });
            if (!res.ok) {
              console.error('Gemini error status', res.status);
              throw new Error('Gemini API error');
            }
            const data = await res.json();
            const text = data?.candidates?.[0]?.content?.parts?.map(p=>p.text).join('') || '';
            const parsed = tryParseJSONfromText(text);
            const questions = parsed?.questions || [];
            if (!validateQuestions(questions)) throw new Error('Invalid Gemini format');
            return questions;
          } catch (err) {
            console.error('Gemini generation failed, using fallback:', err.message);
            const sample = Array.from({length:10}).map((_,i)=>({
              question: `${lang==='sv'?'Exempel':'Sample'} Q${i+1}: ${topic}?`,
              options: ['A','B','C','D','E','F'].map(x=>`${x}`),
              correctIndex: i%6
            }));
            return sample;
          }
        }

        function createRoom({ topic, lang='sv', numPlayers=2, names }) {
          const roomId = randomRoomCode();
          const now = Date.now();
          const n = Math.max(2, Math.min(4, Number(numPlayers)||2));
          const defaults = defaultNames(lang);
          const players = Array.from({length:n}).map((_,i)=>({
            number: i+1,
            id: null, // socket id when claimed by a client
            name: names?.[i] || defaults[i],
            color: PLAYER_COLORS[i],
            score: 0
          }));
          const state = {
            roomId,
            topic: topic || 'General knowledge',
            lang,
            createdAt: now,
            players,
            turnIndex: Math.floor(Math.random()*n),
            currentQuestion: 0,
            questions: [],
            started: false,
            answerLock: false
          };
          rooms.set(roomId, state);
          return state;
        }

        async function startGame(roomId) {
          const state = rooms.get(roomId);
          if (!state) return;
          state.players.forEach(p=>p.score=0);
          state.currentQuestion = 0;
          state.turnIndex = Math.floor(Math.random()*state.players.length);
          state.answerLock = false;
          state.questions = await generateQuestions(state.topic, state.lang);
          state.started = true;
          io.to(roomId).emit('game_started', publicState(state));
          io.to(roomId).emit('question', currentQuestionPayload(state));
        }

        function publicState(state) {
          return {
            roomId: state.roomId,
            topic: state.topic,
            lang: state.lang,
            players: state.players.map(p=>({ number: p.number, name: p.name, color: p.color, score: p.score })),
            turnIndex: state.turnIndex,
            currentQuestion: state.currentQuestion,
            totalQuestions: state.questions.length || 10,
            started: state.started
          };
        }

        function currentQuestionPayload(state) {
          const q = state.questions[state.currentQuestion];
          return {
            index: state.currentQuestion,
            total: state.questions.length,
            question: q?.question || '',
            options: q?.options || [],
            currentPlayer: state.turnIndex
          };
        }

        app.use(express.static(path.join(__dirname, 'public')));

        // Optional HTTP endpoint to generate questions (not required by client; sockets use startGame)
        app.post('/api/generateQuestions', async (req, res) => {
          const { topic, lang } = req.body || {};
          try {
            const qs = await generateQuestions(topic || 'General knowledge', lang || 'sv');
            res.json({ questions: qs });
          } catch (e) {
            res.status(500).json({ error: e.message });
          }
        });

        io.on('connection', (socket) => {
          socket.on('create_room', async (payload, cb) => {
            try {
              const { topic, lang='sv', numPlayers=2, names=[] } = payload || {};
              const state = createRoom({ topic, lang, numPlayers, names });
              socket.join(state.roomId);
              cb && cb({ ok: true, roomId: state.roomId, state: publicState(state) });
            } catch (e) {
              cb && cb({ ok: false, error: e.message });
            }
          });

          socket.on('join_room', (payload, cb) => {
            const { roomId, playerNumber } = payload || {};
            const state = rooms.get(roomId);
            if (!state) return cb && cb({ ok: false, error: 'Room not found' });
            socket.join(roomId);
            // Claim player slot if provided
            if (playerNumber) {
              const idx = Number(playerNumber) - 1;
              if (idx >=0 && idx < state.players.length) {
                state.players[idx].id = socket.id;
              }
            }
            cb && cb({ ok: true, state: publicState(state) });
            socket.to(roomId).emit('state', publicState(state));
            // If game already started, send current question
            if (state.started) {
              socket.emit('question', currentQuestionPayload(state));
            }
          });

          socket.on('start_game', async ({ roomId }, cb) => {
            const state = rooms.get(roomId);
            if (!state) return cb && cb({ ok: false, error: 'Room not found' });
            await startGame(roomId);
            cb && cb({ ok: true });
          });

          socket.on('answer', ({ roomId, optionIndex, playerNumber }, cb) => {
            const state = rooms.get(roomId);
            if (!state || !state.started) return cb && cb({ ok: false, error: 'Invalid room' });
            if (state.answerLock) return cb && cb({ ok: false, error: 'Locked' });
            const currentPlayer = state.turnIndex + 1;
            if (playerNumber !== currentPlayer) {
              return cb && cb({ ok: false, error: 'Not your turn' });
            }
            const q = state.questions[state.currentQuestion];
            if (!q) return cb && cb({ ok: false, error: 'No question' });
            const correct = Number(optionIndex) === q.correctIndex;
            if (correct) state.players[state.turnIndex].score += 1;
            state.answerLock = true;
            io.to(roomId).emit('answer_result', {
              playerNumber,
              optionIndex,
              correct,
              correctIndex: q.correctIndex,
              scores: state.players.map(p=>p.score)
            });
            // Advance after 2 seconds
            setTimeout(() => {
              state.answerLock = false;
              state.currentQuestion += 1;
              state.turnIndex = (state.turnIndex + 1) % state.players.length;
              if (state.currentQuestion >= state.questions.length) {
                // Game over
                const max = Math.max(...state.players.map(p=>p.score));
                const winners = state.players.filter(p=>p.score === max).map(p=>({ number: p.number, name: p.name, score: p.score, color: p.color }));
                io.to(roomId).emit('game_over', { winners, scores: state.players.map(p=>({ number: p.number, name: p.name, score: p.score })) });
                state.started = false;
                return;
              }
              io.to(roomId).emit('state', publicState(state));
              io.to(roomId).emit('question', currentQuestionPayload(state));
            }, 2000);
            cb && cb({ ok: true });
          });

          socket.on('restart', async ({ roomId }, cb) => {
            const state = rooms.get(roomId);
            if (!state) return cb && cb({ ok: false, error: 'Room not found' });
            await startGame(roomId);
            cb && cb({ ok: true });
          });

          socket.on('disconnect', () => {
            // Do not delete rooms on disconnect to allow reconnection
          });
        });

        server.listen(PORT, () => {
          console.log(`VCVQ listening on http://0.0.0.0:${PORT}`);
        });