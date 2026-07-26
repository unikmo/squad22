import { Card, SQUAD22_CARDS, shuffleDeck, isLegalPositionPair, isLegalTraitTriple, getCardValue } from './cards';

export interface GameState {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Username: string;
  player2Username: string;
  hands: Card[][];
  tables: Card[][];
  scores: number[];
  targetScore: number;
  drawPile: Card[];
  openPile: Card | null;
  discardPiles: Card[][];
  currentPlayer: number;
  round: number;
  phase: 'draw' | 'play' | 'discard' | 'finished';
  cardDrawn: boolean[];
  cardsPlayed: boolean[];
  winner: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export function initializeGame(player1Id: string, player2Id: string, player1Username: string, player2Username: string, targetScore: number = 300): GameState {
  const deck = shuffleDeck();
  const hand1 = deck.splice(0, 7);
  const hand2 = deck.splice(0, 7);

  return {
    id: generateGameId(),
    player1Id,
    player2Id,
    player1Username,
    player2Username,
    hands: [hand1, hand2],
    tables: [[], []],
    scores: [0, 0],
    targetScore,
    drawPile: deck,
    openPile: null,
    discardPiles: [[], []],
    currentPlayer: 0,
    round: 1,
    phase: 'draw',
    cardDrawn: [false, false],
    cardsPlayed: [false, false],
    winner: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function drawCard(gameState: GameState, from: 'pile' | 'open'): GameState {
  if (gameState.phase !== 'draw') {
    throw new Error('Can only draw during draw phase');
  }

  if (gameState.cardDrawn[gameState.currentPlayer]) {
    throw new Error('Already drew this turn');
  }

  const updated = JSON.parse(JSON.stringify(gameState));

  if (from === 'pile') {
    if (updated.drawPile.length === 0) {
      throw new Error('Draw pile is empty');
    }
    const card = updated.drawPile.shift();
    updated.hands[updated.currentPlayer].push(card);
  } else if (from === 'open') {
    if (!updated.openPile) {
      throw new Error('No open pile card available');
    }
    updated.hands[updated.currentPlayer].push(updated.openPile);
    updated.openPile = null;
  }

  updated.cardDrawn[updated.currentPlayer] = true;
  updated.phase = 'play';
  updated.updatedAt = new Date();

  return updated;
}

export function playCards(gameState: GameState, cardIndices: number[]): GameState {
  if (gameState.phase !== 'play') {
    throw new Error('Can only play cards during play phase');
  }

  const hand = gameState.hands[gameState.currentPlayer];
  const cards = cardIndices.map(idx => hand[idx]);

  // Validate play
  if (cards.length === 2) {
    if (!isLegalPositionPair(cards[0], cards[1])) {
      throw new Error('Invalid position pair');
    }
  } else if (cards.length === 3) {
    if (!isLegalTraitTriple(cards)) {
      throw new Error('Invalid trait triple');
    }
  } else if (cards.length === 1 && cards[0].type !== 'flex') {
    throw new Error('Single cards must be flex');
  } else if (cards.length !== 1) {
    throw new Error('Play 1, 2, or 3 cards');
  }

  const updated = JSON.parse(JSON.stringify(gameState));
  const newHand = updated.hands[updated.currentPlayer].filter((_: Card, idx: number) => !cardIndices.includes(idx));
  updated.hands[updated.currentPlayer] = newHand;

  // Add to table and score
  cards.forEach((card: Card) => {
    updated.tables[updated.currentPlayer].push(card);
    updated.scores[updated.currentPlayer] += getCardValue(card, true);
  });

  updated.cardsPlayed[updated.currentPlayer] = true;
  updated.updatedAt = new Date();

  return updated;
}

export function discardCard(gameState: GameState, cardIndex: number): GameState {
  if (gameState.phase !== 'play' && gameState.phase !== 'discard') {
    throw new Error('Can only discard during play/discard phase');
  }

  const updated = JSON.parse(JSON.stringify(gameState));
  const hand = updated.hands[updated.currentPlayer];
  const card = hand[cardIndex];

  // Remove from hand and add to discard
  updated.hands[updated.currentPlayer] = hand.filter((_: Card, idx: number) => idx !== cardIndex);
  updated.discardPiles[updated.currentPlayer].push(card);
  updated.openPile = card;

  // Apply hand penalties
  updated.hands[updated.currentPlayer].forEach((c: Card) => {
    updated.scores[updated.currentPlayer] += getCardValue(c, false);
  });

  // Switch turn
  updated.currentPlayer = updated.currentPlayer === 0 ? 1 : 0;
  updated.round++;
  updated.phase = 'draw';
  updated.cardDrawn = [false, false];
  updated.cardsPlayed = [false, false];

  // Check win condition
  if (updated.scores[0] >= updated.targetScore) {
    updated.phase = 'finished';
    updated.winner = updated.player1Id;
  } else if (updated.scores[1] >= updated.targetScore) {
    updated.phase = 'finished';
    updated.winner = updated.player2Id;
  }

  updated.updatedAt = new Date();

  return updated;
}

export function canPlayCards(gameState: GameState, cardIndices: number[]): boolean {
  try {
    const hand = gameState.hands[gameState.currentPlayer];
    const cards = cardIndices.map(idx => hand[idx]);

    if (cards.length === 2) {
      return isLegalPositionPair(cards[0], cards[1]);
    } else if (cards.length === 3) {
      return isLegalTraitTriple(cards);
    } else if (cards.length === 1 && cards[0].type === 'flex') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
