'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';
import Backplate from '@/app/components/Backplate';
import { useAuth } from '@/app/context/AuthContext';

type PendingLocation = {
  id: string;
  name: string;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  createdAt: string;
  images?: string[] | null;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { user, isAuthenticated, loading, token } = useAuth();

  const [pendingLocations, setPendingLocations] = useState<PendingLocation[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user?.isAdmin)) {
      router.replace('/account');
    }
  }, [isAuthenticated, loading, router, user]);

  const canView = isAuthenticated && user?.isAdmin;

  const fetchPending = useCallback(async () => {
    if (!API_URL || API_URL === 'undefined' || !token) {
      setPendingError('Unable to reach the backend.');
      return;
    }

    setPendingLoading(true);
    setPendingError(null);

    try {
      const response = await fetch(`${API_URL}/api/locations/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || 'Failed to load pending locations');
      }

      const result = await response.json();
      setPendingLocations(result?.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load pending locations.';
      setPendingError(message);
      setPendingLocations([]);
    } finally {
      setPendingLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (canView) {
      fetchPending();
    }
  }, [canView, fetchPending]);

  const handleApprove = async (locationId: string) => {
    if (!API_URL || API_URL === 'undefined' || !token) {
      setPendingError('Unable to reach the backend.');
      return;
    }

    try {
      setApprovingId(locationId);
      const response = await fetch(`${API_URL}/api/locations/id/${locationId}/approve`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || 'Failed to approve location');
      }

      setPendingLocations((prev) => prev.filter((location) => location.id !== locationId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to approve location.';
      setPendingError(message);
    } finally {
      setApprovingId(null);
    }
  };

  const pendingIsEmpty = useMemo(() => pendingLocations.length === 0, [pendingLocations]);

  const formatLocation = (location: PendingLocation) => {
    const parts = [location.city, location.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location pending details';
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString();

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

                <div className="mt-10 space-y-8">
                  {loading && <p className="text-neutral-300">Checking your access…</p>}

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
                    <section className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-sm uppercase tracking-widest text-neutral-400">Approval queue</p>
                          <h2 className="text-2xl font-semibold text-white">Pending locations</h2>
                        </div>
                        <button
                          type="button"
                          onClick={fetchPending}
                          className="inline-flex items-center justify-center rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400"
                          disabled={pendingLoading}
                        >
                          {pendingLoading ? 'Refreshing…' : 'Refresh'}
                        </button>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                        {pendingLoading && (
                          <p className="text-sm text-neutral-300">Loading pending submissions…</p>
                        )}

                        {!pendingLoading && pendingError && (
                          <p className="text-sm text-red-400">{pendingError}</p>
                        )}

                        {!pendingLoading && !pendingError && pendingIsEmpty && (
                          <p className="text-sm text-neutral-300">There are no locations awaiting approval.</p>
                        )}

                        {!pendingLoading && !pendingError && !pendingIsEmpty && (
                          <ul className="space-y-4">
                            {pendingLocations.map((location) => {
                              const previewImage = Array.isArray(location.images) ? location.images[0] : undefined;
                              return (
                                <li
                                  key={location.id}
                                  className="flex flex-col gap-4 rounded-xl border border-white/5 bg-neutral-900/60 p-4 sm:flex-row sm:items-center"
                                >
                                  {previewImage && (
                                    <img
                                      src={previewImage}
                                      alt={location.name}
                                      className="h-24 w-24 rounded-lg object-cover"
                                    />
                                  )}
                                  <div className="flex-1 space-y-1">
                                    <p className="text-lg font-semibold text-white">{location.name}</p>
                                    <p className="text-sm text-neutral-300 line-clamp-2">
                                      {location.description || 'No description provided.'}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                      {formatLocation(location)} · Submitted {formatDate(location.createdAt)}
                                    </p>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(location.id)}
                                    disabled={approvingId === location.id}
                                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {approvingId === location.id ? 'Approving…' : 'Approve'}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </section>
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
