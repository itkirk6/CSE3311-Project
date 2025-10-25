'use client';

import Link from 'next/link';

import NavBar from '@/app/components/NavBar';
import Footer from '@/app/components/Footer';
import PageShell from '@/app/components/PageShell';
import Backplate from '@/app/components/Backplate';

const teamMembers = [
  {
    name: 'Ivan Kirk',
    handle: '@itkirk6',
    github: 'https://github.com/itkirk6',
    blurb:
      'Platform architecture & data wrangling enthusiast who keeps our API connections tidy and reliable.',
  },
  {
    name: 'Henry Bui',
    handle: '@henrybui67',
    github: 'https://github.com/henrybui67',
    blurb:
      'UI tinkerer focused on human-centered flows so every camper can find the perfect getaway without friction.',
  },
  {
    name: 'Devon Wingfield',
    handle: '@devw54',
    github: 'https://github.com/devw54',
    blurb:
      'Full-stack problem solver who bridges the design vision with resilient backend services.',
  },
  {
    name: 'Emery Weis',
    handle: '@emeryweis',
    github: 'https://github.com/emeryweis',
    blurb:
      'Story-driven researcher capturing the personalities of each outdoor spot we highlight.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen text-neutral-100">
      <NavBar />

      <PageShell imageSrc="/search_screen.jpg" fadeHeight="45vh" withFixedHeaderOffset>
        <div className="flex min-h-[calc(100vh-var(--header-h,64px))] flex-col">
          <div className="flex flex-col gap-20 pb-24 flex-1">
            <section className="pt-24 sm:pt-28 md:pt-32">
              <div className="mx-auto max-w-3xl">
                <Backplate>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">About OutdoorSpot</p>
                <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">Built by Mavericks for fellow explorers</h1>
                <p className="mt-6 text-lg text-neutral-200">
                  We are a CSE 3311 project team from The University of Texas at Arlington who bonded over late-night study
                  sessions, coffee-fueled debugging, and spontaneous weekend trail runs. OutdoorSpot is our way of
                  combining classroom theory with our love for the fresh air—showcasing the trails, lakes, and campsites
                  that keep us energized between exams.
                </p>
                <p className="mt-4 text-neutral-300">
                  Our course challenged us to solve a real problem with full-stack engineering. We noticed that friends
                  who were new to North Texas struggled to discover authentic outdoor experiences beyond the usual tourist
                  lists. OutdoorSpot became our solution: a curated, data-informed guide built by people who actually pitch
                  tents, chase sunrises, and cheer on every successful s’more roast.
                </p>
              </Backplate>
            </div>
          </section>

          <section className="grid gap-10 md:grid-cols-2 md:gap-16">
            <article className="space-y-6">
              <h2 className="text-2xl font-bold sm:text-3xl">Why the name “OutdoorSpot”?</h2>
              <p className="text-neutral-300">
                In our earliest brainstorming session we kept circling the same idea: we wanted a digital trailhead that
                pointed classmates toward the hidden gems we rave about. “Spot” felt friendly and purposeful—like a map
                pin or a friend saying “meet me here.” Paired with “Outdoor,” it captures our mission in two words: help
                every visitor find the right spot outside, whether that means hammocking under pecan trees or stargazing
                beside a quiet lake.
              </p>
              <p className="text-neutral-300">
                The name also reflects how we built the project. Every feature is designed to spotlight a location’s
                personality: trail difficulty, campsite vibes, nearby coffee stops for that sunrise caffeine boost, and
                the practical tips we text to each other before we head out. OutdoorSpot is both a compass and a journal
                of the places that make North Texas feel like home.
              </p>
            </article>

            <article className="space-y-6">
              <h2 className="text-2xl font-bold sm:text-3xl">Our project heartbeat</h2>
              <p className="text-neutral-300">
                Beyond the requirements checklist, we wanted this app to feel like an invite. That meant responsive design
                for mobile trailheads, accessibility-first color contrast, and a backend that can grow with a community of
                explorers. We experimented with map visualizations, recommendation algorithms, and storytelling blurbs to
                create a product that our classmates can be proud to demo.
              </p>
              <p className="text-neutral-300">
                Most importantly, OutdoorSpot is a testament to collaborative problem solving. We traded Git commits the
                way hikers trade trail snacks—making sure every contribution kept the group moving forward. The result is
                a platform shaped by curiosity, respect for the outdoors, and a healthy dose of Maverick spirit.
              </p>
            </article>
          </section>

          <section>
            <h2 className="text-2xl font-bold sm:text-3xl">Meet the team</h2>
            <p className="mt-3 max-w-3xl text-neutral-300">
              We are proud Mavericks who believe software can encourage more people to unplug and explore. Connect with us
              on GitHub—we love feedback, fresh campsite suggestions, and code reviews.
            </p>

            <ul className="mt-10 grid gap-6 sm:grid-cols-2">
              {teamMembers.map((member) => (
                <li key={member.github} className="group relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                  <Link
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full flex-col gap-4 p-6 transition hover:bg-neutral-900/80"
                    aria-label={`${member.name}'s GitHub profile`}
                  >
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">{member.handle}</p>
                      <h3 className="mt-2 text-xl font-semibold text-white">{member.name}</h3>
                    </div>
                    <p className="text-sm text-neutral-300">{member.blurb}</p>
                    <span className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-emerald-400">
                      Visit GitHub
                      <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-10 text-center shadow-lg">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">See you on the trail!</h2>
            <p className="mt-4 text-neutral-200">
              OutdoorSpot is the starting point—we hope it inspires weekend getaways, computer science capstone ideas, and
              a few legendary campfire stories. Thanks for taking the journey with us.
            </p>
          </section>
          </div>

          <Footer />
        </div>
      </PageShell>
    </main>
  );
}
