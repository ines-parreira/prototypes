import { SidebarCollapsedItem } from '@repo/navigation'
import { history } from '@repo/routing'

import type { IconName } from '@gorgias/axiom'
import { ButtonGroup } from '@gorgias/axiom'

export type NavigationItem = {
    icon: IconName
    to: string
    label: string
    exact?: boolean
    isActive?: (match: any, location: any) => boolean
}

type Props = {
    navigationItems: NavigationItem[]
}

export const CollapsedAiJourneyNavigation = ({ navigationItems }: Props) => {
    const handleSelectionChange = (id: string) => {
        const navigationItem = navigationItems.find((item) => item.label === id)

        if (!navigationItem) return

        history.push(navigationItem.to)
    }

    return (
        <ButtonGroup
            orientation="vertical"
            withoutBorder
            onSelectionChange={handleSelectionChange}
        >
            {navigationItems.map((item) => (
                <SidebarCollapsedItem
                    key={item.to}
                    id={item.label}
                    icon={item.icon}
                    label={item.label}
                />
            ))}
        </ButtonGroup>
    )
}
