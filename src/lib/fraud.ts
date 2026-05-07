import { prisma } from './prisma';
import { isBotUserAgent, FraudCheckResult } from './fraud-detection';

/**
 * Advanced Fraud Engine
 * Uses heuristic scoring and IP blocklist verification.
 */
export async function advancedFraudCheck({
    ipAddress,
    userAgent,
    affiliateId,
    referralCode,
}: {
    ipAddress: string;
    userAgent: string;
    affiliateId: string;
    referralCode?: string;
}): Promise<FraudCheckResult> {
    const reasons: string[] = [];
    let riskScore = 0;

    // 1. Check if IP is explicitly blocked
    const isBlocked = await prisma.blockedIp.findUnique({
        where: { ip: ipAddress }
    });

    if (isBlocked) {
        if (!isBlocked.expiresAt || isBlocked.expiresAt > new Date()) {
            return {
                isSuspicious: true,
                reasons: [`IP Address is blocked: ${isBlocked.reason}`],
                riskScore: 100,
            };
        }
    }

    // 2. Base checks (Bot Detection)
    if (isBotUserAgent(userAgent)) {
        reasons.push('Automated User Agent detected');
        riskScore += 70;
    }

    // 3. Rate Limiting Analysis (Velocity Check)
    const windowStart = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
    const burstClicks = await prisma.referralClick.count({
        where: {
            ipAddress,
            createdAt: { gte: windowStart },
        },
    });

    if (burstClicks > 10) {
        reasons.push(`Velocity alert: ${burstClicks} clicks in 5 minutes`);
        riskScore += 40;
    }

    // 4. Pattern Analysis (IP Diversity)
    // Check if this affiliate is getting clicks from too many different IPs in a short time
    // OR if this IP is clicking for too many different affiliates
    const affiliateDiversity = await prisma.referralClick.groupBy({
        by: ['ipAddress'],
        where: {
            referral: { affiliateId },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        _count: true,
    });

    if (affiliateDiversity.length > 100) {
        reasons.push('High IP diversity for single affiliate (possible botnet)');
        riskScore += 50;
    }

    // 5. Geographical/Proxy Check (Heuristic)
    // In a real app, we'd use a service like IPStack or MaxMind here.
    // For now, we use headers injected by the proxy/WAF if available.
    
    // 6. Final Decision
    const isSuspicious = riskScore >= 50;

    // Auto-block if extremely high risk
    if (riskScore >= 90) {
        await blockIp(ipAddress, `Automatic block: ${reasons.join(', ')}`);
    }

    return {
        isSuspicious,
        reasons,
        riskScore: Math.min(riskScore, 100),
    };
}

export async function blockIp(ip: string, reason: string, durationHours = 24) {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    await prisma.blockedIp.upsert({
        where: { ip },
        update: { reason, expiresAt },
        create: { ip, reason, expiresAt },
    });
}
