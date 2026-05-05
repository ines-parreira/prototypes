import { ButtonGroupItem, TooltipContent } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { NavigationSidebarTooltip } from '../NavigationSidebarTooltip'

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
        <NavigationSidebarTooltip
            placement="right"
            trigger={
                <ButtonGroupItem id={id} icon={icon}>
                    {/* the ButtonGroupItem icon variant with children has a different icon size */}
                    {label}
                </ButtonGroupItem>
            }
        >
            <TooltipContent title={label} />
        </NavigationSidebarTooltip>
    )
}
