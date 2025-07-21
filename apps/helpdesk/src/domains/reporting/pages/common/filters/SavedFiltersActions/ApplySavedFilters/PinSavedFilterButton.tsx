import { ComponentProps, MouseEventHandler } from 'react'

import { IconButton, Tooltip } from '@gorgias/merchant-ui-kit'

export interface PinSavedFilterButtonProps
    extends Omit<
        ComponentProps<typeof IconButton>,
        'icon' | 'iconClassName' | 'onClick'
    > {
    savedFilterId: number
    onPin: (savedFilterId: number) => any
    isPinned?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
    setDisableOuter: (disable: boolean) => void
}

export const REMOVE_AS_DEFAULT_FILTER_TOOLTIP = 'Remove as default filter'
export const SET_AS_DEFAULT_FILTER_TOOLTIP = 'Set as default filter'

export const PinSavedFilterButton = ({
    savedFilterId,
    isPinned,
    onPin,
    onClick,
    setDisableOuter,
    ...props
}: PinSavedFilterButtonProps) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        onPin(savedFilterId)
        onClick?.(event)
    }

    const iconId = `save-filter-pin-${savedFilterId}`

    return (
        <>
            <Tooltip target={iconId} placement="top">
                {isPinned
                    ? REMOVE_AS_DEFAULT_FILTER_TOOLTIP
                    : SET_AS_DEFAULT_FILTER_TOOLTIP}
            </Tooltip>
            <IconButton
                id={iconId}
                fillStyle="ghost"
                intent="secondary"
                size="small"
                {...props}
                onMouseEnter={() => setDisableOuter(true)}
                onMouseLeave={() => setDisableOuter(false)}
                icon="push_pin"
                onClick={handleClick}
                aria-pressed={Boolean(isPinned)}
                data-state={isPinned ? 'on' : 'off'}
                iconClassName={
                    isPinned
                        ? 'material-icons-solid'
                        : 'material-icons-outlined'
                }
            />
        </>
    )
}
