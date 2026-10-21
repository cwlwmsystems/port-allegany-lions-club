import '../styles/mobile-homepage.css';
import Link from 'next/link';
import { ArrowRight, CalendarDays, HeartHandshake, UsersRound, Eye, MapPin, ChevronRight, HandHeart, Star, Instagram, Facebook } from 'lucide-react';

export default function Home(){return <>
<section className="fb-hero">
 <div className="fb-hero-photo" aria-hidden="true"/>
 <div className="fb-hero-overlay" aria-hidden="true"/>
 <div className="wrap fb-hero-grid"><div className="fb-hero-copy">
   <p className="fb-kicker"><span className="fb-dot"/> PORT ALLEGANY, PENNSYLVANIA <span className="fb-kicker-line"/></p>
   <h1>We serve.<br/><span>Right here</span><br/>at home.</h1>
   <p className="fb-hero-sub">Neighbors coming together. Communities growing stronger. Discover what it means to make a difference in Port Allegany.</p>
   <div className="fb-buttons"><Link href="/join" className="fb-primary">Get involved <ArrowRight size={19}/></Link><Link href="/about" className="fb-outline">Explore our club <ArrowRight size={18}/></Link></div>
  </div><div className="fb-hero-feature"><span>OUR COMMUNITY</span><h3>A place worth showing up for.</h3><p>Port Allegany, Pennsylvania</p></div></div>
 <div className="fb-hero-bottom"><div className="wrap fb-bottom-inner"><span>PROUD TO SERVE OUR COMMUNITY</span><span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span></div></div>
</section>
<section className="fb-statement"><div className="wrap fb-statement-grid"><div><p className="fb-overline">WELCOME TO THE PORT ALLEGANY LIONS CLUB</p><h2>Our community.<br/><span>Our commitment.</span></h2></div><div><p>Some of the most meaningful changes begin close to home—with neighbors who care and people willing to lend a hand.</p><p>The Port Allegany Lions Club brings that spirit of service to our community. We invite you to learn more and find a way to be part of it.</p><Link href="/about" className="fb-text-link">Get to know us <ArrowRight size={18}/></Link></div></div></section>
<section className="fb-photo-mosaic" aria-label="Illustrative community imagery"><div className="fb-mosaic-img fb-mosaic-one"><span>THE PEOPLE</span></div><div className="fb-mosaic-img fb-mosaic-two"><span>THE PLACE</span></div><div className="fb-mosaic-img fb-mosaic-three"><span>THE PURPOSE</span></div></section>
<section className="fb-serve"><div className="wrap"><div className="fb-section-top"><div><p className="fb-overline">OUR MISSION IN ACTION</p><h2>Small actions.<br/><span>Lasting impact.</span></h2></div><p>Every community grows stronger when people share their time, skills and compassion. Here are a few ways you can be part of the Lions spirit of service.</p></div><div className="fb-service-grid">
 <Link href="/impact" className="fb-service"><div className="fb-service-photo" style={{backgroundImage:'url(/images/vision-clean.jpg)'}}/><div className="fb-service-icon"><Eye size={24}/></div><div className="fb-service-copy"><p>01 / WELL-BEING</p><h3>Care for our neighbors</h3><span>Explore our focus <ArrowRight size={17}/></span></div></Link>
 <Link href="/impact" className="fb-service"><div className="fb-service-photo" style={{backgroundImage:'url(/images/community-clean.jpg)'}}/><div className="fb-service-icon"><HeartHandshake size={24}/></div><div className="fb-service-copy"><p>02 / COMMUNITY</p><h3>Build a stronger hometown</h3><span>Explore our focus <ArrowRight size={17}/></span></div></Link>
 <Link href="/join" className="fb-service"><div className="fb-service-photo" style={{backgroundImage:'url(/images/youth-clean.jpg)'}}/><div className="fb-service-icon"><UsersRound size={24}/></div><div className="fb-service-copy"><p>03 / CONNECTION</p><h3>Make service a shared experience</h3><span>Get involved <ArrowRight size={17}/></span></div></Link>
 </div><p className="fb-art-note">Imagery is illustrative; actual local club projects and photographs can be added as they are confirmed.</p></div></section>
<section className="fb-about-band"><div className="fb-about-image"/><div className="fb-about-content"><p className="fb-overline">MORE THAN A CLUB</p><h2>A tradition of<br/><span>showing up.</span></h2><p>Real community starts with connection. Whether you have an hour to give or a lifelong passion for helping others, there is room to take the next step.</p><Link href="/join" className="fb-primary">Become a Lion <ArrowRight size={18}/></Link><div className="fb-about-tag">WE SERVE. · PORT ALLEGANY, PA</div></div></section>

<section className="fb-events-redesign">
  <div className="fb-events-layout">

    <div className="fb-events-photo">
      <div className="fb-events-photo-label">
        <span>COMMUNITY CONNECTION</span>
        <strong>Better together.</strong>
      </div>
    </div>

    <div className="fb-events-content">
      <div className="fb-events-content-inner">
        <p className="fb-overline">EVENTS & COMMUNITY</p>

        <h2>
          Good things happen
          <br />
          <span>when we come together.</span>
        </h2>

        <p className="fb-events-description">
          Community service brings people together. From local
          gatherings to opportunities to lend a hand, we believe
          meaningful connections make our hometown stronger.
        </p>

        <Link href="/events" className="fb-primary">
          Explore Events
          <ArrowRight size={19}/>
        </Link>

        <div className="fb-events-divider"/>

        <div className="fb-events-calendar">
          <div className="fb-events-calendar-icon">
            <CalendarDays size={25}/>
          </div>

          <div>
            <h3>Stay in the loop.</h3>
            <p>
              Upcoming club events and volunteer opportunities
              will be shared as details are confirmed.
            </p>

            <Link href="/contact">
              Ask about upcoming opportunities
              <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </div>
    </div>

  </div>
</section>
<section className="fb-join-banner"><div className="wrap fb-join-inner"><div><p className="fb-overline">YOUR COMMUNITY. YOUR IMPACT.</p><h2>Be part of<br/>something good.</h2><p>New faces. Fresh ideas. A shared purpose to make Port Allegany stronger.</p></div><div className="fb-join-actions"><Link href="/join" className="fb-primary">Become a Lion <ArrowRight size={18}/></Link><a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/portalleganylions" className="fb-facebook"><Facebook size={18}/> Follow on Facebook</a></div></div></section>
</>}
