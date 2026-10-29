
import Link from 'next/link';
import {ArrowRight, Eye, Recycle, MapPin} from 'lucide-react';
import '../../styles/lions-phase-two.css';

export const metadata = {
  title: 'Eyeglass Recycling',
  description: 'Learn about Lions eyeglass recycling and how to find participating donation locations.'
};

export default function VisionPage() {
  return <main className="lions-extra">
    <section className="lx-hero">
      <div className="wrap">
        <p className="lx-eyebrow">VISION / SERVICE</p>
        <h1>Give old glasses.<br/><span>A new purpose.</span></h1>
        <p>Learn how Lions help support access to vision care through eyeglass collection and recycling programs.</p>
      </div>
    </section>

    <section className="lx-section">
      <div className="wrap">
        <div className="lx-heading">
          <p className="lx-eyebrow">LIONS RECYCLE FOR SIGHT</p>
          <h2>A small donation can make a difference.</h2>
          <p>Lions-supported recycling centers sort and process donated eyeglasses for use in vision programs.</p>
        </div>

        <div className="lx-steps">
          <article>
            <Eye size={29}/>
            <h3>1. Find usable glasses</h3>
            <p>Set aside eyeglasses or sunglasses you no longer need. Confirm accepted items with the collection program before donating.</p>
          </article>
          <article>
            <MapPin size={29}/>
            <h3>2. Find a participating location</h3>
            <p>Ask a participating Lions club or optical provider where donations are currently accepted.</p>
          </article>
          <article>
            <Recycle size={29}/>
            <h3>3. Support recycling</h3>
            <p>Collected glasses can be sent to Lions Eyeglass Recycling Centers for sorting and processing.</p>
          </article>
        </div>

        <div className="lx-info">
          <h3>Looking for a drop-off location?</h3>
          <p>We have not published a confirmed Port Allegany Lions Club eyeglass collection site. Please verify participation and accepted donations before visiting any location.</p>
          <a href="https://www.lionsclubs.org/en/explore-our-clubs/eyeglasses-and-hearing-aids-recycling"
             target="_blank" rel="noopener noreferrer">
            Lions International donation information <ArrowRight size={17}/>
          </a>
        </div>
      </div>
    </section>

    <section className="lx-cta">
      <div className="wrap lx-cta-inner">
        <div>
          <p className="lx-eyebrow">HELP SUPPORT VISION</p>
          <h2>Interested in helping locally?</h2>
          <p>Connect with our club to discuss future vision-related service opportunities.</p>
        </div>
        <Link href="/contact">Contact the Lions <ArrowRight size={18}/></Link>
      </div>
    </section>
  </main>;
}
