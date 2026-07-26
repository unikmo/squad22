'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

export default function GamePage() {
  const searchParams = useSearchParams();
  const [gameState, setGameState] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    // Initialize game
    const mode = searchParams.get('mode') || 'ai';
    const player = searchParams.get('player') || 'Player';
    
    // TODO: Fetch game state from API
    console.log('Game mode:', mode, 'Player:', player);
    setStatus('Game initialized');
  }, [searchParams]);

  if (!gameState) {
    return (
      <main>
        <header>
          <h1>⚽ Squad22 - Game</h1>
          <p>{status}</p>
        </header>
      </main>
    );
  }

  return (
    <main>
      <header>
        <h1>⚽ Squad22 - Game</h1>
        <p>Round {gameState.round}</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="player-area">
          <h2>Your Hand ({gameState.hands[0]?.length || 0} cards)</h2>
          <div className="hand">
            {gameState.hands[0]?.map((card: any, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  if (selectedCards.includes(idx)) {
                    setSelectedCards(selectedCards.filter(i => i !== idx));
                  } else {
                    setSelectedCards([...selectedCards, idx]);
                  }
                }}
                style={{
                  cursor: 'pointer',
                  border: selectedCards.includes(idx) ? '3px solid gold' : '2px solid #ddd',
                  padding: '10px',
                  borderRadius: '5px',
                  textAlign: 'center',
                  background: selectedCards.includes(idx) ? '#fff9e6' : 'white',
                }}
              >
                <div><strong>{card.name}</strong></div>
                <div style={{ fontSize: '12px', color: '#666' }}>Pos {card.position}</div>
                <div style={{ fontSize: '12px', color: card.trait }}>{card.trait}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="player-area">
          <h2>Your Table</h2>
          <div className="hand">
            {gameState.tables[0]?.map((card: any, idx: number) => (
              <div key={idx} style={{ padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}>
                <div><strong>{card.name}</strong></div>
                <div style={{ fontSize: '12px' }}>+{card.points} pts</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15px', fontSize: '18px', fontWeight: 'bold' }}>
            Score: {gameState.scores[0]} / {gameState.targetScore}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button>Draw Card</button>
        <button style={{ marginLeft: '10px' }} disabled={selectedCards.length === 0}>
          Play Cards
        </button>
        <button style={{ marginLeft: '10px' }}>Discard Card</button>
      </div>
    </main>
  );
}
