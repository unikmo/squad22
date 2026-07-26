'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('intro');

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f1c32 0%, #1a3a52 50%, #0f2847 100%)' }}>
      {/* ANIMATED HERO SECTION */}
      <section className="pitch-background" style={{
        textAlign: 'center',
        padding: '80px 20px 60px',
        background: 'linear-gradient(135deg, #1a4d2e 0%, #2d6a4f 50%, #1a4d2e 100%)',
        borderBottom: '4px solid #00ff00',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '500px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Animated ball */}
        <div className="animate-ball-roll" style={{
          position: 'absolute',
          top: '60px',
          left: '50px',
          fontSize: '48px',
          zIndex: 1
        }}>⚽</div>

        {/* Hero content */}
        <div className="animate-slide-in-down" style={{
          zIndex: 2,
          maxWidth: '800px'
        }}>
          <div style={{
            fontSize: '120px',
            marginBottom: '20px',
            animation: 'pulse 2s ease-in-out infinite',
            textShadow: '0 0 40px rgba(0, 255, 0, 0.5)'
          }}>⚽</div>

          <h1 style={{
            fontSize: '72px',
            fontWeight: '900',
            color: '#00ff00',
            margin: '0 0 15px 0',
            textShadow: '3px 3px 0px rgba(0,0,0,0.8), 0 0 50px rgba(0, 255, 0, 0.5)',
            letterSpacing: '3px'
          }}>
            SQUAD22
          </h1>

          <p style={{
            fontSize: '32px',
            color: '#fff',
            margin: '0 0 20px 0',
            fontWeight: '600',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            animation: 'slideInUp 1s ease-out 0.2s both'
          }}>
            Build Your Dream Squad
          </p>

          <p style={{
            fontSize: '18px',
            color: '#ccc',
            margin: '0',
            fontStyle: 'italic',
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            animation: 'slideInUp 1s ease-out 0.4s both'
          }}>
            A Strategic Football Card Game of Skill, Strategy & Glory
          </p>
        </div>

        {/* Floating circles decoration */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(0, 255, 0, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 3s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '100px',
          right: '30px',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0, 255, 0, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
      </section>

      {/* TAB NAVIGATION */}
      <section style={{
        background: 'rgba(255,255,255,0.05)',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        borderBottom: '2px solid rgba(0, 255, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <button
          onClick={() => setActiveTab('intro')}
          className="animate-slide-in-down"
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: activeTab === 'intro' ? '#00ff00' : 'rgba(0, 255, 0, 0.2)',
            color: activeTab === 'intro' ? '#000' : '#00ff00',
            border: '2px solid #00ff00',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎮 What is Squad22?
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className="animate-slide-in-down"
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: activeTab === 'rules' ? '#00ff00' : 'rgba(0, 255, 0, 0.2)',
            color: activeTab === 'rules' ? '#000' : '#00ff00',
            border: '2px solid #00ff00',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          📋 How to Play
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className="animate-slide-in-down"
          style={{
            padding: '12px 30px',
            fontSize: '16px',
            fontWeight: 'bold',
            background: activeTab === 'cards' ? '#00ff00' : 'rgba(0, 255, 0, 0.2)',
            color: activeTab === 'cards' ? '#000' : '#00ff00',
            border: '2px solid #00ff00',
            borderRadius: '25px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎨 Card System
        </button>
      </section>

      {/* CONTENT SECTIONS */}
      <section style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>

        {/* INTRO TAB */}
        {activeTab === 'intro' && (
          <div className="animate-fade-in" style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '50px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{
              fontSize: '42px',
              color: '#1a4d2e',
              marginBottom: '30px',
              textAlign: 'center',
              fontWeight: '900'
            }}>
              🎮 What is Squad22?
            </h2>

            <p style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#333',
              marginBottom: '30px',
              textAlign: 'center'
            }}>
              Squad22 is a <strong>strategic card game</strong> where you become a football manager. Build your perfect squad by strategically playing player cards to earn points and reach 300 to win!
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '25px',
              marginTop: '40px'
            }}>
              {[
                { emoji: '🧤', title: 'Goalkeeper', desc: 'Position 1 - Stopper at the back' },
                { emoji: '🛡️', title: 'Defenders', desc: 'Positions 2-4 - Your defensive line' },
                { emoji: '🎯', title: 'Midfielders', desc: 'Positions 5-8 - Control the game' },
                { emoji: '⚡', title: 'Strikers', desc: 'Positions 9-11 - Attack & Score' }
              ].map((pos, idx) => (
                <div
                  key={idx}
                  className="stagger-item"
                  style={{
                    background: 'linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)',
                    padding: '25px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    border: '3px solid #1a4d2e',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ fontSize: '48px', marginBottom: '15px' }}>{pos.emoji}</div>
                  <h3 style={{ color: '#1a4d2e', marginBottom: '8px', fontSize: '18px' }}>
                    {pos.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666' }}>{pos.desc}</p>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '50px',
              background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%)',
              padding: '30px',
              borderRadius: '15px',
              borderLeft: '5px solid #00ff00'
            }}>
              <h3 style={{ color: '#1a4d2e', marginBottom: '15px', fontSize: '20px' }}>
                ✨ Why Squad22?
              </h3>
              <ul style={{ fontSize: '16px', color: '#333', lineHeight: '2', marginLeft: '20px' }}>
                <li>⚡ Quick to learn, deep strategy to master</li>
                <li>🏆 Every card matters - no filler</li>
                <li>🎯 Perfect for football & strategy game fans</li>
                <li>👥 Play vs AI or challenge friends</li>
                <li>🔥 Dynamic gameplay with combos & synergies</li>
              </ul>
            </div>
          </div>
        )}

        {/* RULES TAB */}
        {activeTab === 'rules' && (
          <div className="animate-fade-in" style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '50px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{
              fontSize: '42px',
              color: '#1a4d2e',
              marginBottom: '40px',
              textAlign: 'center',
              fontWeight: '900'
            }}>
              📋 How to Play
            </h2>

            {/* Game Flow */}
            <div style={{ marginBottom: '50px' }}>
              <h3 style={{
                fontSize: '28px',
                color: '#1a4d2e',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                Your Turn (3 Phases)
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px'
              }}>
                {[
                  {
                    phase: 'DRAW',
                    emoji: '📥',
                    desc: 'Draw 1 card from your deck',
                    color: '#4ecdc4'
                  },
                  {
                    phase: 'PLAY',
                    emoji: '🎯',
                    desc: 'Play as many legal card combinations as possible',
                    color: '#ffd93d'
                  },
                  {
                    phase: 'DISCARD',
                    emoji: '📤',
                    desc: 'Discard 1 card to end your turn',
                    color: '#ff6b6b'
                  }
                ].map((step, idx) => (
                  <div
                    key={idx}
                    className="stagger-item"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}20 0%, ${step.color}40 100%)`,
                      padding: '30px',
                      borderRadius: '15px',
                      border: `3px solid ${step.color}`,
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      fontSize: '56px',
                      marginBottom: '15px'
                    }}>
                      {step.emoji}
                    </div>
                    <h4 style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#1a4d2e',
                      marginBottom: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '2px'
                    }}>
                      {step.phase}
                    </h4>
                    <p style={{
                      fontSize: '15px',
                      color: '#333',
                      lineHeight: '1.6'
                    }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Playing Cards */}
            <div style={{
              background: '#f9f9f9',
              padding: '35px',
              borderRadius: '15px',
              borderLeft: '5px solid #2d6a4f',
              marginBottom: '40px'
            }}>
              <h3 style={{
                fontSize: '26px',
                color: '#1a4d2e',
                marginBottom: '25px'
              }}>
                💎 How to Score Points
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                  <h4 style={{
                    fontSize: '18px',
                    color: '#2d6a4f',
                    marginBottom: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>👥</span>
                    Position Pair
                  </h4>
                  <p style={{
                    fontSize: '15px',
                    color: '#333',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    Play 2 cards with the <strong>same position</strong> (e.g., two Striker cards)
                  </p>
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#00ff00'
                  }}>
                    +10 Points
                  </div>
                </div>

                <div>
                  <h4 style={{
                    fontSize: '18px',
                    color: '#2d6a4f',
                    marginBottom: '12px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '24px' }}>🎨</span>
                    Trait Triple
                  </h4>
                  <p style={{
                    fontSize: '15px',
                    color: '#333',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    Play 3 cards with the <strong>same trait</strong> but in <strong>different positions</strong>
                  </p>
                  <div style={{
                    background: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#00ff00'
                  }}>
                    +5 Points
                  </div>
                </div>
              </div>
            </div>

            {/* Win Condition */}
            <div style={{
              background: 'linear-gradient(135deg, #00ff00 0%, #00dd00 100%)',
              padding: '35px',
              borderRadius: '15px',
              textAlign: 'center',
              color: '#000'
            }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}>
                🏆 Win Condition
              </h3>
              <p style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: '0'
              }}>
                First player to reach <strong>300 points</strong> wins the match!
              </p>
            </div>
          </div>
        )}

        {/* CARD SYSTEM TAB */}
        {activeTab === 'cards' && (
          <div className="animate-fade-in" style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '50px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}>
            <h2 style={{
              fontSize: '42px',
              color: '#1a4d2e',
              marginBottom: '40px',
              textAlign: 'center',
              fontWeight: '900'
            }}>
              🎨 Card System & Traits
            </h2>

            <p style={{
              fontSize: '18px',
              color: '#333',
              marginBottom: '40px',
              textAlign: 'center',
              lineHeight: '1.8'
            }}>
              Each card has two key attributes: <strong>Position</strong> (GK, DEF, MID, STR) and <strong>Trait</strong> (Red, Blue, Yellow, Green). Build combos by matching positions or traits!
            </p>

            {/* Card Traits */}
            <div style={{
              marginBottom: '50px'
            }}>
              <h3 style={{
                fontSize: '28px',
                color: '#1a4d2e',
                marginBottom: '30px',
                textAlign: 'center'
              }}>
                🎯 The 4 Traits
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                {[
                  { name: 'Red', color: '#ff6b6b', icon: '🔴' },
                  { name: 'Blue', color: '#4ecdc4', icon: '🔵' },
                  { name: 'Yellow', color: '#ffd93d', icon: '🟡' },
                  { name: 'Green', color: '#6bcf7f', icon: '🟢' }
                ].map((trait, idx) => (
                  <div
                    key={idx}
                    className="stagger-item"
                    style={{
                      background: `${trait.color}20`,
                      padding: '30px',
                      borderRadius: '15px',
                      border: `3px solid ${trait.color}`,
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '48px', marginBottom: '15px' }}>
                      {trait.icon}
                    </div>
                    <h4 style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: trait.color,
                      marginBottom: '8px'
                    }}>
                      {trait.name} Trait
                    </h4>
                    <p style={{
                      fontSize: '14px',
                      color: '#333'
                    }}>
                      Combine with 2 other cards of same trait in different positions for +5 points
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Types */}
            <div style={{
              background: '#f9f9f9',
              padding: '35px',
              borderRadius: '15px',
              borderLeft: '5px solid #2d6a4f'
            }}>
              <h3 style={{
                fontSize: '28px',
                color: '#1a4d2e',
                marginBottom: '25px'
              }}>
                📦 Card Types in the Deck
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  borderLeft: '4px solid #FFD700'
                }}>
                  <h4 style={{ color: '#1a4d2e', marginBottom: '8px', fontSize: '16px' }}>
                    54 Player Cards
                  </h4>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    11 positions × 4 positions (1 GK, 3 DEF, 4 MID, 3 STR)
                  </p>
                </div>

                <div style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  borderLeft: '4px solid #FF6B6B'
                }}>
                  <h4 style={{ color: '#1a4d2e', marginBottom: '8px', fontSize: '16px' }}>
                    4 Staff Cards
                  </h4>
                  <p style={{ fontSize: '14px', color: '#666' }}>
                    Special utility cards with unique effects
                  </p>
                </div>
              </div>

              <div style={{
                marginTop: '25px',
                padding: '20px',
                background: 'white',
                borderRadius: '10px',
                borderLeft: '4px solid #4ECDC4',
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.8'
              }}>
                <strong>💡 Pro Tip:</strong> Look for cards with matching traits to create powerful Trait Triples. The more you understand the synergies, the better your strategic decisions!
              </div>
            </div>
          </div>
        )}
      </section>

      {/* PLAY SECTION */}
      <section style={{
        maxWidth: '600px',
        margin: '60px auto',
        padding: '0 20px 60px',
        animation: 'slideInUp 1s ease-out 0.6s both'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%)',
          borderRadius: '25px',
          padding: '50px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          border: '3px solid rgba(0, 255, 0, 0.5)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '200px',
            height: '200px',
            background: 'radial-gradient(circle, rgba(0, 255, 0, 0.3) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />

          <h2 style={{
            color: '#00ff00',
            marginBottom: '20px',
            textAlign: 'center',
            fontSize: '36px',
            fontWeight: '900',
            textShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
            position: 'relative',
            zIndex: 2
          }}>
            ⚽ Start Your Journey
          </h2>

          <p style={{
            fontSize: '16px',
            color: '#00ff00',
            marginBottom: '30px',
            textAlign: 'center',
            fontStyle: 'italic',
            position: 'relative',
            zIndex: 2
          }}>
            Enter your squad name and choose your opponent
          </p>

          <div style={{ marginBottom: '25px', position: 'relative', zIndex: 2 }}>
            <label style={{
              display: 'block',
              marginBottom: '10px',
              color: '#00ff00',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              Your Squad Name:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., Manchester United, Liverpool, City Stars..."
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '12px',
                border: '3px solid #00ff00',
                fontSize: '16px',
                boxSizing: 'border-box',
                fontWeight: 'bold',
                background: '#fff',
                color: '#1a4d2e',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 0, 0.5)'}
              onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
            />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            position: 'relative',
            zIndex: 2
          }}>
            <Link href={`/game?mode=ai&player=${encodeURIComponent(username)}`}>
              <button
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  background: username ? '#00ff00' : 'rgba(0, 255, 0, 0.3)',
                  color: username ? '#000' : '#666',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: username ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '900',
                  boxShadow: username ? '0 0 20px rgba(0, 255, 0, 0.5)' : 'none'
                }}
                disabled={!username}
                onMouseOver={(e) => username && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                🤖 vs AI
              </button>
            </Link>

            <Link href={`/game?mode=multiplayer&player=${encodeURIComponent(username)}`}>
              <button
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  background: username ? 'linear-gradient(135deg, #ff6b6b, #ff5252)' : 'rgba(255, 107, 107, 0.3)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: username ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontWeight: '900',
                  boxShadow: username ? '0 0 20px rgba(255, 107, 107, 0.5)' : 'none'
                }}
                disabled={!username}
                onMouseOver={(e) => username && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                👥 Multiplayer
              </button>
            </Link>
          </div>

          <p style={{
            fontSize: '13px',
            color: '#00ff00',
            marginTop: '20px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
            opacity: 0.8
          }}>
            💡 Start with "vs AI" to learn. Challenge friends in Multiplayer!
          </p>
        </div>
      </section>

      {/* FOOTER TIPS */}
      <section style={{
        background: 'rgba(0, 255, 0, 0.05)',
        borderTop: '2px solid rgba(0, 255, 0, 0.3)',
        padding: '40px 20px',
        textAlign: 'center'
      }}>
        <h3 style={{
          color: '#00ff00',
          marginBottom: '20px',
          fontSize: '20px',
          fontWeight: 'bold'
        }}>
          ✨ Key Tips to Win
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { emoji: '🎯', tip: 'Master position pairs for consistent scoring' },
            { emoji: '🎨', tip: 'Build trait triples for maximum efficiency' },
            { emoji: '⏰', tip: 'Timing when to draw from the Open Pile is crucial' },
            { emoji: '🧠', tip: 'Watch what opponents play to predict their strategy' }
          ].map((item, idx) => (
            <div
              key={idx}
              className="stagger-item"
              style={{
                fontSize: '14px',
                color: '#00ff00'
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{item.emoji}</div>
              {item.tip}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
