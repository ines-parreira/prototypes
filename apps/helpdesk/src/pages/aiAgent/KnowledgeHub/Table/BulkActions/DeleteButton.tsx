import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

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
            <div>
                <Tooltip delay={0} trigger={button}>
                    <TooltipContent caption={tooltipMessage} />
                </Tooltip>
            </div>
        )
    }

    return button
}
