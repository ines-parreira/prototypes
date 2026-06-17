import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'

import { Icon } from '@gorgias/axiom'

import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
import { VideoPreviewTooltip } from 'domains/reporting/pages/self-service/VideoPreviewTooltip'
import { useStatsNavbarConfig } from 'routes/layout/products/analytics'
import { CollapsedAnalyticsSidebar } from 'routes/layout/sidebars/AnalyticsSidebar/CollapsedAnalyticsSidebar'

const ANALYTICS_STORAGE_KEY = 'analytics'

export function AnalyticsSidebar() {
    const { isCollapsed } = useSidebar()
    const { sections } = useStatsNavbarConfig()

    if (isCollapsed) {
        return <CollapsedAnalyticsSidebar sections={sections} />
    }

    return (
        <NavigationSectionGroup
            storageKey={ANALYTICS_STORAGE_KEY}
            defaultExpandedKeys={Object.values(StatsNavbarViewSections)}
        >
            {sections.map((section) => {
                // A `route` makes the section a standalone link and takes
                // precedence over `items`. Sections today are either
                // route-only or items-only; if one ever has both, the
                // collapsed sidebar's active-match prefers items, so revisit
                // both call sites before relying on the combined shape.
                if (section.route) {
                    return (
                        <NavigationSection
                            key={section.id}
                            id={section.id}
                            to={`${STATS_ROUTE_PREFIX}${section.route}`}
                            label={section.label}
                            leadingSlot={section.icon}
                        />
                    )
                }

                if (section.items) {
                    return (
                        <NavigationSection
                            key={section.id}
                            id={section.id}
                            label={section.label}
                            leadingSlot={section.icon}
                            actionsSlot={section.actionsSlot}
                        >
                            {section.items.map((item) => {
                                const navItem = (
                                    <NavigationSectionItem
                                        key={item.id}
                                        to={`${STATS_ROUTE_PREFIX}${item.route}`}
                                        id={item.id}
                                        label={item.label}
                                        trailingSlot={
                                            item.requiresUpgrade ? (
                                                <Icon name="arrow-up-circle" />
                                            ) : (
                                                item.trailingSlot
                                            )
                                        }
                                    />
                                )

                                if (item.tooltipProps) {
                                    return (
                                        <VideoPreviewTooltip
                                            key={item.id}
                                            {...item.tooltipProps}
                                        >
                                            {navItem}
                                        </VideoPreviewTooltip>
                                    )
                                }

                                return navItem
                            })}
                        </NavigationSection>
                    )
                }

                return null
            })}
        </NavigationSectionGroup>
    )
}
