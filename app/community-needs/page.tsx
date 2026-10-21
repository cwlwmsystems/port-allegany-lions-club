
import Link from 'next/link';
import {ArrowRight, HandHeart, ClipboardList} from 'lucide-react';
import {communityNeeds} from '@/lib/community-needs';
import CommunityIntakeForm from '@/components/community-intake-form';
import '../../styles/community-features.css';

export const metadata = {
  title:'Community Needs',
  description:'Local organizations can request volunteer help from the Port Allegany Lions Club.'
};

export default function CommunityNeedsPage() {
  return (
    <main className="community-feature-page">
      <section className="community-feature-hero">
        <div className="wrap">
          <p className="community-eyebrow">LIONS IN ACTION / COMMUNITY NEEDS</p>
          <h1>See a need?<br/><span>We want to hear it.</span></h1>
          <p>
            Local organizations can share opportunities where a few willing
            volunteers could make a meaningful difference.
          </p>
          <a href="#request-help" className="community-yellow-button">
            Request volunteer help <ArrowRight size={18}/>
          </a>
        </div>
      </section>

      <section className="community-feature-section">
        <div className="wrap">
          <div className="community-feature-heading">
            <div>
              <p className="community-eyebrow">OPEN OPPORTUNITIES</p>
              <h2>Where our community needs a hand.</h2>
            </div>
            <p>
              Approved requests will appear here as opportunities become available.
            </p>
          </div>

          {communityNeeds.length > 0 ? (
            <div className="community-needs-list">
              {communityNeeds.map(need => (
                <article className="community-need-card" key={need.id}>
                  <p className="community-card-label">{need.organization}</p>
                  <h3>{need.title}</h3>
                  <p>{need.description}</p>
                  <div className="community-need-meta">
                    <span>{need.location}</span>
                    <span>{need.timing}</span>
                    {need.volunteersNeeded && <span>{need.volunteersNeeded}</span>}
                  </div>
                  <Link href="/contact">
                    Ask about volunteering <ArrowRight size={16}/>
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="community-empty-state">
              <ClipboardList size={31}/>
              <div>
                <h3>We're collecting community requests.</h3>
                <p>
                  No volunteer requests have been approved for public listing yet.
                  If your organization needs a hand, send us the details below.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="community-form-section" id="request-help">
        <div className="wrap community-form-layout">
          <div className="community-form-sidebar">
            <p className="community-eyebrow">REQUEST HELP</p>
            <h2>Small projects.<br/><span>Shared effort.</span></h2>
            <p>
              Tell us about a practical task, community event,
              or volunteer opportunity where a small group could contribute.
            </p>
            <div className="community-information-note">
              <HandHeart size={23}/>
              <span>
                Every request is reviewed individually.
                Volunteer availability and club approval are required.
              </span>
            </div>
          </div>
          <CommunityIntakeForm mode="need"/>
        </div>
      </section>

      <section className="community-crosslink">
        <div className="wrap">
          <h2>Have an idea instead?</h2>
          <Link href="/suggest-project">
            Suggest a community project <ArrowRight size={18}/>
          </Link>
        </div>
      </section>
    </main>
  );
}
