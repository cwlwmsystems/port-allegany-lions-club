import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  Facebook,
  Mail,
  CalendarDays,
  MessageCircle
} from 'lucide-react';

import InquiryForm from '@/components/inquiry-form';
import { club } from '@/lib/content';
import '../../styles/contact.css';

export const metadata = {
  title: 'Contact Us',
  description:
    'Contact the Port Allegany Lions Club with questions, community ideas, membership inquiries, or volunteer interests.'
};

export default function Contact() {
  return (
    <main className="contact-page">

      <section className="contact-hero">
        <div className="contact-hero-shape" aria-hidden="true" />

        <div className="wrap contact-hero-inner">
          <p className="contact-kicker">
            <span className="contact-dot" />
            PORT ALLEGANY LIONS CLUB / CONTACT
          </p>

          <h1>
            Let's start<br />
            <span>a conversation.</span>
          </h1>

          <p>
            Questions, ideas, or an interest in getting involved?
            We'd like to hear from you.
          </p>

          <a href="#contact-form" className="contact-hero-button">
            Send us a message
            <ArrowRight size={18} />
          </a>
        </div>

        <div className="contact-hero-strip">
          <div className="wrap">
            <span>QUESTIONS & IDEAS</span>
            <span>COMMUNITY CONNECTION</span>
          </div>
        </div>
      </section>

      <section className="contact-main" id="contact-form">
        <div className="wrap contact-grid">

          <div className="contact-information">
            <p className="contact-overline">GET IN TOUCH</p>

            <h2>
              We're here<br />
              <span>to connect.</span>
            </h2>

            <p className="contact-intro">
              Reach out about community activities, volunteering,
              club membership, or an idea that could make a
              difference in Port Allegany.
            </p>

            <div className="contact-detail-list">

              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <MapPin size={23} />
                </div>

                <div>
                  <h3>Our community</h3>
                  <p>{club.town}</p>
                </div>
              </div>

              {club.email && (
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <Mail size={23} />
                  </div>

                  <div>
                    <h3>Email the club</h3>
                    <a href={`mailto:${club.email}`}>
                      {club.email}
                    </a>
                  </div>
                </div>
              )}

              {club.meetingDetails && (
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <CalendarDays size={23} />
                  </div>

                  <div>
                    <h3>Club meetings</h3>
                    <p>{club.meetingDetails}</p>
                  </div>
                </div>
              )}

              {club.socialUrl && (
                <div className="contact-detail">
                  <div className="contact-detail-icon">
                    <Facebook size={23} />
                  </div>

                  <div>
                    <h3>Follow the club</h3>
                    <a
                      href={club.socialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-external-link"
                    >
                      Visit our Facebook page
                      <ArrowUpRight size={16} />
                    </a>
                  </div>
                </div>
              )}

            </div>

            <div className="contact-note-box">
              <MessageCircle size={22} />

              <div>
                <h3>Have a community idea?</h3>
                <p>
                  Share it through the form. We welcome questions
                  and suggestions from people interested in
                  supporting our community.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-form-column">
            <InquiryForm mode="contact" />
          </div>

        </div>
      </section>

      <section className="contact-bottom">
        <div className="wrap contact-bottom-inner">
          <div>
            <p className="contact-overline">GET INVOLVED</p>
            <h2>
              Looking for ways to help?
            </h2>
            <p>
              Learn more about membership, volunteering,
              and community partnerships.
            </p>
          </div>

          <Link href="/join" className="contact-bottom-link">
            Explore opportunities
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
