import { ButtonGroupItem, TooltipContent } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import { NavigationSidebarTooltip } from '../NavigationSidebarTooltip'

export type SidebarCollapsedItemProps = {
    id: string
    icon: IconName
    label: string
    hideTooltip?: boolean
}

export function SidebarCollapsedItem({
    id,
    icon,
    label,
    hideTooltip,
}: SidebarCollapsedItemProps) {
    const button = (
        <ButtonGroupItem id={id} icon={icon}>
            {/* the ButtonGroupItem icon variant with children has a different icon size */}
            {label}
        </ButtonGroupItem>
    )

    if (hideTooltip) return button

    return (
        <NavigationSidebarTooltip placement="right" trigger={button}>
            <TooltipContent title={label} />
        </NavigationSidebarTooltip>
    )
}
