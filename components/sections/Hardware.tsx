import Reveal from '../Reveal';

export default function Hardware() {
  return (
    <section className="section" data-stage data-tone="dark" id="hardware">
      <div className="wrap">
        <div className="col col-tight scrim">
          <Reveal>
            <h2 className="h2">26 TOPS, sitting on your desk.</h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="lede">
              Every label on this thing is a constraint. Fitting something good inside them is the
              whole point of Edge.
            </p>
          </Reveal>
        </div>
      </div>
      <p className="note stamp">Exploded view, not to scale</p>
    </section>
  );
}
