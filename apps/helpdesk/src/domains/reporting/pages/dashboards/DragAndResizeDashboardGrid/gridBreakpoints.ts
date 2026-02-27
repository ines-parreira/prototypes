// Thresholds are container widths (not viewport). 768px aligns with
// MOBILE_BREAKPOINT in @repo/hooks. drag/resize disabled below this (mobile only).
export const GRID_BREAKPOINTS = {
    lg: 768,
    sm: 0,
} as const

export const GRID_COLS = {
    lg: 12,
    sm: 12,
} as const

export type GridBreakpoint = keyof typeof GRID_BREAKPOINTS
