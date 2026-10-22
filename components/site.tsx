'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Menu, X, Instagram, Facebook, ArrowUpRight, ChevronDown } from 'lucide-react';
import { club } from '@/lib/content';
import '../styles/header-dropdowns.css';


// LIONS DROPDOWN NAV V2

type NavigationItem = {
  label: string;
  href: string;
  download?: boolean;
};

const navigationGroups: {
  id: string;
  label: string;
  links: NavigationItem[];
}[] = [
  {
    id: 'club',
    label: 'Our Club',
    links: [
      {label: 'About Us', href: '/about'},
      {label: 'Our Impact', href: '/impact'},
      {label: 'Community Partners', href: '/partners'},
      {label: 'News & Updates', href: '/news'},
    ],
  },
  {
    id: 'community',
    label: 'Community',
    links: [
      {label: 'Events', href: '/events'},
      {label: 'Community Needs Board', href: '/community-needs'},
      {label: 'Suggest a Project', href: '/suggest-project'},
      {label: 'Eyeglass Recycling', href: '/vision'},
    ],
  },
  {
    id: 'involved',
    label: 'Get Involved',
    links: [
      {label: 'Volunteer & Membership', href: '/join'},
      {label: 'Membership FAQ', href: '/join#membership-faq'},
      {
        label: 'Volunteer Flyer',
        href: '/volunteer-flyer.pdf',
        download: true,
      },
    ],
  },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);

  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const desktopButtons = useRef<Record<string, HTMLButtonElement | null>>({});

  function closeAll() {
    setMobileOpen(false);
    setDesktopOpen(null);
    setMobileGroup(null);
  }

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (
        headerRef.current &&
        !headerRef.current.contains(event.target as Node)
      ) {
        closeAll();
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      if (mobileOpen) {
        closeAll();
        toggleRef.current?.focus();
      } else if (desktopOpen) {
        const active = desktopOpen;
        closeAll();
        desktopButtons.current[active]?.focus();
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen, desktopOpen]);

  function menuLink(item: NavigationItem, mobile = false) {
    const contents = (
      <>
        <span>{item.label}</span>
        {mobile && <ArrowRight size={17}/>}
      </>
    );

    if (item.download) {
      return (
        <a
          key={item.href}
          href={item.href}
          download="Port-Allegany-Lions-Volunteer-Flyer.pdf"
          onClick={closeAll}
        >
          {contents}
        </a>
      );
    }

    return (
      <Link key={item.href} href={item.href} onClick={closeAll}>
        {contents}
      </Link>
    );
  }

  return (
    <header
      ref={headerRef}
      className="site-header mobile-ready-header lions-dropdown-header"
    >
      <div className="wrap nav-wrap">
        <Link
          href="/"
          className="brand"
          aria-label="Port Allegany Lions Club homepage"
          onClick={closeAll}
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

        <nav className="desktop-nav lions-desktop-nav" aria-label="Main navigation">
          <Link href="/" onClick={closeAll}>Home</Link>

          {navigationGroups.map(group => (
            <div
              className="lions-nav-group"
              key={group.id}
              onMouseEnter={() => setDesktopOpen(group.id)}
              onMouseLeave={() => setDesktopOpen(current =>
                current === group.id ? null : current
              )}
            >
              <button
                type="button"
                ref={node => { desktopButtons.current[group.id] = node; }}
                className="lions-nav-trigger"
                aria-expanded={desktopOpen === group.id}
                aria-controls={'desktop-submenu-' + group.id}
                onClick={() => setDesktopOpen(current =>
                  current === group.id ? null : group.id
                )}
              >
                {group.label}
                <ChevronDown
                  size={14}
                  aria-hidden="true"
                  className={desktopOpen === group.id ? 'lions-chevron-open' : ''}
                />
              </button>

              <div
                id={'desktop-submenu-' + group.id}
                className="lions-desktop-dropdown"
                hidden={desktopOpen !== group.id}
              >
                {group.links.map(item => menuLink(item))}
              </div>
            </div>
          ))}

          <Link
            className="nav-button"
            href="/contact"
            onClick={closeAll}
          >
            Contact <ArrowUpRight size={15}/>
          </Link>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="mobile-toggle"
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-site-navigation"
          onClick={() => {
            setMobileOpen(value => !value);
            setMobileGroup(null);
            setDesktopOpen(null);
          }}
        >
          {mobileOpen ? <X size={26}/> : <Menu size={26}/>}
        </button>
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="mobile-menu-backdrop"
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={closeAll}
        />
      )}

      <nav
        id="mobile-site-navigation"
        className={
          mobileOpen
            ? 'mobile-nav mobile-nav-open lions-mobile-nav'
            : 'mobile-nav lions-mobile-nav'
        }
        aria-label="Mobile navigation"
        hidden={!mobileOpen}
      >
        <Link href="/" onClick={closeAll} tabIndex={mobileOpen ? 0 : -1}>
          <span>Home</span>
          <ArrowRight size={18}/>
        </Link>

        {navigationGroups.map(group => (
          <div className="lions-mobile-group" key={group.id}>
            <button
              type="button"
              className="lions-mobile-group-trigger"
              aria-expanded={mobileGroup === group.id}
              aria-controls={'mobile-submenu-' + group.id}
              tabIndex={mobileOpen ? 0 : -1}
              onClick={() => setMobileGroup(current =>
                current === group.id ? null : group.id
              )}
            >
              <span>{group.label}</span>
              <ChevronDown
                size={18}
                aria-hidden="true"
                className={mobileGroup === group.id ? 'lions-chevron-open' : ''}
              />
            </button>

            <div
              id={'mobile-submenu-' + group.id}
              className="lions-mobile-submenu"
              hidden={!mobileOpen || mobileGroup !== group.id}
            >
              {group.links.map(item => menuLink(item, true))}
            </div>
          </div>
        ))}

        <Link
          href="/contact"
          onClick={closeAll}
          tabIndex={mobileOpen ? 0 : -1}
        >
          <span>Contact</span>
          <ArrowRight size={18}/>
        </Link>
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
              {/* LIONS FEATURES PHASE 2 V1 */}
              <Link href="/news">News & Updates</Link>
              <Link href="/partners">Community Partners</Link>
              <Link href="/vision">Eyeglass Recycling</Link>
              <a href="/volunteer-flyer.pdf" download="Port-Allegany-Lions-Volunteer-Flyer.pdf">Volunteer Flyer</a>
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
