import { NextRequest, NextResponse } from 'next/server';
import { initializeGame } from '@/lib/gameLogic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { player1Id, player2Id, player1Username, player2Username, targetScore = 300 } = body;

    if (!player1Id || !player2Id || !player1Username || !player2Username) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const game = initializeGame(player1Id, player2Id, player1Username, player2Username, targetScore);

    // TODO: Save to Supabase
    // const { data, error } = await supabase
    //   .from('games')
    //   .insert([game])
    //   .select()
    //   .single();

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}
