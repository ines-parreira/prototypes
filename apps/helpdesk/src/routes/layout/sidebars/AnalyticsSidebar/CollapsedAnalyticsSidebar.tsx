import { SidebarCollapsedGroup, SidebarCollapsedItem } from '@repo/navigation'
import { history } from '@repo/routing'

import { Icon, Menu, MenuItem } from '@gorgias/axiom'

import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { VideoPreviewTooltip } from 'domains/reporting/pages/self-service/VideoPreviewTooltip'
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
        const section = sections.find((section) => section.id === id)
        const sectionOverviewRoute =
            section?.items?.[0]?.route ?? section?.route

        if (!sectionOverviewRoute) return

        navigateTo(sectionOverviewRoute)
    }

    const activeMatch = useCollapsedSidebarActiveMatch(
        sections,
        (item) => `${STATS_ROUTE_PREFIX}${item.route}`,
        (section) =>
            section.route ? `${STATS_ROUTE_PREFIX}${section.route}` : undefined,
    )

    return (
        <SidebarCollapsedGroup
            onSelectionChange={handleSelectionChange}
            selectedKey={activeMatch?.sectionId}
        >
            {sections.map((section) => {
                if (section.route || section.items?.length === 1) {
                    return (
                        <SidebarCollapsedItem
                            key={section.id}
                            id={section.id}
                            icon={section.icon}
                            label={section.label}
                        />
                    )
                }

                const tooltipProps = section.tooltipProps

                const menu = (
                    <Menu
                        key={section.id}
                        selectedKeys={
                            activeMatch?.sectionId === section.id
                                ? [activeMatch.itemId]
                                : []
                        }
                        selectionMode="single"
                        trigger={
                            <SidebarCollapsedItem
                                id={section.id}
                                icon={section.icon}
                                label={section.label}
                                hideTooltip={!!tooltipProps}
                            />
                        }
                    >
                        {section.items?.map((item) => (
                            <MenuItem
                                key={item.id}
                                id={item.id}
                                label={item.label}
                                onAction={() => navigateTo(item.route)}
                                trailingSlot={
                                    item.requiresUpgrade ? (
                                        <Icon name="arrow-up-circle" />
                                    ) : (
                                        item.trailingSlot
                                    )
                                }
                            />
                        ))}
                    </Menu>
                )

                return tooltipProps ? (
                    <VideoPreviewTooltip key={section.id} {...tooltipProps}>
                        {menu}
                    </VideoPreviewTooltip>
                ) : (
                    menu
                )
            })}
        </SidebarCollapsedGroup>
    )
}
