import type { Ref } from 'vue';
export function useConfirmedMotion(root: Ref<HTMLElement | undefined>) {
  let dispose = () => {};
  onMounted(() => {
    const el = root.value;
    if (!el) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const animations = new Set<Animation>();
    const frames = new Set<number>();
    const cleanups: (() => void)[] = [];
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const target = entry.target as HTMLElement;
        const animation = target.animate(reduced.matches ? [{opacity:.6},{opacity:1}] : [{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}], { duration: reduced.matches ? 180 : 550, delay: Number(target.style.getPropertyValue('--stagger') || 0)*50, easing: getComputedStyle(el).getPropertyValue('--ease').trim() || 'ease-out', fill: 'backwards' });
        animations.add(animation); animation.onfinish = () => animations.delete(animation);
        reveal.unobserve(target);
      });
    },{threshold:.08});
    el.querySelectorAll('[data-confirmed-reveal]').forEach(target => reveal.observe(target));
    const loops = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('motion-offscreen',!entry.isIntersecting)));
    el.querySelectorAll('[data-motion-loops]').forEach(target => loops.observe(target));
    const sync = () => el.classList.toggle('tab-hidden',document.hidden);
    document.addEventListener('visibilitychange',sync); sync();
    el.querySelectorAll<HTMLElement>('[data-confirmed-spotlight]').forEach(target => {
      let frame = 0;
      let x = 0, y = 0;
      function move(event: PointerEvent) {
        if (reduced.matches || !fine.matches) return;
        x = event.clientX; y = event.clientY;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frames.delete(frame); frame = 0;
          const rect = target.getBoundingClientRect();
          target.style.setProperty('--spot-x',`${x-rect.left}px`); target.style.setProperty('--spot-y',`${y-rect.top}px`);
        }); frames.add(frame);
      }
      target.addEventListener('pointermove',move); cleanups.push(() => target.removeEventListener('pointermove',move));
    });
    const motionChange = () => { if (reduced.matches) animations.forEach(animation => animation.finish()); };
    reduced.addEventListener('change',motionChange);
    dispose = () => { reveal.disconnect(); loops.disconnect(); animations.forEach(animation => animation.cancel()); frames.forEach(cancelAnimationFrame); cleanups.forEach(fn => fn()); document.removeEventListener('visibilitychange',sync); reduced.removeEventListener('change',motionChange); };
  });
  onBeforeUnmount(() => dispose());
}
