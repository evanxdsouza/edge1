import Reveal from '../Reveal';

const you = [
  <>
    <b>35+ hours</b>, logged in Hackatime with commits that agree with the clock.
  </>,
  <>
    <b>A small language model</b> you trained, fine-tuned, or distilled yourself.
  </>,
  <>
    <b>A wrapper</b> anyone can open and use. Chat, CLI, or app.
  </>,
];

const us = [
  <>
    <b>Raspberry Pi 5.</b> Four Cortex-A76 cores, and no rented GPU anywhere in sight.
  </>,
  <>
    <b>Raspberry Pi AI HAT+.</b> 26 TOPS of Hailo-8, bolted straight onto the header.
  </>,
];

export default function Trade() {
  return (
    <section className="section" data-stage data-tone="dark" id="trade">
      <div className="wrap">
        <div className="col col-right scrim" data-anchor="right">
          <Reveal>
            <h2 className="h2">You ship the model. We ship the metal.</h2>
          </Reveal>

          <div className="trade">
            <Reveal delay={120}>
              <div className="trade-side">
                <h3>You ship</h3>
                <ul className="list">
                  {you.map((item, i) => (
                    <li key={i}>
                      <span className="pad" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={200}>
              <div className="trade-side" data-give="true">
                <h3>We ship</h3>
                <ul className="list">
                  {us.map((item, i) => (
                    <li key={i}>
                      <span className="pad" data-filled="true" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
