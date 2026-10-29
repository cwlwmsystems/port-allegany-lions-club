import '../../styles/about-support.css';
import Link from 'next/link';
import {
  ArrowRight,
  HandHeart,
  UsersRound,
  HeartHandshake,
  Globe2
} from 'lucide-react';

import '../../styles/about.css';

export const metadata = {
  title: 'Our Club',
  description: 'Learn about the Port Allegany Lions Club, our local community, and our commitment to service.'
};

export default function About() {
  return (
    <main className="club-about">

      {/* HERO */}
      <section className="club-about-hero">
        <div className="club-about-hero-photo" aria-hidden="true" />
        <div className="club-about-hero-overlay" aria-hidden="true" />

        <div className="wrap club-about-hero-inner">
          <div className="club-about-hero-copy">
            <p className="club-about-kicker">
              <span className="club-about-dot" />
              PORT ALLEGANY LIONS CLUB
            </p>

            <h1>
              Our community.<br />
              <span>Our commitment.</span>
            </h1>

            <p className="club-about-hero-description">
              A local club built around connection, community,
              and the belief that meaningful service starts
              close to home.
            </p>

            <Link href="/contact" className="club-about-primary">
              Connect with our club <ArrowRight size={18}/>
            </Link>
          </div>
        </div>

        <div className="club-about-hero-bottom">
          <div className="wrap">
            <span>OUR CLUB / PORT ALLEGANY, PA</span>
            <span>ROOTED IN COMMUNITY</span>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="club-about-intro">
        <div className="wrap club-about-intro-grid">
          <div>
            <p className="club-about-overline">WHO WE ARE</p>
            <h2>
              Neighbors first.<br />
              <span>Lions always.</span>
            </h2>
          </div>

          <div className="club-about-intro-copy">
            <p>
              The Port Allegany Lions Club is part of a worldwide
              service movement built on a simple belief:
              communities become stronger when people take action
              to help one another.
            </p>

            <p>
              Here at home, our focus is on bringing people
              together, listening to community needs, and
              creating meaningful opportunities to contribute.
            </p>

            <a
              href="https://www.lionsclubs.org/en/discover-our-clubs/about-us"
              target="_blank"
              rel="noopener noreferrer"
              className="club-about-text-link"
            >
              Learn about Lions International
              <ArrowRight size={17}/>
            </a>
          </div>
        </div>
      </section>

      {/* COMMUNITY FEATURE */}
      <section className="club-about-feature">
        <div className="club-about-feature-photo" role="img"
          aria-label="Illustrative photograph representing teamwork" />

        <div className="club-about-feature-content">
          <p className="club-about-overline">MORE THAN A CLUB</p>

          <h2>
            A shared purpose.<br />
            <span>A stronger community.</span>
          </h2>

          <p>
            Community service is about more than individual
            projects. It's about relationships, participation,
            and finding practical ways to make a difference.
          </p>

          <p>
            Every neighbor brings a different perspective.
            Together, those ideas and experiences can help
            build a more connected community.
          </p>

          <div className="club-about-feature-rule">
            PORT ALLEGANY, PENNSYLVANIA
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="club-about-values">
        <div className="wrap">
          <div className="club-about-values-heading">
            <div>
              <p className="club-about-overline">WHAT GUIDES US</p>
              <h2>
                The people behind<br />
                <span>the purpose.</span>
              </h2>
            </div>

            <p>
              Our commitment to service is guided by
              community, connection, and the willingness
              to help where we can.
            </p>
          </div>

          <div className="club-about-values-grid">
            <article className="club-about-value">
              <div className="club-about-value-icon">
                <HandHeart size={27}/>
              </div>

              <p className="club-about-value-label">01 / SERVICE</p>
              <h3>Serve with purpose.</h3>
              <p>
                Recognize meaningful needs and look for
                practical ways to make a difference.
              </p>
            </article>

            <article className="club-about-value">
              <div className="club-about-value-icon">
                <HeartHandshake size={27}/>
              </div>

              <p className="club-about-value-label">02 / COMMUNITY</p>
              <h3>Stronger together.</h3>
              <p>
                Build relationships that connect neighbors,
                organizations, and generations.
              </p>
            </article>

            <article className="club-about-value">
              <div className="club-about-value-icon">
                <UsersRound size={27}/>
              </div>

              <p className="club-about-value-label">03 / FELLOWSHIP</p>
              <h3>Everyone has a place.</h3>
              <p>
                Welcome new perspectives, friendships,
                and opportunities to participate.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* CLOSING */}
      <section className="club-about-close">
        <div className="wrap club-about-close-inner">
          <div>
            <p className="club-about-overline">
              LOCAL CONNECTION. GLOBAL PURPOSE.
            </p>

            <h2>
              Part of a worldwide
              tradition of service.
            </h2>

            <p>
              As part of Lions International, our club is
              connected to a global network committed to
              improving lives through service.
            </p>
          </div>

          <div className="club-about-close-links">
            <Link href="/impact">
              <Globe2 size={20}/>
              Explore our impact
              <ArrowRight size={18}/>
            </Link>

            <Link href="/contact">
              <UsersRound size={20}/>
              Contact our club
              <ArrowRight size={18}/>
            </Link>
          </div>
        </div>
      </section>

    
      {/* ABOUT SUPPORT MISSION V1 */}
      <section className="about-support" aria-labelledby="about-support-title">
        <div className="wrap">
          <div className="about-support-intro">
            <p className="about-support-eyebrow">SUPPORT OUR MISSION</p>
            <h2 id="about-support-title">
              Small contributions.<br/>
              <span>Meaningful impact.</span>
            </h2>
            <p>
              Every act of generosity helps strengthen our hometown.
              Whether you give your time, share your skills, donate
              supplies, or make a financial contribution, you can
              help support the Port Allegany Lions Club's service mission.
            </p>
          </div>

          <div className="about-support-grid">
            <article className="about-support-card">
              <span className="about-support-number">01 / GIVE</span>
              <h3>Make a contribution</h3>
              <p>
                Financial support helps the club pursue approved
                charitable activities and community service initiatives.
              </p>
            </article>

            <article className="about-support-card">
              <span className="about-support-number">02 / CONTRIBUTE</span>
              <h3>Share goods or services</h3>
              <p>
                Local businesses and residents can offer materials,
                resources, or skills that support club-approved projects.
              </p>
            </article>

            <article className="about-support-card">
              <span className="about-support-number">03 / PARTICIPATE</span>
              <h3>Volunteer your time</h3>
              <p>
                You don't have to be a Lions member to ask about
                opportunities to lend a hand in our community.
              </p>
            </article>
          </div>

          <div className="about-support-actions">
            <div>
              <h3>Be part of something meaningful.</h3>
              <p>
                To contribute financially, select the Donate button
                displayed on this page. Donations are processed
                securely through Givebutter.
              </p>
            </div>

            <a href="/join" className="about-support-join">
              Explore volunteering
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="about-support-note">
            Donations support club-approved activities. Specific project
            funding depends on club decisions and available resources.
          </p>
        </div>
      </section>

    </main>
  );
}
