import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  HandHeart,
  HeartHandshake,
  Gift,
  Users
} from 'lucide-react';
import {clubPartners} from '@/lib/lions-partners';
import '../../styles/lions-phase-two.css';
import '../../styles/partners.css';

export const metadata = {
  title: 'Community Partners & Business Supporters',
  description:
    'Recognizing local businesses and organizations supporting the Port Allegany Lions Club and our community.'
};

const supportTypes = [
  {
    title: 'Financial Contributions',
    description:
      'Contributions that help support club-approved charitable activities and service initiatives.',
    Icon: HandHeart
  },
  {
    title: 'Donated Goods & Services',
    description:
      'Materials, supplies, equipment, professional services and other in-kind contributions.',
    Icon: Gift
  },
  {
    title: 'Time & Collaboration',
    description:
      'Businesses and organizations that contribute volunteer time or collaborate on community projects.',
    Icon: Users
  }
];

export default function PartnersPage() {
  return (
    <main className="lions-extra">
      <section className="lx-hero partners-hero">
        <div className="wrap">
          <p className="lx-eyebrow">
            PORT ALLEGANY LIONS CLUB / OUR SUPPORTERS
          </p>

          <h1>
            Local support.<br/>
            <span>Lasting impact.</span>
          </h1>

          <p>
            Recognizing the businesses and organizations
            whose generosity, involvement and commitment
            help strengthen our community.
          </p>
        </div>
      </section>

      <section className="lx-section partners-supporters">
        <div className="wrap">
          <div className="lx-heading">
            <p className="lx-eyebrow">OUR COMMUNITY SUPPORTERS</p>
            <h2>Businesses that make a difference.</h2>
            <p>
              We appreciate those who support the Lions
              through contributions, donated resources
              and community involvement.
            </p>
          </div>

          {clubPartners.length > 0 ? (
            <div className="partners-grid">
              {clubPartners.map(partner => (
                <article
                  className="partner-card"
                  key={partner.name}
                >
                  <div className="partner-card-logo">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name + ' logo'}
                        loading="lazy"
                      />
                    ) : (
                      <Building2
                        size={42}
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="partner-card-content">
                    <p className="partner-category">
                      {partner.contributionType ||
                        'Community Supporter'}
                    </p>

                    <h3>{partner.name}</h3>

                    {partner.location && (
                      <p className="partner-location">
                        {partner.location}
                      </p>
                    )}

                    <p>{partner.description}</p>

                    <div className="partner-contribution">
                      <strong>How they helped</strong>
                      <p>{partner.contribution}</p>
                    </div>

                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="partner-website"
                      >
                        Visit website
                        <ArrowRight size={16}/>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="partners-empty">
              <Building2 size={32} aria-hidden="true"/>

              <div>
                <h3>Our supporter directory is growing.</h3>
                <p>
                  This space is reserved for businesses and
                  organizations whose contributions to the
                  Port Allegany Lions Club have been confirmed
                  and approved for recognition.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="partners-appreciation">
        <div className="wrap">
          <div className="partners-appreciation-intro">
            <p className="lx-eyebrow">WITH GRATITUDE</p>
            <h2>Every contribution matters.</h2>
            <p>
              Supporting a local service club can take many forms.
              We value the businesses that share their resources,
              expertise and time to help make community service
              possible.
            </p>
          </div>

          <div className="partners-support-types">
            {supportTypes.map(({title, description, Icon}) => (
              <article key={title}>
                <div className="partners-type-icon">
                  <Icon size={25} aria-hidden="true"/>
                </div>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="partners-thankyou">
        <div className="wrap">
          <HeartHandshake size={32} aria-hidden="true"/>

          <div>
            <p className="lx-eyebrow">THANK YOU</p>
            <h2>Rooted in community. United in service.</h2>
            <p>
              To the businesses and neighbors who support
              the Port Allegany Lions Club: thank you for
              investing in our hometown and helping create
              opportunities to serve.
            </p>
          </div>
        </div>
      </section>

      <section className="lx-cta">
        <div className="wrap lx-cta-inner">
          <div>
            <p className="lx-eyebrow">BECOME A SUPPORTER</p>
            <h2>Your business can make a difference.</h2>
            <p>
              Interested in supporting the Lions through
              a contribution, donated goods or services,
              or a community partnership?
            </p>
          </div>

          <Link href="/contact">
            Contact our club <ArrowRight size={18}/>
          </Link>
        </div>
      </section>
    </main>
  );
}
