import Reveal from '../Reveal';

const qs = [
  {
    q: 'How small is small?',
    a: 'An AI that is usable and does 4-5 things well. It doesn\'t have to rival Claude...',
  },
  {
    q: 'Do I need to know ML already?',
    a: 'No. There are guides for you to learn.',
  },
  {
    q: 'Can I fine-tune something that exists?',
    a: 'Yes, but note that time will be deflated for fine tuning. Distillation is allowed with minimal deflation.',
  },
  {
    q: 'Who can do this?',
    a: 'Hack Clubbers, ages 13 - 18.',
  },
  {
    q: 'When does it open?',
    a: 'It is still a draft. RSVP to make it happen.',
  },
  {
    q: 'What if my model is bad?',
    a: 'Doesn\'t Matter, this is a learning process.',
  },
];

export default function Questions() {
  return (
    <section className="section" data-stage data-tone="light" id="questions">
      <div className="wrap">
        <Reveal>
          <h2 className="h2">Reasonable worries.</h2>
        </Reveal>
        <dl className="faq">
          {qs.map((item, i) => (
            <Reveal key={item.q} delay={100 + i * 55}>
              <dt>{item.q}</dt>
              <dd>{item.a}</dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
