export const TooltipDelay = {
    Default: {
        show: 1000,
        hide: 0,
    },
    Long: {
        show: 1500,
        hide: 0,
    },
} as const

export type TooltipDelayValue = ValueOf<typeof TooltipDelay>
