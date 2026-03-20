import { ButtonGroupItem, Tooltip, TooltipContent } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

export type SidebarCollapsedItemProps = {
    id: string
    icon: IconName
    label: string
}

export function SidebarCollapsedItem({
    id,
    icon,
    label,
}: SidebarCollapsedItemProps) {
    return (
        <Tooltip
            placement="right"
            trigger={<ButtonGroupItem id={id} icon={icon} />}
        >
            <TooltipContent title={label} />
        </Tooltip>
    )
}
