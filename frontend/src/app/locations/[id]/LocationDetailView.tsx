import Image from 'next/image';
import React from 'react';
import MapComponent from '@/app/components/MapComponent';
import {
  LocationDetail,
  ContactEntry,
  DisplayStat,
  buildStats,
  composeAddress,
  extractAmenities,
  extractContactInfo,
  extractImageUrls,
  formatDate,
} from './helpers';

interface LocationDetailViewProps {
  location: LocationDetail;
}

interface HeroProps {
  location: LocationDetail;
  heroImage?: string;
  ratingDisplay: string | null;
  generalLocation: string | null;
  nightlyRate: string | null;
}

interface SidebarProps {
  address: string | null;
  location: LocationDetail;
  contacts: ContactEntry[];
  createdAt: string | null;
  updatedAt: string | null;
  websiteUrl: string | null | undefined;
}

interface GalleryProps {
  secondaryImages: string[];
  locationName: string;
}

interface ReviewsProps {
  location: LocationDetail;
}

const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = '',
}) => (
  <section className={className}>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    {children}
  </section>
);

const MutedText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-neutral-500">{children}</span>
);

function renderValue(value: string | null, fallback: string): React.ReactNode {
  if (!value) {
    return <MutedText>{fallback}</MutedText>;
  }
  return value;
}

const HeroSection: React.FC<HeroProps> = ({ location, heroImage, ratingDisplay, generalLocation, nightlyRate }) => (
  <section
    className="relative h-[60vh] w-full overflow-hidden"
    style={heroImage ? { backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
  >
    {!heroImage && <div className="absolute inset-0 bg-neutral-900" />}
    {heroImage && <div className="absolute inset-0 bg-neutral-950/60" />}

    <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/20 via-neutral-950/60 to-neutral-950" />

    <div className="relative z-10 flex h-full items-end">
      <div className="max-w-6xl w-full mx-auto px-6 pb-12">
        <div className="flex flex-col gap-3">
          <span className="inline-flex flex-wrap items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-300/80">
            {location.locationType}
            {location.petFriendly && (
              <span className="rounded-full border border-emerald-300/60 px-3 py-0.5 text-xs text-emerald-200">Pet Friendly</span>
            )}
            {location.reservationRequired && (
              <span className="rounded-full border border-amber-300/60 px-3 py-0.5 text-xs text-amber-200">
                Reservation Required
              </span>
            )}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{location.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-neutral-200">
            <div className="flex items-center gap-2">
              <span className="text-emerald-300">⭐</span>
              {renderValue(ratingDisplay, 'Not yet rated')}
            </div>
            <div className="h-4 w-px bg-neutral-500/60" />
            <div>{renderValue(generalLocation, 'Location unavailable')}</div>
            {nightlyRate && (
              <>
                <div className="h-4 w-px bg-neutral-500/60" />
                <div>{nightlyRate}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  </section>
);

interface OverviewSectionProps {
  location: LocationDetail;
  stats: DisplayStat[];
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ location, stats }) => {
  return (
    <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
      <h2 className="text-2xl font-semibold mb-4">Overview</h2>
      <p className="text-neutral-300 leading-relaxed">
        {location.description ? location.description : <MutedText>Detailed description not available.</MutedText>}
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 rounded-2xl bg-neutral-950/60 border border-neutral-800 px-4 py-3"
          >
            <span className="text-xs uppercase tracking-wide text-neutral-500">{stat.label}</span>
            <span className={`text-sm md:text-base ${stat.value ? 'text-neutral-100' : 'text-neutral-500'}`}>
              {stat.value ?? 'Not provided'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailsSidebar: React.FC<SidebarProps> = ({ address, location, contacts, createdAt, updatedAt, websiteUrl }) => (
  <aside className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 shadow-xl space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-2">Address</h3>
      <p className="text-sm leading-6">{renderValue(address, 'Address not available')}</p>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <span>Pet Friendly</span>
        <span className={`font-semibold ${location.petFriendly ? 'text-emerald-300' : 'text-neutral-500'}`}>
          {location.petFriendly ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <span>Reservation Required</span>
        <span className={`font-semibold ${location.reservationRequired ? 'text-amber-300' : 'text-neutral-500'}`}>
          {location.reservationRequired ? 'Yes' : 'No'}
        </span>
      </div>
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <span>Created</span>
        <span className="font-semibold text-neutral-200">{renderValue(createdAt, '—')}</span>
      </div>
      <div className="flex items-center justify-between text-sm text-neutral-300">
        <span>Last Updated</span>
        <span className="font-semibold text-neutral-200">{renderValue(updatedAt, '—')}</span>
      </div>
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-2">Website</h3>
      {websiteUrl ? (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200"
        >
          Visit official site
          <span aria-hidden>↗</span>
        </a>
      ) : (
        <p className="text-sm text-neutral-500">Website not provided.</p>
      )}
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-2">Contact</h3>
      {contacts.length > 0 ? (
        <ul className="space-y-2 text-sm text-neutral-300">
          {contacts.map((entry) => (
            <li key={`${entry.label}-${entry.value}`} className="flex flex-col">
              <span className="text-xs uppercase tracking-wide text-neutral-500">{entry.label}</span>
              <span>{entry.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-500">No contact information available.</p>
      )}
    </div>
  </aside>
);

const AmenitiesSection: React.FC<{ amenities: string[] }> = ({ amenities }) => (
  <Section title="Amenities">
    {amenities.length > 0 ? (
      <div className="flex flex-wrap gap-3">
        {amenities.map((amenity) => (
          <span key={amenity} className="px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-sm text-neutral-200">
            {amenity}
          </span>
        ))}
      </div>
    ) : (
      <MutedText>Amenities information is not available.</MutedText>
    )}
  </Section>
);

const GallerySection: React.FC<GalleryProps> = ({ secondaryImages, locationName }) => (
  <Section title="Gallery">
    {secondaryImages.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {secondaryImages.map((imgUrl) => (
          <div key={imgUrl} className="relative h-56 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <Image
              src={imgUrl}
              alt={`${locationName} secondary view`}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              priority={false}
              unoptimized
            />
          </div>
        ))}
      </div>
    ) : (
      <MutedText>No additional images available.</MutedText>
    )}
  </Section>
);

const ReviewsSection: React.FC<ReviewsProps> = ({ location }) => (
  <Section title="Reviews">
    {location.reviews && location.reviews.length > 0 ? (
      <div className="space-y-4">
        {location.reviews.map((review) => {
          const reviewerName =
            review.user?.username || [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') || null;
          const reviewDate = formatDate(review.createdAt);

          return (
            <article key={review.id} className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-100">
                    {review.title ? review.title : <MutedText>Untitled review</MutedText>}
                  </h3>
                  <span className="text-emerald-300 font-semibold">⭐ {review.rating}</span>
                </div>
                <div className="text-sm text-neutral-400 flex items-center gap-2">
                  <span>{renderValue(reviewerName, 'Anonymous explorer')}</span>
                  <span className="text-neutral-600">•</span>
                  <span>{renderValue(reviewDate, 'Date unavailable')}</span>
                </div>
              </div>
              <p className="mt-4 text-neutral-200 leading-relaxed">
                {review.content || <MutedText>No review text provided.</MutedText>}
              </p>
            </article>
          );
        })}
      </div>
    ) : (
      <MutedText>There are no reviews for this location yet.</MutedText>
    )}
  </Section>
);

const MapSection: React.FC<{ location: LocationDetail }> = ({ location }) => (
  <Section title="Map">
    <div className="rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-900">
      <MapComponent
        locations={[
          {
            id: location.id,
            name: location.name,
            latitude: location.latitude,
            longitude: location.longitude,
            description: location.description ?? undefined,
          },
        ]}
      />
    </div>
  </Section>
);

const LocationDetailView: React.FC<LocationDetailViewProps> = ({ location }) => {
  const imageUrls = extractImageUrls(location.images);
  const heroImage = imageUrls[0];
  const secondaryImages = imageUrls.slice(1);
  const amenities = extractAmenities(location.amenities);
  const contacts = extractContactInfo(location.contactInfo);
  const address = composeAddress(location);
  const stats = buildStats(location);
  const ratingDisplay = location.rating !== null && location.rating !== undefined ? `${location.rating.toFixed(1)} / 5` : null;
  const generalLocation = [location.city, location.state, location.country]
    .filter((part): part is string => !!part && part.trim().length > 0)
    .join(', ') || null;
  const createdAt = formatDate(location.createdAt);
  const updatedAt = formatDate(location.updatedAt);
  const nightlyRate = stats.find((entry) => entry.label === 'Cost per Night')?.value ?? null;

  return (
    <div className="flex-1 pt-16">
      <HeroSection
        location={location}
        heroImage={heroImage}
        ratingDisplay={ratingDisplay}
        generalLocation={generalLocation}
        nightlyRate={nightlyRate}
      />

      <main className="relative -mt-16 z-20">
        <div className="max-w-6xl mx-auto px-6 pb-24 space-y-16">
          <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
            <OverviewSection location={location} stats={stats} />
            <DetailsSidebar
              address={address}
              location={location}
              contacts={contacts}
              createdAt={createdAt}
              updatedAt={updatedAt}
              websiteUrl={location.websiteUrl}
            />
          </section>

          <AmenitiesSection amenities={amenities} />
          <GallerySection secondaryImages={secondaryImages} locationName={location.name} />
          <ReviewsSection location={location} />
          <MapSection location={location} />
        </div>
      </main>
    </div>
  );
};

export default LocationDetailView;
