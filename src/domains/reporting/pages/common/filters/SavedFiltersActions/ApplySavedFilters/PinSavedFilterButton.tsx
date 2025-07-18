import { ComponentProps, MouseEventHandler } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

export interface PinSavedFilterButtonProps
    extends Omit<
        ComponentProps<typeof IconButton>,
        'icon' | 'iconClassName' | 'onClick'
    > {
    savedFilterId: number
    onPin: (savedFilterId: number) => any
    isPinned?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
}

export const PinSavedFilterButton = ({
    savedFilterId,
    isPinned,
    onPin,
    onClick,
    ...props
}: PinSavedFilterButtonProps) => {
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
        onPin(savedFilterId)
        onClick?.(event)
    }

    return (
        <IconButton
            fillStyle="ghost"
            intent="secondary"
            size="small"
            {...props}
            icon="push_pin"
            onClick={handleClick}
            aria-pressed={Boolean(isPinned)}
            data-state={isPinned ? 'on' : 'off'}
            iconClassName={
                isPinned ? 'material-icons-solid' : 'material-icons-outlined'
            }
        />
    )
}
