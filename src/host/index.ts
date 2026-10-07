import { observerDefinition } from './projection';
export const name = 'layerpx-agent-viewer';
export const inject = ['sessionProjections'];
export function apply(ctx: { sessionProjections: { register: (definition: unknown) => () => void } }) {
  // The Harness registry owns the effect and removes the projection on unload.
  ctx.sessionProjections.register(observerDefinition);
}
