import { ButtonGroupItem, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

type InfobarNavigationItemProps = {
    name: string
    icon: IconName
    tooltip: {
        title: string
        shortcut?: string
    }
}

export function InfobarNavigationItem({
    name,
    icon,
    tooltip,
}: InfobarNavigationItemProps) {
    return (
        <Tooltip key={name} placement="left">
            <ButtonGroupItem id={name} icon={icon} />
            <TooltipContent
                title={tooltip.title ?? ''}
                shortcut={tooltip.shortcut}
            />
        </Tooltip>
    )
}
