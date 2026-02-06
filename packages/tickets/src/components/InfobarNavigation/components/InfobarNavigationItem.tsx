import {
    Icon,
    LegacyIconButton as IconButton,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import css from '../TicketInfobarNavigation.less'

type InfobarNavigationItemProps = {
    name: string
    icon: IconName
    onClick: () => void
    tooltip: {
        title: string
        shortcut?: string
    }
    isActive?: boolean
}

export function InfobarNavigationItem({
    name,
    icon,
    onClick,
    tooltip,
    isActive,
}: InfobarNavigationItemProps) {
    return (
        <Tooltip key={name} placement="left">
            <TooltipTrigger>
                <IconButton
                    className={isActive ? css.isActive : undefined}
                    fillStyle="ghost"
                    icon={<Icon name={icon} size="md" />}
                    intent="secondary"
                    onClick={onClick}
                />
            </TooltipTrigger>
            <TooltipContent
                title={tooltip.title ?? ''}
                shortcut={tooltip.shortcut}
            />
        </Tooltip>
    )
}
