'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X, Instagram, Facebook, ArrowUpRight } from 'lucide-react';
import { club } from '@/lib/content';

const nav = [{href:'/about',label:'Our Club'},{href:'/events',label:'Events'},{href:'/impact',label:'Our Impact'},{href:'/join',label:'Get Involved'}];
export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const closeMenu = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <header className="site-header mobile-ready-header">
      <div className="wrap nav-wrap">
        <Link
          href="/"
          className="brand"
          aria-label="Port Allegany Lions Club homepage"
          onClick={closeMenu}
        >
          <img
            src="/images/lions-emblem-official.png"
            alt=""
            aria-hidden="true"
            className="brand-symbol"
            width={48}
            height={48}
          />
          <span className="brand-copy">
            <strong>PORT ALLEGANY</strong>
            <small>LIONS CLUB <span>·</span> WE SERVE</small>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {nav.map(item => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link className="nav-button" href="/contact">
            Contact <ArrowUpRight size={15}/>
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="mobile-toggle"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-site-navigation"
          onClick={() => setOpen(value => !value)}
        >
          {open ? <X size={26}/> : <Menu size={26}/>}
        </button>
      </div>

      {open && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={closeMenu}
        />
      )}

      <nav
        id="mobile-site-navigation"
        className={open ? 'mobile-nav mobile-nav-open' : 'mobile-nav'}
        aria-label="Mobile navigation"
        hidden={!open}
      >
        {[...nav, {href: '/contact', label: 'Contact'}].map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMenu}
            tabIndex={open ? 0 : -1}
          >
            <span>{item.label}</span>
            <ArrowRight size={18}/>
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer footer-redesigned footer-compact">
      <div className="wrap">
        <div className="footer-compact-main">
          <div className="footer-identity">
            <Link href="/" className="footer-identity-link">
              <img
                src="/images/lions-emblem-official.png"
                alt="Lions International emblem"
                className="footer-logo"
                width="64"
                height="64"
              />
              <span className="footer-identity-name">
                <strong>Port Allegany</strong>
                <span>Lions Club</span>
              </span>
            </Link>
            <p>Neighbors serving neighbors in Port Allegany, Pennsylvania.</p>
          </div>

          <nav className="footer-compact-links" aria-label="Footer navigation">
            <h3>QUICK LINKS</h3>
            <div>
              <Link href="/about">Our Club</Link>
              <Link href="/events">Events</Link>
              <Link href="/impact">Our Impact</Link>
              <Link href="/join">Get Involved</Link>
              <Link href="/community-needs">Community Needs</Link>
              <Link href="/suggest-project">Suggest a Project</Link>
              <Link href="/contact">Contact</Link>
            </div>
            {club.socialUrl && (
              <a href={club.socialUrl}
                 target="_blank"
                 rel="noopener noreferrer">
                <Facebook size={17}/> Facebook
              </a>
            )}
          </nav>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Port Allegany Lions Club.</span>
          <span>Rooted in Community. Driven by Service.</span>
        </div>
      </div>
    </footer>
  );
}

export function CTA({heading='Your community needs people like you.',body='Bring your ideas, your energy, or just your curiosity. You don’t have to be a member to start making a difference.'}:{heading?:string,body?:string}){return <section className="cta-band"><div className="wrap cta-inner"><div><span className="eyebrow gold">THE NEXT CHAPTER STARTS HERE</span><h2>{heading}</h2><p>{body}</p></div><Link href="/join" className="btn btn-gold">Find your place <ArrowRight size={18}/></Link></div></section>}
export function PageHero({label,title,description}:{label:string,title:string,description:string}){return <section className="page-hero"><div className="wrap"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div><div className="page-hero-orb" aria-hidden="true"/></section>}
