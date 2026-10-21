
import Link from 'next/link';
import {ArrowRight, Lightbulb, HeartHandshake} from 'lucide-react';
import CommunityIntakeForm from '@/components/community-intake-form';
import '../../styles/community-features.css';

export const metadata = {
  title:'Suggest a Project',
  description:'Suggest a practical community-service project for the Port Allegany Lions Club.'
};

export default function SuggestProjectPage() {
  return (
    <main className="community-feature-page">
      <section className="community-feature-hero">
        <div className="wrap">
          <p className="community-eyebrow">YOUR COMMUNITY / YOUR IDEAS</p>
          <h1>Good ideas start<br/><span>with our neighbors.</span></h1>
          <p>
            Tell us about a practical way to make Port Allegany stronger.
            Your idea might inspire a future Lions service project.
          </p>
          <a href="#project-form" className="community-yellow-button">
            Share your idea <ArrowRight size={18}/>
          </a>
        </div>
      </section>

      <section className="community-idea-intro">
        <div className="wrap">
          <div>
            <Lightbulb size={27}/>
            <h2>What makes a good project?</h2>
            <p>
              Something useful to the community, achievable with a small
              group of volunteers, and possible without significant expense.
            </p>
          </div>
          <div>
            <HeartHandshake size={27}/>
            <h2>What happens next?</h2>
            <p>
              Club members review submissions, assess resources and permissions,
              and follow up when an idea is appropriate to pursue.
            </p>
          </div>
        </div>
      </section>

      <section className="community-form-section" id="project-form">
        <div className="wrap community-form-layout">
          <div className="community-form-sidebar">
            <p className="community-eyebrow">SHARE YOUR IDEA</p>
            <h2>Your idea.<br/><span>Our hometown.</span></h2>
            <p>
              You don't need to be a member to suggest something.
              We welcome thoughtful ideas from Port Allegany residents.
            </p>
            <div className="community-information-note">
              <Lightbulb size={23}/>
              <span>
                Suggestions are reviewed privately. Sending an idea
                does not create a public listing or guarantee a project.
              </span>
            </div>
          </div>
          <CommunityIntakeForm mode="suggestion"/>
        </div>
      </section>

      <section className="community-crosslink">
        <div className="wrap">
          <h2>Represent a local organization?</h2>
          <Link href="/community-needs">
            Request volunteer help <ArrowRight size={18}/>
          </Link>
        </div>
      </section>
    </main>
  );
}
