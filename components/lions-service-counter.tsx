
import {serviceStats} from '@/lib/lions-service-stats';
import '../styles/lions-phase-two.css';

export default function LionsServiceCounter() {
  const items = [
    {label:'Volunteer hours', value:serviceStats.hours},
    {label:'Projects completed', value:serviceStats.projects},
    {label:'Volunteers involved', value:serviceStats.volunteers}
  ];

  const hasStats = items.some(item => item.value !== null);

  return <section className="lx-stats" aria-label="Verified Lions service activity">
    <div className="wrap">
      <div className="lx-stats-heading">
        <p className="lx-eyebrow">SERVICE BY THE NUMBERS</p>
        <h2>Every hour makes a difference.</h2>
        <p>We're committed to sharing real results as our projects are documented.</p>
      </div>

      {hasStats ? <>
        <div className="lx-stats-grid">
          {items.filter(item => item.value !== null).map(item =>
            <div className="lx-stat" key={item.label}>
              <strong>{item.value?.toLocaleString()}</strong>
              <span>{item.label}</span>
            </div>
          )}
        </div>
        {serviceStats.verifiedThrough && <p className="lx-verified">Verified through {serviceStats.verifiedThrough}</p>}
      </> : <div className="lx-stats-pending">
        Service statistics will be published as documented projects and volunteer hours are verified.
      </div>}
    </div>
  </section>;
}
