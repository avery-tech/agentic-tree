import { useEffect, useRef, useState } from 'react';
import type { AgentNode } from '../model';
export const LIVE_HOLD_MS = 3000;
/** Hold a target briefly, then choose the latest candidate, never an event queue. */
export function focusDelay(entered: number, now: number, hasCurrent: boolean) {
  return hasCurrent ? Math.max(0, entered + LIVE_HOLD_MS - now) : 0;
}
export function useLiveFocus(candidate: AgentNode | undefined, nodes: AgentNode[], following: boolean, frozen: boolean) {
  const [heldId, setHeldId] = useState<string>();
  const entered = useRef(0), latest = useRef(candidate);
  latest.current = candidate;
  useEffect(() => {
    if (!following || frozen) { entered.current = 0; return; }
    if (!candidate || candidate.id === heldId) return;
    const wait = focusDelay(entered.current, performance.now(), nodes.some(n => n.id === heldId));
    const accept = () => { entered.current = performance.now(); setHeldId(latest.current?.id); };
    if (!wait) { accept(); return; }
    const timer = setTimeout(accept, wait);
    return () => clearTimeout(timer);
  }, [candidate?.id, heldId, following, frozen, nodes]);
  return nodes.find(n => n.id === heldId) ?? candidate;
}
/** Renderer-owned pulse: no changes to selection, no clock-tick activity. */
export function useFocusGlow(frame: React.RefObject<HTMLDivElement>, target: AgentNode | undefined, following: boolean, frozen: boolean) {
  const animations = useRef(new Map<string, Animation>());
  useEffect(() => () => { animations.current.forEach(a => a.cancel()); animations.current.clear(); }, [following, frozen]);
  useEffect(() => {
    if (!following || frozen || !target) return;
    const raf = requestAnimationFrame(() => {
      const card = frame.current?.querySelector<HTMLElement>(`[data-agent-id="${CSS.escape(target.id)}"]`);
      if (!card) return;
      animations.current.get(target.id)?.cancel();
      const base = getComputedStyle(card).boxShadow;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const halo = '0 0 0 2px #7854ec66, 0 0 22px 8px #7854ec55, 0 8px 25px #7854ec26';
      const frames = reduced ? [{boxShadow:halo,offset:0},{boxShadow:halo,offset:.99},{boxShadow:base,offset:1}]
        : [{boxShadow:base,offset:0},{boxShadow:halo,offset:.1},{boxShadow:halo,offset:.5},{boxShadow:base,offset:1}];
      const animation = card.animate(frames, {duration:2000,easing:'ease-out'});
      animations.current.set(target.id,animation);
      void animation.finished.then(() => { if (animations.current.get(target.id) === animation) animations.current.delete(target.id); }, () => {});
    });
    return () => cancelAnimationFrame(raf);
  }, [frame, target?.id, target?.lastEvent?.seq, target?.lastEvent?.time, following, frozen]);
}
