import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  UsersRound,
  HandHeart,
  HeartHandshake,
  CheckCircle2,
  MessageCircle,
  CalendarDays
} from 'lucide-react';

import InquiryForm from '@/components/inquiry-form';
import '../../styles/join.css';

export const metadata = {
  title: 'Get Involved',
  description:
    'Explore membership, volunteering, and community partnership opportunities with the Port Allegany Lions Club.'
};

const ways = [
  {
    number: '01',
    title: 'Explore membership',
    description:
      'Get to know the club, connect with members, and learn what becoming a Lion involves.',
    Icon: UsersRound
  },
  {
    number: '02',
    title: 'Volunteer',
    description:
      'Express your interest in helping with community service opportunities, without making a membership commitment.',
    Icon: HandHeart
  },
  {
    number: '03',
    title: 'Work together',
    description:
      'Represent a local organization, business, or community initiative? Start a conversation about ways to collaborate.',
    Icon: HeartHandshake
  }
];

export default function Join() {
  return (
    <main className="join-page">

      <section className="join-hero">
        <div className="join-hero-art" aria-hidden="true" />

        <div className="wrap join-hero-inner">
          <div className="join-hero-copy">
            <p className="join-kicker">
              <span className="join-dot" />
              PORT ALLEGANY LIONS CLUB / GET INVOLVED
            </p>

            <h1>
              There's a place<br />
              <span>for you here.</span>
            </h1>

            <p>
              Make connections, share your ideas, and explore
              meaningful ways to contribute to the community
              we call home.
            </p>

            <a href="#get-started" className="join-hero-button">
              Find your way to help
              <ArrowRight size={18} />
            </a>
          </div>

          <div className="join-hero-aside" aria-hidden="true">
            <span className="join-hero-aside-rule" />
            <strong>Local people.<br />Shared purpose.</strong>
            <span>ROOTED IN COMMUNITY</span>
          </div>
        </div>

        <div className="join-hero-strip">
          <div className="wrap">
            <span>MEMBERSHIP</span>
            <span>VOLUNTEERING</span>
            <span>COMMUNITY PARTNERSHIPS</span>
          </div>
        </div>
      </section>

      <section className="join-pathways" id="get-started">
        <div className="wrap">

          <div className="join-section-heading">
            <div>
              <p className="join-overline">HOW TO GET INVOLVED</p>
              <h2>
                Find your way<br />
                <span>to make a difference.</span>
              </h2>
            </div>

            <p>
              There's more than one way to contribute.
              Start with what interests you and explore
              what's possible.
            </p>
          </div>

          <div className="join-pathway-grid">
            {ways.map(({ number, title, description, Icon }) => (
              <article className="join-pathway" key={number}>
                <div className="join-pathway-top">
                  <span>{number} / GET INVOLVED</span>
                  <Icon size={29} strokeWidth={1.7} />
                </div>

                <h3>{title}</h3>
                <p>{description}</p>

                <a href="#inquiry" className="join-pathway-link">
                  Start a conversation
                  <ArrowRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="join-expectations">
        <div className="wrap join-expectations-inner">
          <div>
            <p className="join-overline">A SIMPLE FIRST STEP</p>
            <h2>
              You don't need to have
              it all figured out.
            </h2>
          </div>

          <div className="join-expectations-copy">
            <p>
              Whether you're ready to explore membership or just
              have a question, reaching out is a good place to begin.
            </p>

            <div className="join-expectation-point">
              <CheckCircle2 size={20} />
              <span>No membership commitment required to inquire</span>
            </div>

            <div className="join-expectation-point">
              <CheckCircle2 size={20} />
              <span>Ask questions and explore your interests</span>
            </div>

            <div className="join-expectation-point">
              <CheckCircle2 size={20} />
              <span>Learn about opportunities as details are confirmed</span>
            </div>
          </div>
        </div>
      </section>

      <section className="join-inquiry-section" id="inquiry">
        <div className="wrap join-inquiry-grid">

          <div className="join-inquiry-intro">
            <p className="join-overline">LET'S CONNECT</p>

            <h2>
              Start with<br />
              <span>a conversation.</span>
            </h2>

            <p>
              Tell us a little about yourself and what interests
              you. Your message gives the club a starting point
              for connecting with you.
            </p>

            <div className="join-inquiry-details">
              <div>
                <MessageCircle size={21} />
                <span>
                  <strong>Ask a question</strong>
                  Find out more about the club and its activities.
                </span>
              </div>

              <div>
                <CalendarDays size={21} />
                <span>
                  <strong>Explore opportunities</strong>
                  Inquire about future meetings or service activities.
                </span>
              </div>
            </div>

            <p className="join-inquiry-disclaimer">
              Submitting this form is an expression of interest,
              not a formal membership application. Membership
              requirements, dues, and meeting arrangements are
              subject to confirmation by club leadership.
            </p>
          </div>

          <div className="join-form-wrap">
            <InquiryForm mode="join" />
          </div>
        </div>
      </section>

      
      <section className="lions-membership-faq" id="membership-faq">
        <div className="wrap">
          <div className="lions-faq-heading">
            <p className="join-overline">MEMBERSHIP QUESTIONS</p>
            <h2>Frequently asked questions.</h2>
            <p>Interested in becoming a Lion? Here's how to get started.</p>
          </div>

          <div className="lions-faq-list">
            <details>
              <summary>Do I have to become a member to volunteer?</summary>
              <p>
                No. Some club-organized service opportunities may welcome
                nonmembers. Contact us to learn which activities are open
                to community volunteers.
              </p>
            </details>

            <details>
              <summary>How do I become a member?</summary>
              <p>
                Start by contacting the club through the inquiry form.
                We can explain the membership process, answer your questions,
                and help you connect with current members.
              </p>
            </details>

            <details>
              <summary>Are there membership dues?</summary>
              <p>
                Lions membership generally involves dues. The exact local
                amount and any applicable fees should be confirmed with
                club leadership before you join.
              </p>
            </details>

            <details>
              <summary>When and where does the club meet?</summary>
              <p>
                Contact the club for current meeting arrangements.
                Public meeting times and locations will be posted once
                they have been confirmed.
              </p>
            </details>

            <details>
              <summary>How much time do members need to commit?</summary>
              <p>
                Members participate according to club expectations and
                their availability. Ask us about meetings, volunteer projects,
                and realistic ways to contribute.
              </p>
            </details>

            <details>
              <summary>Can I suggest a project or ask for assistance?</summary>
              <p>
                Yes. Residents can submit project ideas, and local
                organizations can request volunteer help for club review.
                Acceptance depends on available members and resources.
              </p>
              <p>
                <Link href="/suggest-project">Suggest a project</Link>
                {' · '}
                <Link href="/community-needs">Request volunteer help</Link>
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* LIONS FEATURES PHASE 2 V1 */}
<section className="lx-flyer-promo" style={{padding:"34px 0",background:"#edf3f9"}}>
 <div className="wrap" style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:"18px"}}>
  <div><h2 style={{fontSize:"clamp(25px,3vw,36px)",margin:"0 0 8px"}}>Help spread the word.</h2><p style={{margin:0,color:"#556c82"}}>Share our volunteer flyer with friends and neighbors.</p></div>
  <a href="/volunteer-flyer.pdf" download="Port-Allegany-Lions-Volunteer-Flyer.pdf" style={{display:"inline-flex",padding:"13px 18px",background:"#ebb700",color:"#0d2240",fontWeight:800}}>Download volunteer flyer ↓</a>
 </div>
</section>
<section className="join-ending">
        <div className="wrap join-ending-inner">
          <div>
            <p className="join-overline">LEARN MORE ABOUT OUR CLUB</p>
            <h2>Discover what brings us together.</h2>
          </div>

          <Link href="/about">
            Explore Our Club
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

    </main>
  );
}
