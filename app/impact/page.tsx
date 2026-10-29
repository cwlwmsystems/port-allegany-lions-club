import Link from 'next/link';
import {
  ArrowRight,
  HeartHandshake,
  UsersRound,
  Eye,
  BookOpen,
  ArrowUpRight,
  Lightbulb,
} from 'lucide-react';

import { focusAreas, impactStories } from '@/lib/content';
import '../../styles/impact.css';
import LionsServiceCounter from '@/components/lions-service-counter';

export const metadata = {
  title: 'Our Impact',
  description:
    'Explore the service priorities and community-focused initiatives of the Port Allegany Lions Club.',
};

const icons = [HeartHandshake, UsersRound, Eye];

export default function Impact() {
  return (
    <main className="impact-page">

      {/* HERO */}
      <section className="impact-hero">
        <div className="impact-hero-shape" aria-hidden="true" />

        <div className="wrap impact-hero-content">
          <p className="impact-kicker">
            <span className="impact-kicker-dot" />
            PORT ALLEGANY LIONS CLUB / OUR IMPACT
          </p>

          <h1>
            Making a difference.<br />
            <span>Right here at home.</span>
          </h1>

          <p>
            Meaningful service begins with understanding
            our community and finding ways to help.
          </p>

          <Link href="#service-areas" className="impact-hero-link">
            Explore our service focus
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="impact-hero-strip">
          <div className="wrap">
            <span>LOCAL SERVICE</span>
            <span>COMMUNITY CONNECTION</span>
            <span>SHARED PURPOSE</span>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="impact-intro">
        <div className="wrap impact-intro-grid">
          <div>
            <p className="impact-overline">WHY SERVICE MATTERS</p>

            <h2>
              Every action<br />
              <span>has a purpose.</span>
            </h2>
          </div>

          <div className="impact-intro-copy">
            <p>
              Service is not defined by the size of an organization
              or the number of projects it completes. It starts
              with recognizing a need and working together to respond.
            </p>

            <p>
              As part of Lions International, our club is connected
              to a worldwide tradition of service while keeping
              our attention on the people and needs closest to home.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICE FOCUS */}
      <section className="impact-services" id="service-areas">
        <div className="wrap">
          <div className="impact-section-heading">
            <div>
              <p className="impact-overline">OUR SERVICE FOCUS</p>
              <h2>
                Where service<br />
                <span>meets community.</span>
              </h2>
            </div>

            <p>
              These focus areas reflect the types of needs
              and opportunities our club is interested in
              supporting.
            </p>
          </div>

          <div className="impact-service-grid">
            {focusAreas.map((area, index) => {
              const Icon = icons[index] || HeartHandshake;

              return (
                <article className="impact-service-card" key={area.title}>
                  <div className="impact-service-card-top">
                    <span>
                      {String(index + 1).padStart(2, '0')} / SERVICE AREA
                    </span>
                    <Icon size={30} strokeWidth={1.7} />
                  </div>

                  <h3>{area.title}</h3>
                  <p>{area.description}</p>

                  <div className="impact-service-card-rule" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMMUNITY SERVICE STORIES */}
      <section className="impact-stories">
        <div className="wrap">
          <div className="impact-stories-heading">
            <div>
              <p className="impact-overline">SERVICE IN ACTION</p>
              <h2>Community stories.</h2>
            </div>

            <p>
              A place to highlight verified projects,
              partnerships, and service activities.
            </p>
          </div>

          {impactStories.length > 0 ? (
            <div className="impact-story-grid">
              {impactStories.map((story) => (
                <article className="impact-story-card" key={story.title}>
                  <p className="impact-story-category">
                    {story.category}
                    {story.date ? ' / ' + story.date : ''}
                  </p>

                  <h3>{story.title}</h3>
                  <p>{story.description}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="impact-empty">
              <div className="impact-empty-icon">
                <BookOpen size={28} />
              </div>

              <div>
                <h3>Our service stories are being collected.</h3>
                <p>
                  As the club documents its activities and
                  community partnerships, verified stories
                  will be featured here.
                </p>
              </div>

              <Link href="/contact">
                Share a story
                <ArrowUpRight size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CLOSING */}
      {/* LIONS FEATURES PHASE 2 V1 */}
      <LionsServiceCounter />
      <section className="impact-closing">
        <div className="wrap impact-closing-inner">
          <div>
            <p className="impact-overline">
              YOUR COMMUNITY. YOUR IDEAS.
            </p>

            <h2>
              See a need?<br />
              Let's talk about it.
            </h2>

            <p>
              Have an idea for a community project or an
              opportunity to help? We'd like to hear from you.
            </p>
          </div>

          <Link href="/contact" className="impact-closing-link">
            <Lightbulb size={20} />
            Share your idea
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
