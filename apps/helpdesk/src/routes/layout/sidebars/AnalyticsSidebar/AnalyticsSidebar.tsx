import {
    NavigationSection,
    NavigationSectionGroup,
    NavigationSectionItem,
    useSidebar,
} from '@repo/navigation'

import { Icon } from '@gorgias/axiom'

import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { StatsNavbarViewSections } from 'domains/reporting/pages/common/components/StatsNavbarView/constants'
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
                if (section.items) {
                    return (
                        <NavigationSection
                            key={section.id}
                            id={section.id}
                            label={section.label}
                            leadingSlot={section.icon}
                            actionsSlot={section.actionsSlot}
                        >
                            {section.items.map((item) => (
                                <NavigationSectionItem
                                    key={item.id}
                                    to={`${STATS_ROUTE_PREFIX}${item.route}`}
                                    id={item.id}
                                    label={item.label}
                                    trailingSlot={
                                        item.requiresUpgrade ? (
                                            <Icon name="arrow-circle-up" />
                                        ) : (
                                            item.trailingSlot
                                        )
                                    }
                                />
                            ))}
                        </NavigationSection>
                    )
                }

                return null
            })}
        </NavigationSectionGroup>
    )
}
