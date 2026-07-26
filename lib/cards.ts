/**
 * Squad22 - Complete 58-Card Deck Database
 * Card properties: name, position, trait, type, points
 */

export interface Card {
  id: number;
  name: string;
  position: number | string;
  trait: string;
  type: 'common' | 'rare' | 'flex' | 'staff';
  points: number;
  image: string;
}

export const SQUAD22_CARDS: Card[] = [
  // PLAYERS (54 cards) - Goalkeeper, Defenders, Midfielders, Strikers
  // Positions 1: GK, 2-5: DEF, 6-9: MID, 10-11: STR

  // Goalkeepers (Position 1) - 2 cards
  { id: 1, name: 'Bertrand', position: 1, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_1 Bertrand.png' },
  { id: 2, name: 'Njaso', position: 1, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_2 Njaso.png' },

  // Defenders (Positions 2-5) - 12 cards (3 per position)
  { id: 3, name: 'Carifive', position: 2, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_3 Carifive.png' },
  { id: 4, name: 'James', position: 2, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_4 James.png' },
  { id: 5, name: 'Lars', position: 2, trait: 'Yellow', type: 'rare', points: 5, image: '/images/cards/_5 Lars.png' },

  { id: 6, name: 'Ajeck', position: 3, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_6 Ajeck.png' },
  { id: 7, name: 'Nji', position: 3, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_7 Nji.png' },
  { id: 8, name: 'Ashley', position: 3, trait: 'Blue', type: 'rare', points: 5, image: '/images/cards/_8 Ashley.png' },

  { id: 9, name: 'Fri', position: 4, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_9 Fri.png' },
  { id: 10, name: 'Mifi', position: 4, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_10 Mifi.png' },
  { id: 11, name: 'Ewgenij', position: 4, trait: 'Green', type: 'rare', points: 5, image: '/images/cards/_11 Ewgenij.png' },

  { id: 12, name: 'Peace', position: 5, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_12 Peace.png' },
  { id: 13, name: 'Brun', position: 5, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_13 Brun.png' },
  { id: 14, name: 'Bryan', position: 5, trait: 'Red', type: 'rare', points: 5, image: '/images/cards/_14 Bryan.png' },

  // Midfielders (Positions 6-9) - 20 cards (5 per position)
  { id: 15, name: 'Teche', position: 6, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_15 Teche.png' },
  { id: 16, name: 'Enjeck', position: 6, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_16 Enjeck.png' },
  { id: 17, name: 'Kem', position: 6, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_17 Kem.png' },
  { id: 18, name: 'Ngum', position: 6, trait: 'Yellow', type: 'rare', points: 5, image: '/images/cards/_18 Ngum.png' },
  { id: 19, name: 'Akem', position: 6, trait: 'Green', type: 'flex', points: 0, image: '/images/cards/_19 Akem.png' },

  { id: 20, name: 'Ebongue', position: 7, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_20 Ebongue.png' },
  { id: 21, name: 'Guizo', position: 7, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_21 Guizo.png' },
  { id: 22, name: 'Talla', position: 7, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_22 Talla.png' },
  { id: 23, name: 'Sinyomo', position: 7, trait: 'Green', type: 'rare', points: 5, image: '/images/cards/_23 Sinyomo.png' },
  { id: 24, name: 'Tapon', position: 7, trait: 'Red', type: 'flex', points: 0, image: '/images/cards/_24 Tapon.png' },

  { id: 25, name: 'Choupo', position: 8, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_25 Choupo.png' },
  { id: 26, name: 'Nkoudou', position: 8, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_26 Nkoudou.png' },
  { id: 27, name: 'Siani', position: 8, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_27 Siani.png' },
  { id: 28, name: 'Mbeumo', position: 8, trait: 'Red', type: 'rare', points: 5, image: '/images/cards/_28 Mbeumo.png' },
  { id: 29, name: 'Honey', position: 8, trait: 'Blue', type: 'flex', points: 0, image: '/images/cards/_29 Honey.png' },

  { id: 30, name: 'Kouakou', position: 9, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_30 Kouakou.png' },
  { id: 31, name: 'Ekambi', position: 9, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_31 Ekambi.png' },
  { id: 32, name: 'Nkoulou', position: 9, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_32 Nkoulou.png' },
  { id: 33, name: 'Bahoken', position: 9, trait: 'Blue', type: 'rare', points: 5, image: '/images/cards/_33 Bahoken.png' },
  { id: 34, name: 'Njie', position: 9, trait: 'Yellow', type: 'flex', points: 0, image: '/images/cards/_34 Njie.png' },

  // Strikers (Positions 10-11) - 20 cards (10 per position)
  { id: 35, name: 'Djourou', position: 10, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_35 Djourou.png' },
  { id: 36, name: 'Song', position: 10, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_36 Song.png' },
  { id: 37, name: 'Makoun', position: 10, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_37 Makoun.png' },
  { id: 38, name: 'Enoh', position: 10, trait: 'Yellow', type: 'rare', points: 5, image: '/images/cards/_38 Enoh.png' },
  { id: 39, name: 'Mbiatem', position: 10, trait: 'Green', type: 'flex', points: 0, image: '/images/cards/_39 Mbiatem.png' },
  { id: 40, name: 'Matip', position: 10, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_40 Matip.png' },
  { id: 41, name: 'Webo', position: 10, trait: 'Blue', type: 'rare', points: 5, image: '/images/cards/_41 Webo.png' },
  { id: 42, name: 'Doumbe', position: 10, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_42 Doumbe.png' },
  { id: 43, name: 'Fecund', position: 10, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_43 Fecund.png' },
  { id: 44, name: 'Chong', position: 10, trait: 'Red', type: 'rare', points: 5, image: '/images/cards/_44 Chong.png' },

  { id: 45, name: 'Bassogog', position: 11, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_45 Bassogog.png' },
  { id: 46, name: 'Afuenyi', position: 11, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_46 Afuenyi.png' },
  { id: 47, name: 'Etouga', position: 11, trait: 'Green', type: 'common', points: 10, image: '/images/cards/_47 Etouga.png' },
  { id: 48, name: 'Kuma', position: 11, trait: 'Red', type: 'rare', points: 5, image: '/images/cards/_48 Kuma.png' },
  { id: 49, name: 'Nyonga', position: 11, trait: 'Blue', type: 'flex', points: 0, image: '/images/cards/_49 Nyonga.png' },
  { id: 50, name: 'Mateta', position: 11, trait: 'Yellow', type: 'common', points: 10, image: '/images/cards/_50 Mateta.png' },
  { id: 51, name: 'Anguissa', position: 11, trait: 'Green', type: 'rare', points: 5, image: '/images/cards/_51 Anguissa.png' },
  { id: 52, name: 'Lamkel Zé', position: 11, trait: 'Red', type: 'common', points: 10, image: '/images/cards/_52 Lamkel Zé.png' },
  { id: 53, name: 'N\'Koulou', position: 11, trait: 'Blue', type: 'common', points: 10, image: '/images/cards/_53 N\'Koulou.png' },
  { id: 54, name: 'Aboubakar', position: 11, trait: 'Yellow', type: 'rare', points: 5, image: '/images/cards/_54 Aboubakar.png' },

  // STAFF CARDS (4 cards) - Special cards for team management
  { id: 55, name: 'Coach', position: 'Staff', trait: 'Coach', type: 'staff', points: 10, image: '/images/cards/_55 Coach.png' },
  { id: 56, name: 'Medic', position: 'Staff', trait: 'Medical', type: 'staff', points: 10, image: '/images/cards/_56 Medic.png' },
  { id: 57, name: 'Psychologist', position: 'Staff', trait: 'Mental', type: 'staff', points: 10, image: '/images/cards/_57 Psychologist.png' },
  { id: 58, name: 'Analyst', position: 'Staff', trait: 'Analysis', type: 'staff', points: 10, image: '/images/cards/_58 Analyst.png' },
];

export function getCardById(id: number): Card | undefined {
  return SQUAD22_CARDS.find(card => card.id === id);
}

export function shuffleDeck(cards: Card[] = SQUAD22_CARDS): Card[] {
  const deck = [...cards];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function isLegalPositionPair(card1: Card, card2: Card): boolean {
  return card1.position === card2.position;
}

export function isLegalTraitTriple(cards: Card[]): boolean {
  if (cards.length !== 3) return false;
  const trait = cards[0].trait;
  const allSameTrait = cards.every(c => c.trait === trait);
  const allDifferentPositions = new Set(cards.map(c => c.position)).size === 3;
  return allSameTrait && allDifferentPositions;
}

export function getCardValue(card: Card, isOnTable: boolean): number {
  if (card.type === 'flex') {
    return isOnTable ? 0 : -15;
  }
  return isOnTable ? card.points : -card.points;
}
