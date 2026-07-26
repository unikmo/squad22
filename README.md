# ⚽ Squad22 - Card Game for Football Fans

Squad22 is a strategic card game where players build their ultimate football squad by playing cards strategically. Reach your target score to win!

## 🎮 Game Features

- **58-Card Deck**: 54 player cards (GK, DEF, MID, STR) + 4 staff cards
- **Strategic Gameplay**: Position pairs & trait triples for powerful combinations
- **Multiplayer**: Challenge friends in real-time battles
- **League System**: 36-game tournaments with rankings
- **Live Leaderboard**: Track global player standings

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development
```bash
# Install dependencies
npm install

# Set up environment (copy .env.example to .env.local)
cp .env.example .env.local

# Add your Supabase credentials to .env.local

# Run development server
npm run dev

# Open http://localhost:3000
```

### Deploy to Vercel
```bash
# 1. Push to GitHub
git add .
git commit -m "Squad22 deployment"
git push origin main

# 2. Go to vercel.com and import the repo
# 3. Add environment variables
# 4. Deploy!
```

## 📖 How to Play

### Turn Structure
1. **DRAW Phase**: Draw 1 card from pile or open pile
2. **PLAY Phase**: Play valid combinations (position pairs or trait triples)
3. **DISCARD Phase**: Discard 1 card face-up

### Scoring
- **Common Cards**: +10 on table, -10 in hand
- **Rare Cards**: +5 on table, -5 in hand
- **Flex Cards**: 0 on table, -15 in hand
- **Staff Cards**: +10 on table, -10 in hand

### Winning
- Reach target score (300, 500, or 600) to win
- Lose if hand is empty and draw pile is empty

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 + React 19
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **Language**: TypeScript

## 📁 Project Structure

```
squad22/
├── app/                    # Next.js app directory
│   ├── api/               # API endpoints
│   ├── game/              # Game pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Styles
├── lib/                   # Utilities & logic
│   ├── cards.ts           # Card database
│   ├── gameLogic.ts       # Game mechanics
│   └── supabase.ts        # Database client
├── public/                # Static assets
│   └── images/cards/      # Card images
└── SUPABASE_SCHEMA.sql   # Database setup
```

## 🔧 Environment Variables

```env
# Supabase (get from supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Game Config
NEXT_PUBLIC_GAME_TARGET_SCORE=300
NEXT_PUBLIC_MAX_PLAYERS_PER_GAME=2
```

## 📋 Roadmap

- [x] Core game logic (draw, play, discard)
- [x] 58-card deck system
- [ ] WebSocket multiplayer
- [ ] User authentication
- [ ] League system
- [ ] Leaderboard
- [ ] Payment integration ($15/season)
- [ ] Card marketplace ($49.99/$99.99 packs)

## 🐛 Troubleshooting

**Issue**: "Module not found"
- Run `npm install` to install dependencies

**Issue**: "Supabase connection failed"
- Check `.env.local` has correct credentials
- Verify Supabase project is active

**Issue**: "Card images not found"
- Ensure images are in `public/images/cards/`
- Check paths in `lib/cards.ts`

## 📄 License

MIT - See LICENSE file for details

## 👤 Author

Built by Tichi (@mbanwie@googlemail.com)

---

**Ready to play? Start with `npm run dev` and head to http://localhost:3000! ⚽**
