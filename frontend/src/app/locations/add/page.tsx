'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';
import Backplate from '@/app/components/Backplate';
import { useAuth } from '@/app/context/AuthContext';

type FormState = {
  name: string;
  locationType: string;
  latitude: string;
  longitude: string;
  country: string;
  description: string;
  address: string;
  city: string;
  state: string;
  costPerNight: string;
  maxCapacity: string;
  petFriendly: boolean;
  reservationRequired: boolean;
  websiteUrl: string;
  contactInfo: string;
};

type LocationSubmissionPayload = {
  name: string;
  locationType: string;
  latitude: number;
  longitude: number;
  country: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  costPerNight?: number;
  maxCapacity?: number;
  petFriendly: boolean;
  reservationRequired: boolean;
  websiteUrl?: string;
  contactInfo?: { details: string };
  images?: string[];
};

const initialFormState: FormState = {
  name: '',
  locationType: '',
  latitude: '',
  longitude: '',
  country: 'US',
  description: '',
  address: '',
  city: '',
  state: '',
  costPerNight: '',
  maxCapacity: '',
  petFriendly: false,
  reservationRequired: false,
  websiteUrl: '',
  contactInfo: '',
};

const LOCATION_TYPES = ['Campground', 'Trail', 'Park', 'Waterfront', 'Overlook', 'Other'];

const MAX_UPLOADS = 5;

const readFileAsBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(typeof reader.result === 'string' ? reader.result : '');
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });

export default function AddLocationPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
  const { isAuthenticated, loading, token } = useAuth();

  const [formValues, setFormValues] = useState<FormState>(initialFormState);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const isReady = useMemo(() => !loading && isAuthenticated, [isAuthenticated, loading]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, MAX_UPLOADS);
    setSelectedImages(files);
  };

  const validateForm = useCallback(() => {
    const nextErrors: Record<string, string> = {};

    if (!formValues.name.trim()) {
      nextErrors['name'] = 'Name is required.';
    }

    if (!formValues.locationType.trim()) {
      nextErrors['locationType'] = 'Location type is required.';
    }

    const latitude = Number(formValues.latitude);
    if (!Number.isFinite(latitude)) {
      nextErrors['latitude'] = 'Latitude must be a valid number.';
    }

    const longitude = Number(formValues.longitude);
    if (!Number.isFinite(longitude)) {
      nextErrors['longitude'] = 'Longitude must be a valid number.';
    }

    if (!formValues.country.trim()) {
      nextErrors['country'] = 'Country is required.';
    }

    return nextErrors;
  }, [formValues]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (!API_URL || API_URL === 'undefined') {
      setStatusMessage({ type: 'error', text: 'Backend URL is not configured.' });
      return;
    }

    if (!token) {
      setStatusMessage({ type: 'error', text: 'You must be signed in to submit a location.' });
      return;
    }

    try {
      setSubmitting(true);

      const images = await Promise.all(selectedImages.map(readFileAsBase64));

      const payload: LocationSubmissionPayload = {
        name: formValues.name.trim(),
        locationType: formValues.locationType.trim(),
        latitude: Number(formValues.latitude),
        longitude: Number(formValues.longitude),
        country: formValues.country.trim() || 'US',
        petFriendly: formValues.petFriendly,
        reservationRequired: formValues.reservationRequired,
      };

      if (formValues.description.trim()) {
        payload.description = formValues.description.trim();
      }

      if (formValues.address.trim()) {
        payload.address = formValues.address.trim();
      }

      if (formValues.city.trim()) {
        payload.city = formValues.city.trim();
      }

      if (formValues.state.trim()) {
        payload.state = formValues.state.trim();
      }

      if (formValues.costPerNight) {
        payload.costPerNight = Number(formValues.costPerNight);
      }

      if (formValues.maxCapacity) {
        payload.maxCapacity = Number(formValues.maxCapacity);
      }

      if (formValues.websiteUrl.trim()) {
        payload.websiteUrl = formValues.websiteUrl.trim();
      }

      if (formValues.contactInfo.trim()) {
        payload.contactInfo = { details: formValues.contactInfo.trim() };
      }

      if (images.length > 0) {
        payload.images = images;
      }

      const response = await fetch(`${API_URL}/api/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || 'Failed to submit location.');
      }

      setStatusMessage({ type: 'success', text: 'Your location has been submitted for review.' });
      setFormValues(initialFormState);
      setSelectedImages([]);
      setErrors({});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit location.';
      setStatusMessage({ type: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen text-neutral-100">
      <NavBar />
      <PageShell imageSrc="/locations_screen.jpg" fadeHeight="40vh" withFixedHeaderOffset>
        <div className="flex flex-col gap-12">
          <section className="pt-24 sm:pt-28 md:pt-32">
            <div className="mx-auto w-full max-w-4xl">
              <Backplate>
                <header className="space-y-3 text-center sm:text-left">
                  <p className="text-sm uppercase tracking-widest text-emerald-300/80">Community contribution</p>
                  <h1 className="text-3xl font-bold sm:text-4xl">Submit a location</h1>
                  <p className="text-sm text-neutral-300 sm:text-base">
                    Share a favorite outdoor spot with the community. Our team will review every submission before it goes live.
                  </p>
                </header>

                {!isReady && (
                  <p className="mt-8 text-center text-neutral-300">Checking your account…</p>
                )}

                {isReady && (
                  <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Name*
                        <input
                          type="text"
                          name="name"
                          value={formValues.name}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="Hidden Falls Park"
                          required
                        />
                        {errors['name'] && <span className="text-xs text-red-400">{errors['name']}</span>}
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Location type*
                        <select
                          name="locationType"
                          value={formValues.locationType}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          required
                        >
                          <option value="" disabled>
                            Select a type
                          </option>
                          {LOCATION_TYPES.map((type) => (
                            <option key={type} value={type} className="bg-neutral-900 text-white">
                              {type}
                            </option>
                          ))}
                        </select>
                        {errors['locationType'] && <span className="text-xs text-red-400">{errors['locationType']}</span>}
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Latitude*
                        <input
                          type="number"
                          step="any"
                          name="latitude"
                          value={formValues.latitude}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="32.7767"
                          required
                        />
                        {errors['latitude'] && <span className="text-xs text-red-400">{errors['latitude']}</span>}
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Longitude*
                        <input
                          type="number"
                          step="any"
                          name="longitude"
                          value={formValues.longitude}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="-96.7970"
                          required
                        />
                        {errors['longitude'] && <span className="text-xs text-red-400">{errors['longitude']}</span>}
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Country*
                        <input
                          type="text"
                          name="country"
                          value={formValues.country}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="US"
                          required
                        />
                        {errors['country'] && <span className="text-xs text-red-400">{errors['country']}</span>}
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Website or listing URL
                        <input
                          type="url"
                          name="websiteUrl"
                          value={formValues.websiteUrl}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="https://example.com"
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Description
                      <textarea
                        name="description"
                        value={formValues.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                        placeholder="Tell us about this location, amenities, highlights, or restrictions."
                      />
                    </label>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <label className="flex flex-col gap-2 text-sm font-medium md:col-span-2">
                        Address
                        <input
                          type="text"
                          name="address"
                          value={formValues.address}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="123 Scenic Dr"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-medium">
                        City
                        <input
                          type="text"
                          name="city"
                          value={formValues.city}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                      <label className="flex flex-col gap-2 text-sm font-medium">
                        State / Province
                        <input
                          type="text"
                          name="state"
                          value={formValues.state}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Cost per night (USD)
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="costPerNight"
                          value={formValues.costPerNight}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="25"
                        />
                      </label>

                      <label className="flex flex-col gap-2 text-sm font-medium">
                        Max capacity
                        <input
                          type="number"
                          min="1"
                          step="1"
                          name="maxCapacity"
                          value={formValues.maxCapacity}
                          onChange={handleInputChange}
                          className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                          placeholder="8"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <label className="flex items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          name="petFriendly"
                          checked={formValues.petFriendly}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500"
                        />
                        Pet friendly
                      </label>

                      <label className="flex items-center gap-3 text-sm font-medium">
                        <input
                          type="checkbox"
                          name="reservationRequired"
                          checked={formValues.reservationRequired}
                          onChange={handleCheckboxChange}
                          className="h-5 w-5 rounded border-white/20 bg-transparent text-emerald-500 focus:ring-emerald-500"
                        />
                        Reservation required
                      </label>
                    </div>

                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Contact information
                      <textarea
                        name="contactInfo"
                        value={formValues.contactInfo}
                        onChange={handleInputChange}
                        rows={3}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-base text-white focus:border-emerald-400 focus:outline-none"
                        placeholder="Email, phone number, park ranger office, etc."
                      />
                    </label>

                    <div className="space-y-2 text-sm font-medium">
                      <label htmlFor="location-images" className="flex flex-col gap-2">
                        Photos (up to {MAX_UPLOADS})
                        <input
                          id="location-images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFileChange}
                          className="rounded-xl border border-dashed border-white/20 bg-transparent p-4 text-sm"
                        />
                      </label>
                      {selectedImages.length > 0 && (
                        <ul className="list-disc space-y-1 pl-5 text-xs text-neutral-300">
                          {selectedImages.map((file) => (
                            <li key={file.name}>{file.name}</li>
                          ))}
                        </ul>
                      )}
                      <p className="text-xs text-neutral-400">Accepted formats: JPG, PNG. Images are stored as part of your submission.</p>
                    </div>

                    {statusMessage && (
                      <p
                        className={`text-sm ${
                          statusMessage.type === 'success' ? 'text-emerald-300' : 'text-red-400'
                        }`}
                      >
                        {statusMessage.text}
                      </p>
                    )}

                    <div className="flex flex-col gap-2">
                      <p className="text-xs text-neutral-400">* Required fields</p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitting ? 'Submitting…' : 'Submit for review'}
                      </button>
                    </div>
                  </form>
                )}
              </Backplate>
            </div>
          </section>

          <Footer />
        </div>
      </PageShell>
    </main>
  );
}
