import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  UsersRound,
  HeartHandshake,
  Mail
} from 'lucide-react';

import { events, club } from '@/lib/content';
import '../../styles/events.css';

export const metadata = {
  title: 'Events & Gatherings',
  description:
    'Explore upcoming events, community activities, and opportunities to connect with the Port Allegany Lions Club.'
};

export default function EventsPage() {
  return (
    <main className="lions-events">

      <section className="le-hero">
        <div className="le-hero-photo" aria-hidden="true" />
        <div className="le-hero-overlay" aria-hidden="true" />

        <div className="wrap le-hero-inner">
          <div className="le-hero-copy">
            <p className="le-kicker">
              <span className="le-dot" />
              PORT ALLEGANY LIONS CLUB / EVENTS
            </p>

            <h1>
              Good things happen<br />
              <span>when we come together.</span>
            </h1>

            <p className="le-hero-description">
              From community gatherings to opportunities to serve,
              connection starts with showing up.
            </p>

            <Link href="#upcoming" className="le-primary">
              Explore upcoming events
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="le-hero-bar">
          <div className="wrap">
            <span>COMMUNITY EVENTS</span>
            <span>LOCAL CONNECTION</span>
          </div>
        </div>
      </section>

      <section className="le-upcoming" id="upcoming">
        <div className="wrap">

          <div className="le-section-heading">
            <div>
              <p className="le-overline">WHAT'S HAPPENING</p>
              <h2>Upcoming <span>events.</span></h2>
            </div>

            <p>
              Find opportunities to connect, participate,
              and spend time with people who care about our community.
            </p>
          </div>

          {events.length > 0 ? (
            <div className="le-event-list">
              {events.map((event, index) => (
                <article
                  className="le-event"
                  key={event.title + event.date + index}
                >
                  <div className="le-event-date">
                    <CalendarDays size={25} />
                    <span>{event.date}</span>
                  </div>

                  <div className="le-event-information">
                    <span className="le-event-category">
                      {event.type}
                    </span>

                    <h3>{event.title}</h3>
                    <p>{event.description}</p>

                    <div className="le-event-location">
                      <MapPin size={16} />
                      {event.location}
                    </div>
                  </div>

                  <Link
                    href="/contact"
                    className="le-event-action"
                    aria-label={'Ask about ' + event.title}
                  >
                    <ArrowUpRight size={21} />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="le-empty">
              <div className="le-empty-accent" aria-hidden="true" />

              <div className="le-empty-icon">
                <CalendarDays size={32} strokeWidth={1.6} />
              </div>

              <div className="le-empty-content">
                <span className="le-empty-label">
                  EVENT CALENDAR
                </span>

                <h3>More opportunities are on the way.</h3>

                <p>
                  Confirmed event dates and details will appear here.
                  In the meantime, reach out to learn about
                  opportunities to connect with the club.
                </p>

                <Link href="/contact" className="le-text-link">
                  Ask about upcoming activities
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>

      <section className="le-connection">
        <div className="wrap le-connection-inner">

          <div className="le-connection-intro">
            <p className="le-overline">MORE THAN A CALENDAR</p>
            <h2>
              Every gathering is
              an opportunity to connect.
            </h2>
            <p>
              Whether you're interested in meeting other members,
              learning about local service, or exploring ways to
              participate, there's a place to start.
            </p>
          </div>

          <div className="le-connection-items">

            <div className="le-connection-item">
              <div className="le-connection-icon">
                <UsersRound size={25} />
              </div>
              <div>
                <h3>Meet your neighbors</h3>
                <p>
                  Connect with people who share an interest
                  in the Port Allegany community.
                </p>
              </div>
            </div>

            <div className="le-connection-item">
              <div className="le-connection-icon">
                <HeartHandshake size={25} />
              </div>
              <div>
                <h3>Find ways to help</h3>
                <p>
                  Learn about service opportunities and
                  how you might contribute.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="le-visit">
        <div className="wrap le-visit-inner">

          <div>
            <p className="le-overline">INTERESTED IN VISITING?</p>
            <h2>Come get to know us.</h2>
            <p>
              You don't need to commit to membership to introduce
              yourself or ask about getting involved.
            </p>
            <p className="le-meeting-note">
              {club.meetingDetails ||
                'Public meeting dates and locations will be shared after confirmation with club leadership.'}
            </p>
          </div>

          <div className="le-visit-actions">
            <Link href="/contact" className="le-visit-primary">
              <Mail size={18} />
              Contact the club
              <ArrowRight size={18} />
            </Link>

            <Link href="/join" className="le-visit-secondary">
              Learn about getting involved
              <ArrowUpRight size={17} />
            </Link>
          </div>

        </div>
      </section>

    </main>
  );
}
