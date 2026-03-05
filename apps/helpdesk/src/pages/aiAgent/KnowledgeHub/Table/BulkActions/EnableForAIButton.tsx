import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

import type { BulkActionButtonProps } from './types'
import { ButtonRenderMode } from './types'

export const EnableForAIButton = ({
    onClick,
    isDisabled,
    renderMode = ButtonRenderMode.Visible,
    tooltipMessage,
}: BulkActionButtonProps) => {
    if (renderMode === ButtonRenderMode.Hidden) {
        return null
    }

    const button = (
        <Button
            as="button"
            intent="regular"
            leadingSlot="check"
            size="sm"
            variant="secondary"
            isDisabled={isDisabled}
            onClick={onClick}
        >
            Enable for AI Agent
        </Button>
    )

    if (renderMode === ButtonRenderMode.DisabledWithTooltip && tooltipMessage) {
        return (
            <div>
                <Tooltip delay={0}>
                    <TooltipTrigger>{button}</TooltipTrigger>
                    <TooltipContent caption={tooltipMessage} />
                </Tooltip>
            </div>
        )
    }

    return button
}
