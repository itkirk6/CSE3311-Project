import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Footer from '@/app/components/Footer';
import NavBar from '@/app/components/NavBar';
import LocationDetailView from './LocationDetailView';
import { extractImageUrls, fetchLocationDetail } from './helpers';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface PageParams {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const location = await fetchLocationDetail(params.id);

  if (!location) {
    return { title: 'Location not found' };
  }

  const subtitleParts = [location.city, location.state, location.country].filter(
    (part): part is string => !!part && part.trim().length > 0,
  );
  const images = extractImageUrls(location.images);
  const heroImage = images[0];

  return {
    title: `${location.name} | Trails & Tails`,
    description: location.description ?? undefined,
    openGraph: {
      title: location.name,
      description: location.description ?? undefined,
      images: heroImage ? [heroImage] : undefined,
    },
    twitter: {
      card: heroImage ? 'summary_large_image' : 'summary',
      title: location.name,
      description: location.description ?? undefined,
      images: heroImage ? [heroImage] : undefined,
    },
    other: subtitleParts.length ? { location: subtitleParts.join(', ') } : undefined,
  };
}

export default async function LocationDetailPage({ params }: PageParams) {
  const location = await fetchLocationDetail(params.id);

  if (!location) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100">
      <NavBar />
      <LocationDetailView location={location} />
      <Footer />
    </div>
  );
}
