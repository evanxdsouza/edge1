import Reveal from '../Reveal';
import { RSVP } from '@/lib/links';

export default function Signup() {
  return (
    <section className="section rsvp" data-stage data-tone="rasp" id="rsvp">
      <div className="wrap">
        <Reveal>
          <p className="silk">Draft - RSVP to make it happen</p>
        </Reveal>
        <Reveal delay={80}>
          <h2 className="display">Ship something small.</h2>
        </Reveal>
        <Reveal delay={160}>
          <p className="lede">
            Edge has not opened yet. RSVP to show interest and get it sponsored.
          </p>
        </Reveal>
        <Reveal delay={240}>
          <a className="cta" href={RSVP} target="_blank" rel="noreferrer">
            RSVP for Edge
            <span className="cta-arrow" aria-hidden>
              →
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
