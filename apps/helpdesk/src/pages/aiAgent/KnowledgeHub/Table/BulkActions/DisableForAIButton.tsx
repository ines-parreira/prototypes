import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import type { BulkActionButtonProps } from './types'
import { ButtonRenderMode } from './types'

export const DisableForAIButton = ({
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
            leadingSlot="close"
            size="sm"
            variant="secondary"
            isDisabled={isDisabled}
            onClick={onClick}
        >
            Disable for AI Agent
        </Button>
    )

    if (renderMode === ButtonRenderMode.DisabledWithTooltip && tooltipMessage) {
        return (
            <div>
                <Tooltip delay={0} trigger={button}>
                    <TooltipContent caption={tooltipMessage} />
                </Tooltip>
            </div>
        )
    }

    return button
}
