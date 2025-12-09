import { useId } from '@repo/hooks'

import { Button, Icon, LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { ButtonRenderMode } from './types'

type DuplicateSelectProps = {
    isDisabled?: boolean
    renderMode?: ButtonRenderMode
    tooltipMessage?: string
}

export const DuplicateSelect = ({
    isDisabled,
    renderMode = ButtonRenderMode.Visible,
    tooltipMessage,
}: DuplicateSelectProps) => {
    const id = useId()
    const selectId = `duplicate-select-${id}`

    if (renderMode === ButtonRenderMode.Hidden) {
        return null
    }

    const button = (
        <Button
            as="button"
            size="sm"
            variant="secondary"
            isDisabled={isDisabled}
            trailingSlot={<Icon name="arrow-chevron-down" size="sm" />}
            onClick={() => {
                // Placeholder - no action yet
            }}
        >
            <span>Duplicate</span>
        </Button>
    )

    if (renderMode === ButtonRenderMode.DisabledWithTooltip && tooltipMessage) {
        return (
            <>
                <span id={selectId}>{button}</span>
                <Tooltip target={selectId} placement="top">
                    {tooltipMessage}
                </Tooltip>
            </>
        )
    }

    return button
}
