import { useId } from '@repo/hooks'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { BulkActionButtonProps } from './types'
import { ButtonRenderMode } from './types'

export const EnableForAIButton = ({
    onClick,
    isDisabled,
    renderMode = ButtonRenderMode.Visible,
    tooltipMessage,
}: BulkActionButtonProps) => {
    const id = useId()
    const buttonId = `enable-ai-button-${id}`

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
            <>
                <span id={buttonId}>{button}</span>
                <Tooltip target={buttonId} placement="top">
                    {tooltipMessage}
                </Tooltip>
            </>
        )
    }

    return button
}
