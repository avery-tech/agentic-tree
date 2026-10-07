# Viewer roles

The viewer works without role configuration. The selected root is `HQ`; descendants keep stable per-chat identities such as `Agent 3`.

## Recommended format

Place this optional line at the very beginning of the initial assignment sent to a new subagent:

```text
Viewer role: 🚀 Developer

Implement the assigned change. Follow the project's instructions and report the result.
```

The card displays `🚀 Developer`, with `Agent 3` beside its model. The native assignment title stays on a separate line. Reusing a role does not merge agents: two Developers retain different Agent numbers.

The field is a display label. It does not select a preset or model, define permissions, configure tools, or replace the task's actual instructions. Adding it to a preset alone is insufficient unless it is included in the initial assignment's message text. This release does not edit existing presets, prompts or orchestration.

Rules:

- The marker is `Viewer role:` (case-insensitive), on the first nonempty line of the first nonempty text block in the initial own assignment.
- Use one header and a short name (up to 64 UTF-16 code units). Letters, numbers, spaces, underscores, hyphens and emoji are supported. Markup, links, extra punctuation and control characters are rejected.
- Do not wrap the header in a quote or code block when sending an actual assignment. The code block above is only a documentation example.
- No header or unsupported format means `Agent N`, unless the opening-introduction fallback below matches.
- Role recognition runs once per agent's initial own assignment, excluding inherited parent history. Later assignments, notifications and tool results cannot rename it. A later role change is not supported in this version.
- Details shows the extracted role, its source type and source event number. The original task and preset remain accessible separately.

## Existing introductions

A conservative fallback accepts single-token names at the start of `Ты — …`, `Ты - …`, or `You are …` (optionally `a` / `an`), with an optional leading emoji. For example:

```text
Ты — 🚀 senior_solver (Sonnet), исполнитель проекта.
Ты — 🐋 reviewer_core проекта Atlas.
You are a Reviewer. Inspect the assigned changes.
```

After the name, require the end of the line, a comma, period, opening parenthesis, or `проекта` / `project`. Familiar tokens Developer, Reviewer, Architect, Tester, Researcher and Designer may also precede a project name, and the parser keeps the legacy developer alias `DevGuy` recognizable for earlier assignments. Multiword role names should use the explicit header.

This fallback is a text convention, not proof of the agent's duties. It does not search the rest of a prompt for names, parse quoted instructions, call a model, or infer roles from tools. Unrecognized introductions stay `Agent N`.

## Upgrading and future templates

v0.1.5 advances the observer projection state version so native history can rebuild the role for existing sessions, including those whose first execution is outside the bounded recent summary. Number mappings from v0.1.3 remain unchanged. The first cold read may take longer while the native projection replays history.

Future role templates can combine this header with real task instructions. Template selection and custom role editing are not part of v0.1.5.

## v0.2.0 opening aliases

The initial assignment may also begin with `Роль: 🧑‍🚀 navigator проекта Atlas.` or `Role: Developer, implement the task`. These use the same conservative single-token opening-name parser as `Ты —` / `You are`; use `Viewer role:` on its own line for an explicit multiword name. Later messages still cannot rename the role. Native projection version 4 rebuilds existing histories.
