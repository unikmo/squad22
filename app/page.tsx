'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [username, setUsername] = useState('');

  return (
    <main>
      <header>
        <h1>⚽ Squad22</h1>
        <p>A strategic card game for football enthusiasts</p>
      </header>

      <div style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="card">
          <h2>Welcome to Squad22</h2>
          <p style={{ marginTop: '15px', marginBottom: '25px' }}>
            Build your ultimate squad and outsmart your opponent. Play cards strategically to reach the target score!
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px' }}>
              Enter your username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ddd',
                fontSize: '16px',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Link href={`/game?mode=ai&player=${encodeURIComponent(username)}`}>
              <button style={{ width: '100%' }} disabled={!username}>
                Play vs AI
              </button>
            </Link>
            <Link href={`/game?mode=multiplayer&player=${encodeURIComponent(username)}`}>
              <button style={{ width: '100%' }} disabled={!username}>
                Multiplayer
              </button>
            </Link>
          </div>

          <div style={{ marginTop: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
            <h3>How to Play</h3>
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Draw 1 card to start your turn</li>
              <li>Play position pairs (2 cards same position) or trait triples (3 cards same trait, different positions)</li>
              <li>Discard 1 card to end your turn</li>
              <li>Reach the target score to win!</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
