import Reveal from '../Reveal';

const rules = [
  { key: 'Yours.', body: 'Trained, fine-tuned, or distilled by you.' },
  { key: 'Local.', body: 'It runs on hardware you can unplug from the wall.' },
  { key: 'Wrapped.', body: 'A real interface, not a notebook you demo yourself.' },
  { key: 'Logged.', body: '35+ hours in Hackatime, with commits to match.' },
  { key: 'Public.', body: 'A repo, a demo anyone can try, and a devlog.' },
];

export default function Rules() {
  return (
    <section className="section" data-stage data-tone="light" id="rules">
      <div className="wrap">
        <div className="col scrim">
          <Reveal>
            <p className="silk">What counts as shipped</p>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="h2">Usable. Not a demo video.</h2>
          </Reveal>
          <ul className="creed">
            {rules.map((rule, i) => (
              <Reveal as="li" key={rule.key} delay={140 + i * 70}>
                <b>{rule.key}</b> {rule.body}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={520}>
            <p className="aside">An API call in a trench coat is not a model.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
