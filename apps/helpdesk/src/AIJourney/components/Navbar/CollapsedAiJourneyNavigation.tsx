import { history } from '@repo/routing'

import { ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

type NavigationItem = {
    icon: string
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
                <ButtonGroupItem key={item.to} id={item.label} icon={item.icon}>
                    {item.label}
                </ButtonGroupItem>
            ))}
        </ButtonGroup>
    )
}
