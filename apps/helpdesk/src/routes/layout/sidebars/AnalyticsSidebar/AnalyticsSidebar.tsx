import { useSidebar } from '@repo/navigation'

import { Navigation } from 'components/Navigation/Navigation'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { StatsNavSectionItem } from 'domains/reporting/pages/common/components/StatsNavbarView/StatsNavSectionItem'
import { useStatsNavbarSections } from 'domains/reporting/pages/common/components/StatsNavbarView/useStatsNavbarSections'
import { DashboardsNavbarBlock } from 'domains/reporting/pages/dashboards/DashboardsNavbarBlock/DashboardsNavbarBlock'
import { AutomateStatsNavbar } from 'domains/reporting/pages/self-service/AutomateStatsNavbar'
import UpgradeIcon from 'pages/common/components/UpgradeIcon'
import { ConvertStatsNavbar } from 'pages/convert/common/components/ConvertStatsNavbar/ConvertStatsNavbar'
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
                // Render component sections
                switch (section.id) {
                    case 'dashboards':
                        return <DashboardsNavbarBlock key={section.id} />
                    case 'automate':
                        return <AutomateStatsNavbar key={section.id} />
                    case 'convert':
                        return <ConvertStatsNavbar key={section.id} />
                }

                // Render static sections
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
                                {section.label}
                                <Navigation.SectionIndicator />
                            </Navigation.SectionTrigger>
                            <Navigation.SectionContent>
                                {section.items.map((item) => (
                                    <StatsNavSectionItem
                                        key={item.key}
                                        to={`${STATS_ROUTE_PREFIX}${item.route}`}
                                        data-candu-id={item.canduId}
                                        id={item.itemId}
                                    >
                                        {item.label}
                                        {item.requiresUpgrade && (
                                            <UpgradeIcon />
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
