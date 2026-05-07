import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const leaderboard = await prisma.leaderboardEntry.findMany({
      orderBy: {
        rank: 'asc',
      },
      include: {
        affiliate: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                profilePicture: true,
                gender: true,
              },
            },
            badges: {
              include: {
                badge: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
