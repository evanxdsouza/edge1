'use client';

import { useEffect, useRef } from 'react';

export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  delay?: number;
  as?: 'div' | 'li' | 'p' | 'span';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('in');
          observer.disconnect();
        }
      },
      // no bottom inset: the initial translateY would otherwise push an element
      // that sits low in the viewport out of its own observation area, and it
      // would never reveal
      { rootMargin: '0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement & HTMLLIElement & HTMLParagraphElement>}
      className="reveal"
      style={{ '--d': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
