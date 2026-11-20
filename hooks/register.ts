import type { Register, ThemeSetArgs, ThemeStyle } from 'claude-code'

import { makeColors } from './make-colors.js'

// Cyber Security — dark only.
const C = {
  bg: '#0D0D12',
  card: '#1A1A24',
  input: '#232331',
  border: '#2E2E3D',
  text: '#E6E6F0',
  muted: '#9A9AB0',
  accent: '#5CE1E6',
  danger: '#FF3B5C',
  success: '#3DDC84',
  warning: '#FFB020',
} as const

const { theme, problems } = makeColors({
  label: 'Cyber Security',
  only: 'dark',
  roles: { accent: C.accent, danger: C.danger, success: C.success, warning: C.warning, pro: '#9B8CFF' },
  dark: {
    gray: {
      anchors: {
        'surface-0': C.bg,
        'surface-1': C.card,
        'surface-2': C.input,
        'surface-3': C.input,
        'text-primary': C.text,
        'text-secondary': '#C4C4D4',
        'text-muted': C.muted,
      },
      stops: { 750: C.border },
    },
  },
})

// Message colors (the composer keeps the app's own box but takes these surfaces).
const colors = {
  ...theme,
  inputs: {
    ...theme.inputs,
    dark: {
      ...theme.inputs?.dark,
      'bg-user-message': C.input,
      'text-user-message': C.text,
      'bg-assistant-message': C.card,
      'text-assistant-message': C.text,
    },
  },
} as typeof theme

// Claude's reply: a card with radius 7, a 1px border and a red stripe on the left edge.
const CARD = 'M7 0H17A7 7 0 0 1 24 7V17A7 7 0 0 1 17 24H7A7 7 0 0 1 0 17V7A7 7 0 0 1 7 0Z'
const STRIPE = 'M3 1.255A7 7 0 0 0 0 7V17A7 7 0 0 0 3 22.745Z'

const STYLE: ThemeStyle = {
  Text: { color: C.text, fontFamily: ['sans'], fontWeight: 'medium', fontSize: 15, lineHeight: 26 },
  Heading: { color: C.accent, fontFamily: ['sans'], fontWeight: 'bold' },
  UserMessage: {
    backgroundColor: C.input,
    borderColor: C.border,
    borderWidth: 1,
    radius: 8,
    paddingX: 14,
    paddingY: 10,
    shadow: 'none',
  },
  AssistantMessage: {
    backgroundColor: C.card,
    paddingLeft: 18,
    paddingRight: 14,
    paddingY: 12,
    shadow: 'none',
    fill: {
      vector: {
        viewBox: 24,
        slice: 8,
        paths: [
          { d: CARD, color: C.card },
          { d: CARD, color: C.border, strokeWidth: 1 },
          { d: STRIPE, color: C.danger },
        ],
      },
    },
  },
  ToolUse: {
    color: C.muted,
    fontFamily: ['code'],
    backgroundColor: C.card,
    borderColor: C.border,
    borderWidth: 1,
    radius: 6,
    paddingX: 10,
    shadow: 'none',
  },
}

const BASE: ThemeSetArgs = { colors, backdrop: { color: C.bg }, overrideColorScheme: 'dark' }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    let set
    try {
      set = await $.theme.set({ ...BASE, style: STYLE })
    } catch (error) {
      $.ui.log(String(error))
      set = await $.theme.set(BASE)
    }
    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })
}
