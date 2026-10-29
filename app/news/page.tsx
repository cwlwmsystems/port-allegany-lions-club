
import Link from 'next/link';
import {ArrowRight, Newspaper} from 'lucide-react';
import {clubUpdates} from '@/lib/lions-updates';
import '../../styles/lions-phase-two.css';

export const metadata = {
  title: 'Lions News & Updates',
  description: 'Community news, announcements and service updates from the Port Allegany Lions Club.'
};

export default function NewsPage() {
  const updates = [...clubUpdates].sort(
    (a,b) => b.date.localeCompare(a.date)
  );

  return <main className="lions-extra">
    <section className="lx-hero">
      <div className="wrap">
        <p className="lx-eyebrow">PORT ALLEGANY LIONS CLUB / NEWS</p>
        <h1>Good things happen.<br/><span>Here at home.</span></h1>
        <p>Follow club announcements, service projects and the neighbors making a difference in our community.</p>
      </div>
    </section>

    <section className="lx-section">
      <div className="wrap">
        <div className="lx-heading">
          <p className="lx-eyebrow">LATEST FROM THE LIONS</p>
          <h2>Community news & updates.</h2>
          <p>Real projects, local connections and stories worth sharing.</p>
        </div>

        {updates.length ? <div className="lx-card-grid">
          {updates.map(item => <article className="lx-card" key={item.slug}>
            {item.image && <img className="lx-card-image" src={item.image} alt="" />}
            <div className="lx-card-body">
              <p className="lx-card-meta">{item.category} / {item.date}</p>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <details className="lx-story-details">
                <summary>Read update <ArrowRight size={16}/></summary>
                <p>{item.content}</p>
              </details>
            </div>
          </article>)}
        </div> : <div className="lx-empty">
          <Newspaper size={30}/>
          <div>
            <h3>Our next chapter is taking shape.</h3>
            <p>We're preparing this space for confirmed announcements and community service recaps. Check back for news from the Lions.</p>
          </div>
        </div>}
      </div>
    </section>

    <section className="lx-cta">
      <div className="wrap lx-cta-inner">
        <div>
          <p className="lx-eyebrow">BE PART OF THE STORY</p>
          <h2>Help create our next update.</h2>
          <p>Explore ways to volunteer and make an impact in Port Allegany.</p>
        </div>
        <Link href="/join">Get involved <ArrowRight size={18}/></Link>
      </div>
    </section>
  </main>;
}
