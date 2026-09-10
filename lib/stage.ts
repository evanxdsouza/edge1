export const stage = { value: 0 };
export const anim = { explode: 0, gap: 0 };

type Section = { top: number; height: number };

let sections: Section[] = [];

function measure(nodes: HTMLElement[]) {
  sections = nodes.map((el) => ({ top: el.offsetTop, height: el.offsetHeight }));
}

/** Read from the render loop, so the page carries no scroll listener of its own. */
export function readStage() {
  if (!sections.length) return stage.value;

  const anchor = window.scrollY + window.innerHeight * 0.5;
  let index = sections.length - 1;
  for (let i = 0; i < sections.length; i++) {
    if (anchor < sections[i].top + sections[i].height) {
      index = i;
      break;
    }
  }

  const s = sections[index];
  const fraction = Math.min(1, Math.max(0, (anchor - s.top) / s.height));
  stage.value = index + fraction;
  return stage.value;
}

export function watchSections() {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-stage]'));
  measure(nodes);
  readStage();

  // whichever section owns the viewport centre owns the palette
  const tone = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          document.documentElement.dataset.tone = el.dataset.tone || 'dark';
        }
      }
    },
    { rootMargin: '-50% 0px -50% 0px' }
  );
  nodes.forEach((el) => tone.observe(el));

  const resize = new ResizeObserver(() => measure(nodes));
  resize.observe(document.body);

  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  fonts?.ready.then(() => measure(nodes));

  return () => {
    tone.disconnect();
    resize.disconnect();
  };
}
