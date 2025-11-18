'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';
import Backplate from '@/app/components/Backplate';
import { useAuth } from '@/app/context/AuthContext';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user?.isAdmin)) {
      router.replace('/account');
    }
  }, [isAuthenticated, loading, router, user]);

  const canView = isAuthenticated && user?.isAdmin;

  return (
    <main className="min-h-screen text-neutral-100">
      <NavBar />
      <PageShell imageSrc="/search_screen.jpg" fadeHeight="40vh" withFixedHeaderOffset>
        <div className="flex min-h-full flex-col">
          <section className="flex-1 py-16">
            <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
              <Backplate className="w-full">
                <header className="space-y-2 text-center sm:text-left">
                  <p className="text-sm uppercase tracking-wide text-amber-300/80">Administration</p>
                  <h1 className="text-3xl font-semibold sm:text-4xl">Admin dashboard</h1>
                  <p className="text-sm text-neutral-300 sm:text-base">
                    This secure space is reserved for OutdoorSpot administrators.
                  </p>
                </header>

                <div className="mt-10">
                  {loading && (
                    <p className="text-neutral-300">Checking your access…</p>
                  )}

                  {!loading && !canView && (
                    <div className="space-y-4">
                      <p className="text-lg font-semibold text-white">You need admin access.</p>
                      <p className="text-sm text-neutral-300">
                        We redirected you back to your account page. If you believe this is a mistake, contact support.
                      </p>
                      <Link
                        href="/account"
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                      >
                        Return to account
                      </Link>
                    </div>
                  )}

                  {canView && (
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center sm:text-left">
                      <p className="text-sm uppercase tracking-widest text-neutral-400">Coming soon</p>
                      <h2 className="mt-3 text-2xl font-semibold text-white">Administrator tools</h2>
                      <p className="mt-4 text-sm text-neutral-300">
                        We’re building a comprehensive dashboard for approving locations, reviewing reports, and managing the
                        OutdoorSpot community. Check back soon for more controls.
                      </p>
                    </div>
                  )}
                </div>
              </Backplate>
            </div>
          </section>

          <div className="mt-auto">
            <Footer />
          </div>
        </div>
      </PageShell>
    </main>
  );
}
