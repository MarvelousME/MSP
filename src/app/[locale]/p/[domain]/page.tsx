import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function CustomDomainPage({
    params,
}: {
    params: Promise<{ domain: string }>;
}) {
    const { domain } = await params;

    // Find the program associated with this custom domain
    const program = await prisma.program.findUnique({
        where: { customDomain: domain },
    });

    if (!program || !program.domainVerified) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8 text-center">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-white">
                        {program.name}
                    </h1>
                    <p className="mx-auto max-w-[600px] text-slate-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        {program.description || 'Welcome to our exclusive affiliate partner portal.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">Become a Partner</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-400">
                                Join our program and start earning up to {program.commissionRate}% commission on every referral.
                            </p>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                Register Now
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="text-white">Already a Partner?</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-slate-400">
                                Log in to your dashboard to track your earnings and access marketing materials.
                            </p>
                            <Button variant="outline" className="w-full border-slate-700 text-white hover:bg-slate-800">
                                Partner Login
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <footer className="pt-12 text-sm text-slate-500">
                    &copy; 2026 {program.name}. Powered by My Stable Prime.
                </footer>
            </div>
        </div>
    );
}
