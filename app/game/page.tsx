'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function GamePage() {
  const searchParams = useSearchParams();
  const [gameState, setGameState] = useState<any>(null);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [status, setStatus] = useState('Initializing game...');
  const [currentPhase, setCurrentPhase] = useState('draw');
  const [playerName, setPlayerName] = useState('');

  useEffect(() => {
    const mode = searchParams.get('mode') || 'ai';
    const player = searchParams.get('player') || 'Player';
    setPlayerName(player);

    // Simulate game initialization
    setTimeout(() => {
      setGameState({
        round: 1,
        hands: [[{ name: 'Messi', position: 9, trait: 'Red', id: 1 }]],
        tables: [[], []],
        scores: [0, 0],
        targetScore: 300,
        drawPile: 52,
        openPile: []
      });
      setStatus('Your turn - Draw a card to start');
      setCurrentPhase('draw');
    }, 1500);
  }, [searchParams]);

  if (!gameState) {
    return (
      <main style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f1c32 0%, #1a3a52 50%, #0f2847 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#00ff00'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '20px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }}>
            ⚽
          </div>
          <h1 style={{
            fontSize: '32px',
            marginBottom: '10px',
            fontWeight: 'bold',
            textShadow: '0 0 20px rgba(0, 255, 0, 0.5)'
          }}>
            SQUAD22
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#aaa'
          }}>
            {status}
          </p>
        </div>
      </main>
    );
  }

  const traitColors: any = {
    'Red': '#ff6b6b',
    'Blue': '#4ecdc4',
    'Yellow': '#ffd93d',
    'Green': '#6bcf7f'
  };

  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f1c32 0%, #1a3a52 50%, #0f2847 100%)',
      padding: '20px'
    }}>
      {/* HEADER */}
      <header style={{
        textAlign: 'center',
        marginBottom: '30px',
        animation: 'slideInDown 0.8s ease-out'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          marginBottom: '20px'
        }}>
          <Link href="/">
            <button style={{
              padding: '10px 20px',
              background: 'rgba(0, 255, 0, 0.2)',
              color: '#00ff00',
              border: '2px solid #00ff00',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 255, 0, 0.4)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'}
            >
              ← Back to Home
            </button>
          </Link>

          <div>
            <h1 style={{
              fontSize: '42px',
              color: '#00ff00',
              margin: '0',
              textShadow: '0 0 30px rgba(0, 255, 0, 0.5)',
              fontWeight: '900',
              letterSpacing: '2px'
            }}>
              ⚽ SQUAD22
            </h1>
          </div>

          <div style={{
            fontSize: '18px',
            color: '#00ff00',
            fontWeight: 'bold'
          }}>
            Round {gameState.round}
          </div>
        </div>

        {/* Score Progress Bar */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          background: 'rgba(0, 255, 0, 0.1)',
          borderRadius: '25px',
          padding: '20px',
          border: '2px solid rgba(0, 255, 0, 0.3)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '30px',
            marginBottom: '15px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#00ff00'
              }}>
                <span>You ({playerName})</span>
                <span>{gameState.scores[0]} / {gameState.targetScore}</span>
              </div>
              <div style={{
                width: '100%',
                height: '25px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #00ff00'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(gameState.scores[0] / gameState.targetScore) * 100}%`,
                  background: 'linear-gradient(90deg, #00ff00, #00dd00)',
                  transition: 'width 0.3s ease',
                  animation: gameState.scores[0] > 0 ? 'glow 1s ease-in-out' : 'none'
                }} />
              </div>
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#ff6b6b'
              }}>
                <span>Opponent (AI)</span>
                <span>{gameState.scores[1]} / {gameState.targetScore}</span>
              </div>
              <div style={{
                width: '100%',
                height: '25px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid #ff6b6b'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(gameState.scores[1] / gameState.targetScore) * 100}%`,
                  background: 'linear-gradient(90deg, #ff6b6b, #ff5252)',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GAME BOARD */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {/* YOUR AREA */}
        <div style={{
          background: 'rgba(0, 255, 0, 0.08)',
          borderRadius: '20px',
          padding: '25px',
          border: '3px solid rgba(0, 255, 0, 0.4)',
          animation: 'slideInUp 0.8s ease-out 0.1s both'
        }}>
          <h2 style={{
            color: '#00ff00',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🖐️ Your Hand</span>
            <span style={{
              background: '#00ff00',
              color: '#000',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {gameState.hands[0]?.length || 0}
            </span>
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
            minHeight: '150px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '15px',
            borderRadius: '12px'
          }}>
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
                className={selectedCards.includes(idx) ? 'animate-card-flip' : ''}
                style={{
                  cursor: 'pointer',
                  border: selectedCards.includes(idx) ? '3px solid #00ff00' : '2px solid rgba(0, 255, 0, 0.5)',
                  padding: '12px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  minWidth: '100px',
                  transition: 'all 0.3s ease',
                  transform: selectedCards.includes(idx) ? 'scale(1.08)' : 'scale(1)',
                  boxShadow: selectedCards.includes(idx) ? '0 0 20px rgba(0, 255, 0, 0.5)' : 'none',
                  background: selectedCards.includes(idx) ? '#f0fff0' : 'white'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseOut={(e) => !selectedCards.includes(idx) && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1a4d2e' }}>
                  {card.name}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '5px'
                }}>
                  Position {card.position}
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'white',
                  background: traitColors[card.trait] || '#666'
                }}>
                  {card.trait}
                </div>
              </div>
            ))}
          </div>

          {/* Deck Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '13px',
            color: '#00ff00',
            fontWeight: 'bold'
          }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: '8px'
            }}>
              📥 Draw Pile: {gameState.drawPile} cards
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: '8px'
            }}>
              📤 Open Pile: {gameState.openPile?.length || 0} cards
            </div>
          </div>
        </div>

        {/* YOUR TABLE */}
        <div style={{
          background: 'rgba(100, 200, 100, 0.08)',
          borderRadius: '20px',
          padding: '25px',
          border: '3px solid rgba(100, 200, 100, 0.4)',
          animation: 'slideInUp 0.8s ease-out 0.2s both'
        }}>
          <h2 style={{
            color: '#6bcf7f',
            marginBottom: '20px',
            fontSize: '24px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>⚽ Your Pitch</span>
            <span style={{
              background: '#6bcf7f',
              color: '#000',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '16px',
              fontWeight: 'bold'
            }}>
              {gameState.scores[0]} pts
            </span>
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            minHeight: '150px',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '15px',
            borderRadius: '12px'
          }}>
            {gameState.tables[0]?.length > 0 ? (
              gameState.tables[0]?.map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: '#e8f5e9',
                    border: '2px solid #6bcf7f',
                    padding: '12px',
                    borderRadius: '10px',
                    minWidth: '100px',
                    textAlign: 'center',
                    animation: 'slideInUp 0.5s ease-out'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1a4d2e' }}>
                    {card.name}
                  </div>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#00ff00'
                  }}>
                    +{card.points} pts
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                width: '100%',
                textAlign: 'center',
                color: '#666',
                fontSize: '14px'
              }}>
                No cards played yet. Play cards to start scoring!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PHASE INDICATOR & CONTROLS */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        animation: 'slideInUp 0.8s ease-out 0.3s both'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '20px',
          padding: '30px',
          border: '2px solid rgba(0, 255, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Phase Indicator */}
          <div style={{
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#aaa',
              marginBottom: '15px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Current Phase
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginBottom: '20px'
            }}>
              {['draw', 'play', 'discard'].map((phase) => (
                <div
                  key={phase}
                  style={{
                    padding: '12px 20px',
                    borderRadius: '20px',
                    background: currentPhase === phase ? '#00ff00' : 'rgba(0, 255, 0, 0.2)',
                    color: currentPhase === phase ? '#000' : '#00ff00',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    transition: 'all 0.3s ease',
                    border: `2px solid ${currentPhase === phase ? '#00ff00' : 'rgba(0, 255, 0, 0.3)'}`,
                    boxShadow: currentPhase === phase ? '0 0 20px rgba(0, 255, 0, 0.5)' : 'none'
                  }}
                >
                  {phase === 'draw' && '📥'} {phase === 'play' && '🎯'} {phase === 'discard' && '📤'} {phase.toUpperCase()}
                </div>
              ))}
            </div>

            <p style={{
              fontSize: '16px',
              color: '#00ff00',
              fontWeight: 'bold'
            }}>
              {currentPhase === 'draw' && 'Draw a card from the deck or Open Pile'}
              {currentPhase === 'play' && 'Play your cards to score points'}
              {currentPhase === 'discard' && 'Discard 1 card to end your turn'}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '15px'
          }}>
            <button
              style={{
                padding: '16px',
                fontSize: '16px',
                background: currentPhase === 'draw' ? '#4ecdc4' : 'rgba(78, 205, 196, 0.3)',
                color: currentPhase === 'draw' ? '#000' : '#4ecdc4',
                border: 'none',
                borderRadius: '12px',
                cursor: currentPhase === 'draw' ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '900',
                boxShadow: currentPhase === 'draw' ? '0 0 20px rgba(78, 205, 196, 0.5)' : 'none'
              }}
              disabled={currentPhase !== 'draw'}
              onClick={() => setCurrentPhase('play')}
            >
              📥 Draw Card
            </button>

            <button
              style={{
                padding: '16px',
                fontSize: '16px',
                background: currentPhase === 'play' && selectedCards.length > 0 ? '#ffd93d' : 'rgba(255, 217, 61, 0.3)',
                color: currentPhase === 'play' && selectedCards.length > 0 ? '#000' : '#ffd93d',
                border: 'none',
                borderRadius: '12px',
                cursor: currentPhase === 'play' && selectedCards.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '900',
                boxShadow: currentPhase === 'play' && selectedCards.length > 0 ? '0 0 20px rgba(255, 217, 61, 0.5)' : 'none'
              }}
              disabled={currentPhase !== 'play' || selectedCards.length === 0}
              onClick={() => setCurrentPhase('discard')}
            >
              🎯 Play Cards ({selectedCards.length})
            </button>

            <button
              style={{
                padding: '16px',
                fontSize: '16px',
                background: currentPhase === 'discard' ? '#ff6b6b' : 'rgba(255, 107, 107, 0.3)',
                color: currentPhase === 'discard' ? '#fff' : '#ff6b6b',
                border: 'none',
                borderRadius: '12px',
                cursor: currentPhase === 'discard' ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: '900',
                boxShadow: currentPhase === 'discard' ? '0 0 20px rgba(255, 107, 107, 0.5)' : 'none'
              }}
              disabled={currentPhase !== 'discard'}
              onClick={() => {
                setSelectedCards([]);
                setCurrentPhase('draw');
              }}
            >
              📤 Discard & End Turn
            </button>
          </div>

          {/* Quick Actions */}
          <div style={{
            marginTop: '25px',
            display: 'flex',
            justifyContent: 'center',
            gap: '15px'
          }}>
            <button
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: 'rgba(0, 255, 0, 0.1)',
                color: '#00ff00',
                border: '2px solid #00ff00',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 255, 0, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 255, 0, 0.1)'}
            >
              ❓ Help
            </button>

            <button
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: 'rgba(255, 107, 107, 0.1)',
                color: '#ff6b6b',
                border: '2px solid #ff6b6b',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)'}
            >
              🏳️ Resign
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
