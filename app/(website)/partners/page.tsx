import Link from 'next/link';

import {
  ArrowRight,
  Building2,
  HandHeart,
  HeartHandshake,
  Gift,
  Users,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import CommunityPartnerForm from '@/components/community-partner-form';

import '@/styles/lions-phase-two.css';
import '@/styles/partners.css';

export const metadata = {
  title: 'Community Partners & Business Supporters',
  description:
    'Recognizing local businesses and organizations supporting the Port Allegany Lions Club and our community.',
};

const supportTypes = [
  {
    title: 'Financial Contributions',
    description:
      'Contributions that help support club-approved charitable activities and service initiatives.',
    Icon: HandHeart,
  },
  {
    title: 'Donated Goods & Services',
    description:
      'Materials, supplies, equipment, professional services and other in-kind contributions.',
    Icon: Gift,
  },
  {
    title: 'Time & Collaboration',
    description:
      'Businesses and organizations that contribute volunteer time or collaborate on community projects.',
    Icon: Users,
  },
];

function supportLabel(
  supportTypes: string[] | null
) {
  if (!supportTypes?.length) {
    return 'Community Partner';
  }

  return supportTypes.slice(0, 2).join(' • ');
}

export default async function PartnersPage() {
  const supabase = await createClient();

  const {
    data: partners,
    error,
  } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      website,
      facebook_url,
      city,
      state,
      community_partner_support_types,
      community_partner_public_description,
      community_partner_logo_url
    `)
    .eq(
      'community_partner_status',
      'active'
    )
    .eq(
      'community_partner_public',
      true
    )
    .order('name');

  if (error) {
    console.error(
      'Unable to load public community partners:',
      error
    );
  }

  const publicPartners =
    partners || [];

  return (
    <main className="lions-extra">

      <section className="lx-hero partners-hero">
        <div className="wrap">

          <p className="lx-eyebrow">
            PORT ALLEGANY LIONS CLUB / OUR SUPPORTERS
          </p>

          <h1>
            Local support.<br />
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
            <p className="lx-eyebrow">
              OUR COMMUNITY SUPPORTERS
            </p>

            <h2>
              Businesses that make a difference.
            </h2>

            <p>
              We appreciate those who support the Lions
              through contributions, donated resources
              and community involvement.
            </p>
          </div>


          {publicPartners.length > 0 ? (

            <div className="partners-grid">

              {publicPartners.map(
                (partner) => {

                  const location = [
                    partner.city,
                    partner.state,
                  ]
                    .filter(Boolean)
                    .join(', ');

                  const primaryLink =
                    partner.website ||
                    partner.facebook_url;

                  return (
                    <article
                      className="partner-card"
                      key={partner.id}
                    >

                      <div className="partner-card-logo">

                        {partner.community_partner_logo_url ? (

                          <img
                            src={
                              partner.community_partner_logo_url
                            }
                            alt={`${partner.name} logo`}
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
                          {supportLabel(
                            partner.community_partner_support_types
                          )}
                        </p>

                        <h3>
                          {partner.name}
                        </h3>


                        {location && (

                          <p className="partner-location">
                            {location}
                          </p>

                        )}


                        <p>
                          {partner.community_partner_public_description ||
                            'A valued community partner supporting the Port Allegany Lions Club and our local service efforts.'}
                        </p>


                        {partner.community_partner_support_types?.length ? (

                          <div className="partner-contribution">
                            <strong>
                              How they support our community
                            </strong>

                            <p>
                              {partner.community_partner_support_types.join(
                                ', '
                              )}
                            </p>
                          </div>

                        ) : null}


                        {primaryLink && (

                          <a
                            href={primaryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="partner-website"
                          >
                            {partner.website
                              ? 'Visit website'
                              : 'Visit Facebook'}

                            <ArrowRight
                              size={16}
                            />
                          </a>

                        )}

                      </div>

                    </article>
                  );
                }
              )}

            </div>

          ) : (

            <div className="partners-empty">

              <Building2
                size={32}
                aria-hidden="true"
              />

              <div>

                <h3>
                  Our supporter directory is growing.
                </h3>

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

            <p className="lx-eyebrow">
              WITH GRATITUDE
            </p>

            <h2>
              Every contribution matters.
            </h2>

            <p>
              Supporting a local service club can take many forms.
              We value the businesses that share their resources,
              expertise and time to help make community service
              possible.
            </p>

          </div>


          <div className="partners-support-types">

            {supportTypes.map(
              ({
                title,
                description,
                Icon,
              }) => (

                <article key={title}>

                  <div className="partners-type-icon">
                    <Icon
                      size={25}
                      aria-hidden="true"
                    />
                  </div>

                  <h3>
                    {title}
                  </h3>

                  <p>
                    {description}
                  </p>

                </article>

              )
            )}

          </div>

        </div>

      </section>


      <section className="partners-thankyou">

        <div className="wrap">

          <HeartHandshake
            size={32}
            aria-hidden="true"
          />

          <div>

            <p className="lx-eyebrow">
              THANK YOU
            </p>

            <h2>
              Rooted in community. United in service.
            </h2>

            <p>
              To the businesses and neighbors who support
              the Port Allegany Lions Club: thank you for
              investing in our hometown and helping create
              opportunities to serve.
            </p>

          </div>

        </div>

      </section>


      <section className="partner-interest-section">

        <div className="wrap">

          <div className="partner-interest-layout">

            <div className="partner-interest-copy">

              <p className="lx-eyebrow">
                BECOME A COMMUNITY PARTNER
              </p>

              <h2>
                Help us make a difference in Port Allegany.
              </h2>

              <p>
                Community partnership can take many forms.
                Your business can support local service
                projects through donations, sponsorships,
                volunteer time, donated goods or services,
                event participation, or simply by getting
                involved with the club.
              </p>

              <p>
                Tell us a little about your business and
                how you might like to participate. We will
                reach out to start a conversation.
              </p>

              <div className="partner-interest-benefit">

                <strong>
                  Community Partner Recognition
                </strong>

                <p>
                  Approved active partners may also be
                  recognized here on our Community Partners
                  page, including your logo, business
                  information, and a link to your website.
                </p>

              </div>

            </div>


            <div className="partner-interest-form-wrap">

              <CommunityPartnerForm />

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
