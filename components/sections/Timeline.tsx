import Reveal from '../Reveal';

const steps = [
  { n: '01', head: 'RSVP', body: 'You get the rules and the start date before anyone else does.' },
  {
    n: '02',
    head: 'Build',
    body: 'Data, tokenizer, the training run that fails twice, then the wrapper.',
  },
  { n: '03', head: 'Ship', body: 'Repo, a demo anyone can try, and the devlog.' },
  {
    n: '04',
    head: 'Review',
    body: 'A human reads it and asks you questions about your own model.',
  },
  { n: '05', head: 'Unbox', body: 'A Pi 5 and an AI HAT+ land at your door. Move the model over.' },
];

export default function Timeline() {
  return (
    <section className="section" data-stage data-tone="light" id="how">
      <div className="wrap">
        <div className="col col-right scrim" data-anchor="right">
          <Reveal>
            <h2 className="h2">Five steps. One of them takes 35 hours.</h2>
          </Reveal>
          <ol className="steps">
            {steps.map((step, i) => (
              <Reveal as="li" key={step.n} delay={120 + i * 60}>
                <span className="n">{step.n}</span>
                <span>
                  <h3>{step.head}</h3>
                  <p>{step.body}</p>
                </span>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
