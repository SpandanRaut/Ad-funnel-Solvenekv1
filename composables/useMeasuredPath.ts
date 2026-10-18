/** Shared layout connector. Read layout once per rebuild; scroll only reads the root. */
export function mountMeasuredPath(root: HTMLElement, cardSelector: string, horizontal = false) {
  const svg = root.querySelector<SVGSVGElement>('[data-measured-svg]')!;
  const path = svg.querySelector<SVGPathElement>('[data-process-path]')!;
  const track = svg.querySelector<SVGPathElement>('[data-path-track]')!;
  const dot = svg.querySelector<SVGGElement>('[data-process-dot]')!;
  const nodeGroup = svg.querySelector<SVGGElement>('[data-path-nodes]')!;
  const cards = [...root.querySelectorAll<HTMLElement>(cardSelector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let anchors: { x: number; y: number }[] = [];
  let thresholds: number[] = [];
  let total = 0;
  let frame = 0;
  let dirty = true;
  let alive = true;
  let visible = false;
  let startY = 0;
  let endY = 0;
  function rebuild() {
    // All geometric reads precede SVG/class/style writes. Transformed cards use
    // their final layout boxes, so reveals/hover never drag the connector around.
    const box = root.getBoundingClientRect();
    const svgBox = svg.getBoundingClientRect();
    const scale = box.width / root.offsetWidth;
    const mobile = matchMedia('(max-width: 767px)').matches;
    anchors = cards.map(card => {
      const icon = card.querySelector<SVGSVGElement>('[data-anchor-icon], :scope > svg');
      const x = card.offsetLeft + (mobile && icon ? (icon.getBoundingClientRect().left - card.getBoundingClientRect().left + icon.getBoundingClientRect().width / 2) / scale : card.offsetWidth / 2);
      const y = card.offsetTop + (mobile && icon ? (icon.getBoundingClientRect().top - card.getBoundingClientRect().top) / scale + icon.getBoundingClientRect().height / scale / 2 : card.offsetHeight / 2);
      return { x: (box.left - svgBox.left) / scale + x, y: (box.top - svgBox.top) / scale + y };
    });
    if (!anchors.length) return;
    if (mobile) anchors.forEach(point => { point.x = anchors[0]!.x; });
    startY = anchors[0]!.y;
    endY = anchors.at(-1)!.y;
    let d = `M${anchors[0]!.x} ${anchors[0]!.y}`;
    for (let i = 1; i < anchors.length; i++) {
      const a = anchors[i - 1]!, b = anchors[i]!;
      if (mobile) d += ` L${b.x} ${b.y}`;
      else {
        const middle = (a.x + b.x) / 2;
        d += ` C${middle} ${a.y} ${middle} ${b.y} ${b.x} ${b.y}`;
      }
    }
    svg.setAttribute('viewBox', `0 0 ${root.offsetWidth} ${root.offsetHeight}`);
    path.setAttribute('d', d); track.setAttribute('d', d);
    total = path.getTotalLength();
    // Sample the measured curve, then refine nearest distance to each anchor.
    // All SVG geometry reads are batched without interleaved path mutations.
    const nearest = anchors.map(() => ({ length: 0, distance: Infinity }));
    for (let sample = 0; sample <= 256; sample++) {
      const length = total * sample / 256;
      const point = path.getPointAtLength(length);
      anchors.forEach((anchor,index) => {
        const distance = (point.x-anchor.x)**2 + (point.y-anchor.y)**2;
        if (distance < nearest[index]!.distance) nearest[index] = {length,distance};
      });
    }
    thresholds = nearest.map(({ length }, index) => {
      let low = Math.max(0, length - total / 256), high = Math.min(total, length + total / 256);
      const target = anchors[index]!;
      const distance = (at: number) => { const p = path.getPointAtLength(at); return (p.x-target.x)**2 + (p.y-target.y)**2; };
      for (let n=0;n<24;n++) { const a=low+(high-low)/3,b=high-(high-low)/3; if(distance(a)<distance(b)) high=b; else low=a; }
      return index === 0 ? 0 : index === anchors.length-1 ? total : (low+high)/2;
    });
    nodeGroup.replaceChildren(...anchors.map(point => {
      const node = document.createElementNS('http://www.w3.org/2000/svg','circle');
      node.setAttribute('cx',String(point.x)); node.setAttribute('cy',String(point.y)); node.setAttribute('r','4');
      return node;
    }));
    path.style.strokeDasharray = `${total} ${total}`;
    root.dataset.pathLength = String(total);
    cards.forEach((card,index) => { card.dataset.pathThreshold = String(thresholds[index]! / total); });
  }
  function update() {
    frame = 0;
    if (!alive) return;
    if (dirty) { dirty = false; rebuild(); }
    if (!total) return;
    const box = root.getBoundingClientRect();
    const horizontalDesktop = horizontal && innerWidth >= 768;
    const travel = horizontalDesktop ? box.height + innerHeight * .3 : endY-startY;
    const progress = reduced.matches ? 1 : Math.max(0,Math.min(1,(innerHeight * .75-box.top-(horizontalDesktop ? 0 : startY))/Math.max(1,travel)));
    const length = progress * total;
    const point = path.getPointAtLength(length);
    path.style.strokeDashoffset = String(total-length);
    dot.setAttribute('transform',`translate(${point.x} ${point.y})`);
    dot.classList.toggle('at-rest',progress === 1);
    dot.style.opacity = reduced.matches ? '0' : '1';
    cards.forEach((card,index) => {
      const lit = length + .1 >= thresholds[index]!;
      card.classList.toggle('is-lit',lit);
      nodeGroup.children[index]?.classList.toggle('is-lit',lit);
    });
  }
  function schedule() { if (!frame && alive) frame = requestAnimationFrame(update); }
  function resize() { dirty = true; schedule(); }
  function scroll() { if (visible) schedule(); }
  const observer = new ResizeObserver(resize);
  [root,...cards].forEach(card => observer.observe(card));
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry!.isIntersecting;
    root.classList.toggle('path-paused',!visible);
    if (visible) schedule();
  });
  visibility.observe(root);
  window.addEventListener('scroll',scroll,{passive:true});
  window.addEventListener('resize',resize,{passive:true});
  reduced.addEventListener('change',schedule);
  document.fonts.ready.then(() => { if (alive) resize(); });
  schedule();
  return () => {
    alive = false; cancelAnimationFrame(frame); observer.disconnect(); visibility.disconnect();
    window.removeEventListener('scroll',scroll); window.removeEventListener('resize',resize); reduced.removeEventListener('change',schedule);
  };
}
