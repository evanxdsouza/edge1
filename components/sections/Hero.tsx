import Reveal from '../Reveal';
import { RSVP } from '@/lib/links';

export default function Hero() {
  return (
    <section className="section hero" data-stage data-tone="dark" id="top">
      <div className="wrap scrim">
        <Reveal>
          <p className="silk">A Draft Hack Club YSWS</p>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="display">
            Make a model small enough to <em>use on a Raspberry PI</em>.
          </h1>
        </Reveal>
      </div>

      <div />

      <div className="wrap hero-foot">
        <Reveal delay={180}>
          <p className="lede scrim">
            Spend <strong>35+ hours</strong> on your own small language model and its wrapper.
            Ship it, we ship you the hardware.
          </p>
        </Reveal>
        <Reveal delay={260}>
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
