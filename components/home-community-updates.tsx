
import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Newspaper,
  HandHeart,
  ClipboardList,
  Lightbulb,
  MapPin
} from 'lucide-react';

import {events, impactStories} from '@/lib/content';
import {clubUpdates} from '@/lib/lions-updates';
import '../styles/home-community-updates.css';

function dateValue(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? Number.POSITIVE_INFINITY
    : parsed.getTime();
}

export default function HomeCommunityUpdates() {
  const recentProject = [...impactStories]
    .filter(item => item.date)
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))[0];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = [...events]
    .filter(event => {
      const parsed = dateValue(event.date);
      return Number.isFinite(parsed) &&
        parsed >= today.getTime() - 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => dateValue(a.date) - dateValue(b.date))
    .slice(0, 3);

  const recentNews = [...clubUpdates]
    .filter(item => item.title && item.date && item.summary)
    .sort((a, b) => dateValue(b.date) - dateValue(a.date))
    .slice(0, 2);

  return (
    <>
      <section
        className="home-community-feed"
        aria-labelledby="home-feed-title"
      >
        <div className="wrap">

          <div className="home-feed-heading">
            <div>
              <p className="home-feed-eyebrow">
                WHAT'S HAPPENING IN OUR COMMUNITY
              </p>
              <h2 id="home-feed-title">
                Stay connected.<br/>
                <span>Stay involved.</span>
              </h2>
            </div>

            <p>
              Find upcoming opportunities to participate
              and read the latest updates from the
              Port Allegany Lions Club.
            </p>
          </div>


          {recentProject && (
            <article className="home-recent-service">
              <div className="home-recent-service-copy">
                <p className="home-feed-eyebrow">RECENT COMMUNITY SERVICE</p>
                <h3>{recentProject.title}</h3>
                <p>{recentProject.description}</p>
                <span className="home-recent-service-date">
                  <CalendarDays size={16}/>
                  {recentProject.date}
                </span>
              </div>
              <Link href="/impact" className="home-feed-link">
                Explore our service efforts <ArrowRight size={17}/>
              </Link>
            </article>
          )}

          <div className="home-feed-grid">

            <section
              className="home-feed-panel"
              aria-labelledby="home-events-title"
            >
              <div className="home-feed-panel-top">
                <div className="home-feed-icon">
                  <CalendarDays size={23}/>
                </div>
                <span>EVENTS & ACTIVITIES</span>
              </div>

              <h3 id="home-events-title">Coming up.</h3>

              {upcomingEvents.length ? (
                <div className="home-feed-items">
                  {upcomingEvents.map((event, index) => (
                    <article
                      key={event.title + event.date + index}
                      className="home-feed-entry"
                    >
                      <p className="home-feed-meta">
                        {event.type} / {event.date}
                      </p>
                      <h4>{event.title}</h4>
                      <p>{event.description}</p>
                      <span className="home-feed-location">
                        <MapPin size={14}/>
                        {event.location}
                      </span>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="home-feed-empty">
                  <p>
                    Our next activities are being planned.
                    Confirmed event details will appear here
                    as they're announced.
                  </p>
                </div>
              )}

              <Link href="/events" className="home-feed-link">
                View all events <ArrowRight size={17}/>
              </Link>
            </section>

            <section
              className="home-feed-panel"
              aria-labelledby="home-news-title"
            >
              <div className="home-feed-panel-top">
                <div className="home-feed-icon">
                  <Newspaper size={23}/>
                </div>
                <span>NEWS & UPDATES</span>
              </div>

              <h3 id="home-news-title">Latest from the Lions.</h3>

              {recentNews.length ? (
                <div className="home-feed-items">
                  {recentNews.map(item => (
                    <article
                      key={item.slug}
                      className="home-feed-entry"
                    >
                      <p className="home-feed-meta">
                        {item.category} / {item.date}
                      </p>
                      <h4>{item.title}</h4>
                      <p>{item.summary}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="home-feed-empty">
                  <p>
                    We're preparing this space for club
                    announcements, community stories,
                    and updates on our service efforts.
                  </p>
                </div>
              )}

              <Link href="/news" className="home-feed-link">
                Read club news <ArrowRight size={17}/>
              </Link>
            </section>

          </div>
        </div>
      </section>

      <section
        className="home-community-actions"
        aria-labelledby="home-action-title"
      >
        <div className="wrap">

          <div className="home-actions-heading">
            <p className="home-feed-eyebrow">
              LIONS IN ACTION
            </p>
            <h2 id="home-action-title">
              Your community needs you.
            </h2>
            <p>
              There is more than one way to make a difference.
              You don't have to be a Lions member to start
              getting involved.
            </p>
          </div>

          <div className="home-action-grid">

            <Link href="/join" className="home-action-card">
              <HandHeart size={28}/>
              <span>01 / PARTICIPATE</span>
              <h3>Volunteer with us</h3>
              <p>
                Explore opportunities to give your time
                and connect with local service projects.
              </p>
              <strong>
                Get involved <ArrowRight size={17}/>
              </strong>
            </Link>

            <Link
              href="/community-needs"
              className="home-action-card"
            >
              <ClipboardList size={28}/>
              <span>02 / COMMUNITY NEEDS</span>
              <h3>Request assistance</h3>
              <p>
                Represent a local organization?
                Tell us where volunteer support
                could make a difference.
              </p>
              <strong>
                Share a need <ArrowRight size={17}/>
              </strong>
            </Link>

            <Link
              href="/suggest-project"
              className="home-action-card"
            >
              <Lightbulb size={28}/>
              <span>03 / YOUR IDEAS</span>
              <h3>Suggest a project</h3>
              <p>
                Have an achievable idea to improve
                Port Allegany? We'd like to hear it.
              </p>
              <strong>
                Submit an idea <ArrowRight size={17}/>
              </strong>
            </Link>

          </div>
        </div>
      </section>
    </>
  );
}
