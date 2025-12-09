export type BulkActionButtonProps = {
    onClick: () => void
    isDisabled: boolean
    renderMode?: ButtonRenderMode
    tooltipMessage?: string
}

export enum ButtonRenderMode {
    Visible = 'visible',
    DisabledWithTooltip = 'disabled-with-tooltip',
    Hidden = 'hidden',
}

export type TooltipConfig = {
    duplicate: string
    delete: string
    aiAgentOnlyFAQ: string
    aiAgentMixedFAQ: string
}
