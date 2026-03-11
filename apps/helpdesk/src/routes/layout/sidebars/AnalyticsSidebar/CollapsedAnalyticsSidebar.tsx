import { history } from '@repo/routing'

import { ButtonGroup, ButtonGroupItem, Menu, MenuItem } from '@gorgias/axiom'

import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import type { StatsNavbarSection } from 'routes/layout/products/analytics'
import { useCollapsedSidebarActiveMatch } from 'routes/layout/sidebars/hooks/useCollapsedSidebarActiveMatch'

type Props = {
    sections: StatsNavbarSection[]
}

export const CollapsedAnalyticsSidebar = ({ sections }: Props) => {
    const navigateTo = (route: string) => {
        history.push(`${STATS_ROUTE_PREFIX}${route}`)
    }

    const handleSelectionChange = (id: string) => {
        const sectionOverviewRoute = sections.find(
            (section) => section.id === id,
        )?.items?.[0]?.route

        if (!sectionOverviewRoute) return

        navigateTo(sectionOverviewRoute)
    }

    const activeMatch = useCollapsedSidebarActiveMatch(
        sections,
        (item) => `${STATS_ROUTE_PREFIX}${item.route}`,
    )

    return (
        <ButtonGroup
            orientation="vertical"
            withoutBorder
            onSelectionChange={handleSelectionChange}
            selectedKey={activeMatch?.sectionId}
        >
            {sections.map((section) =>
                section.items?.length === 1 ? (
                    <ButtonGroupItem
                        key={section.id}
                        id={section.id}
                        icon={section.icon}
                    >
                        {section.label}
                    </ButtonGroupItem>
                ) : (
                    <Menu
                        key={section.id}
                        selectedKeys={
                            activeMatch?.sectionId === section.id
                                ? [activeMatch.itemId]
                                : []
                        }
                        selectionMode="single"
                        trigger={
                            <ButtonGroupItem
                                key={section.id}
                                id={section.id}
                                icon={section.icon}
                            >
                                {section.label}
                            </ButtonGroupItem>
                        }
                    >
                        {section.items?.map((item) => (
                            <MenuItem
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                onAction={() => navigateTo(item.route)}
                            />
                        ))}
                    </Menu>
                ),
            )}
        </ButtonGroup>
    )
}
