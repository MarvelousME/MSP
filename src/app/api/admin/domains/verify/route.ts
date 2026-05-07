import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { programId, domain } = await request.json();

        if (!programId || !domain) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Mocking DNS verification logic
        // In a real app, you'd use a library like 'dns' to check CNAME/A records
        const isVerified = true; // Simulating successful verification

        const updatedProgram = await prisma.program.update({
            where: { id: programId },
            data: {
                customDomain: domain,
                domainVerified: isVerified,
            },
        });

        return NextResponse.json({
            success: true,
            program: updatedProgram,
        });
    } catch (error) {
        console.error('Domain verification error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
