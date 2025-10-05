import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { evaluationId, bossIdentifier } = await request.json();

    if (!evaluationId || !bossIdentifier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('evaluations')
      .update({ boss_identifier: bossIdentifier })
      .eq('id', evaluationId);

    if (error) {
      console.error('Error updating boss identifier:', error);
      return NextResponse.json(
        { error: 'Failed to update boss identifier' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in update-boss-identifier API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
