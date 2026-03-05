import { history } from '@repo/routing'

import { Box, ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

import type { NavigationItem } from 'pages/aiAgent/hooks/useAiAgentNavigation'

type Props = {
    navigationItems: NavigationItem[]
}

export const CollapsedActionDrivenNavigationItems = ({
    navigationItems,
}: Props) => {
    const handleSelectionChange = (id: string) => {
        const navigationItem = navigationItems.find((item) => item.title === id)

        if (!navigationItem) return

        const navigationRoute =
            navigationItem.route || navigationItem.items?.[0]?.route

        if (!navigationRoute) return

        history.push(navigationRoute)
    }

    return (
        <Box w="100%" justifyContent="center">
            <ButtonGroup
                orientation="vertical"
                withoutBorder
                onSelectionChange={handleSelectionChange}
            >
                {navigationItems.map((item) => (
                    <ButtonGroupItem
                        id={item.title}
                        key={item.title}
                        icon={item.icon}
                    >
                        {item.title}
                    </ButtonGroupItem>
                ))}
            </ButtonGroup>
        </Box>
    )
}
