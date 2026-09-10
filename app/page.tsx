import Stage from '@/components/scene/Stage';
import Hero from '@/components/sections/Hero';
import Trade from '@/components/sections/Trade';
import Hardware from '@/components/sections/Hardware';
import Rules from '@/components/sections/Rules';
import Timeline from '@/components/sections/Timeline';
import Questions from '@/components/sections/Questions';
import Rsvp from '@/components/sections/Rsvp';
import { RSVP } from '@/lib/links';

export default function Page() {
  return (
    <>
      <Stage />
      <div className="grain" aria-hidden />

      <nav className="nav">
        <a className="mark" href="#top">
          Edge
          <span aria-hidden />
        </a>
        <a className="nav-link" href={RSVP} target="_blank" rel="noreferrer">
          RSVP
        </a>
      </nav>

      <main>
        <Hero />
        <Trade />
        <Hardware />
        <Rules />
        <Timeline />
        <Questions />
        <Rsvp />
      </main>

      <footer className="foot">
        <p className="silk">A draft YSWS · Hack Club</p>
        <a className="silk" href={RSVP} target="_blank" rel="noreferrer">
          RSVP for Edge
        </a>
      </footer>
    </>
  );
}
