import { useId } from '@repo/hooks'

import { Button, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { BulkActionButtonProps } from './types'
import { ButtonRenderMode } from './types'

type DeleteButtonProps = BulkActionButtonProps & {
    renderMode?: ButtonRenderMode
    tooltipMessage?: string
}

export const DeleteButton = ({
    onClick,
    isDisabled,
    renderMode = ButtonRenderMode.Visible,
    tooltipMessage,
}: DeleteButtonProps) => {
    const id = useId()
    const buttonId = `delete-button-${id}`

    if (renderMode === ButtonRenderMode.Hidden) {
        return null
    }

    const button = (
        <Button
            as="button"
            intent="destructive"
            size="sm"
            variant="secondary"
            icon="trash-empty"
            onClick={onClick}
            isDisabled={isDisabled}
        >
            Click me
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
