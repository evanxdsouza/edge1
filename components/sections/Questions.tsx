import Reveal from '../Reveal';

const qs = [
  {
    q: 'How small is small?',
    a: 'Small enough to run on a Pi. If it needs an H100 to answer a question, it is not Edge.',
  },
  {
    q: 'Do I need to know ML already?',
    a: 'No. Thirty-five hours is enough time to learn it badly and then learn it properly.',
  },
  {
    q: 'Can I fine-tune something that exists?',
    a: 'Yes. Fine-tune, distill, or start from nothing. What matters is that you did the work and can explain every part of it.',
  },
  {
    q: 'Who can do this?',
    a: 'Hack Clubbers, 18 and under, anywhere Hack Club ships hardware. Shipping is the only entry fee.',
  },
  {
    q: 'When does it open?',
    a: 'It is still a draft. RSVP is how you find out first, and how you get a slot when it does.',
  },
  {
    q: 'What if my model is bad?',
    a: 'Most first models are. Ship it anyway, write down why it is bad, and that counts.',
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
