import { useSidebar } from '@repo/navigation'

import { Box, Icon } from '@gorgias/axiom'

import { Navigation } from 'components/Navigation/Navigation'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { StatsNavSectionItem } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavSectionItem'
import { useStatsNavbarSections } from 'domains/reporting/pages/common/components/StatsNavbarView/useStatsNavbarSections'
import { useStatsNavbarConfig } from 'routes/layout/products/analytics'
import { CollapsedAnalyticsSidebar } from 'routes/layout/sidebars/AnalyticsSidebar/CollapsedAnalyticsSidebar'

export function AnalyticsSidebar() {
    const { isCollapsed } = useSidebar()
    const { sections } = useStatsNavbarConfig()
    const { sections: sectionsState, handleNavigationStateChange } =
        useStatsNavbarSections()

    if (isCollapsed) {
        return <CollapsedAnalyticsSidebar sections={sections} />
    }

    return (
        <Navigation.Root
            value={sectionsState}
            onValueChange={handleNavigationStateChange}
        >
            {sections.map((section) => {
                if (section.items) {
                    return (
                        <Navigation.Section
                            key={section.id}
                            value={section.id}
                            icon={section.icon}
                        >
                            <Navigation.SectionTrigger
                                data-candu-id={section.sectionCanduId}
                                icon={section.icon}
                            >
                                <Box
                                    alignItems="center"
                                    width="100%"
                                    justifyContent="space-between"
                                    gap="xs"
                                >
                                    {section.label}
                                    {section.actionsSlot}
                                </Box>
                                <Navigation.SectionIndicator />
                            </Navigation.SectionTrigger>

                            <Navigation.SectionContent>
                                {section.items.map((item) => (
                                    <StatsNavSectionItem
                                        key={item.id}
                                        to={`${STATS_ROUTE_PREFIX}${item.route}`}
                                        data-candu-id={item.canduId}
                                        id={item.itemId}
                                    >
                                        {item.label}
                                        {item.trailingSlot}
                                        {item.requiresUpgrade && (
                                            <Icon name="arrow-circle-up" />
                                        )}
                                    </StatsNavSectionItem>
                                ))}
                            </Navigation.SectionContent>
                        </Navigation.Section>
                    )
                }

                return null
            })}
        </Navigation.Root>
    )
}
