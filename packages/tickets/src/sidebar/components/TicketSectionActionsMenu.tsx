import type { IconName } from '@gorgias/axiom'
import { Button, Menu, MenuItem, Tooltip, TooltipContent } from '@gorgias/axiom'

type Action = {
    label: string
    onClick: () => void
}

type Props = {
    actions: Action[]
    isDisabled?: boolean
    tooltip?: string
    triggerIcon: IconName
}

export function TicketSectionActionsMenu({
    actions,
    isDisabled,
    tooltip,
    triggerIcon,
}: Props) {
    return (
        <Menu
            trigger={
                <Tooltip
                    placement="bottom right"
                    isDisabled={!tooltip}
                    trigger={
                        <Button
                            icon={triggerIcon}
                            variant="tertiary"
                            size="sm"
                            isDisabled={isDisabled}
                        />
                    }
                >
                    <TooltipContent>{tooltip}</TooltipContent>
                </Tooltip>
            }
        >
            {actions.map((action) => (
                <MenuItem
                    id={action.label}
                    key={action.label}
                    label={action.label}
                    onAction={action.onClick}
                />
            ))}
        </Menu>
    )
}
