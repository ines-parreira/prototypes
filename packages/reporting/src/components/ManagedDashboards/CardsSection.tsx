import { Box } from '@gorgias/axiom'

import type { MetricConfigItem } from '../ConfigureMetricsModal'
import { ShowMoreList } from '../ShowMoreList/ShowMoreList'
import { MetricsConfigurator } from './MetricsConfigurator'
import type {
    DashboardComponentType,
    DashboardLayoutConfig,
    LayoutReportConfig,
    LayoutSection,
} from './types'

type CardsSectionProps<TChart extends string> = {
    section: LayoutSection<TChart>
    reportConfig: LayoutReportConfig<TChart>
    dashboardId: string
    layoutConfig: DashboardLayoutConfig<TChart>
    tabId: string
    tabName: string
    DashboardComponent: DashboardComponentType<TChart>
    enableTrendCards?: boolean
    enableCustomDashboards?: boolean
}

export function CardsSection<TChart extends string>({
    section,
    reportConfig,
    dashboardId,
    layoutConfig,
    tabId,
    tabName,
    DashboardComponent,
    enableTrendCards = false,
    enableCustomDashboards = false,
}: CardsSectionProps<TChart>) {
    const visibleItems = section.items.filter(
        (item) =>
            item.visibility && (!item.requiresFeatureFlag || enableTrendCards),
    )

    const keyKpisConfig: MetricConfigItem[] = section.items.map((item) => ({
        id: item.chartId,
        label: reportConfig.charts[item.chartId].label,
        visibility: item.visibility,
    }))

    return enableTrendCards ? (
        <Box display="flex" flexDirection="column" gap="xs">
            <MetricsConfigurator
                metrics={keyKpisConfig}
                dashboardId={dashboardId}
                currentLayoutConfig={layoutConfig}
                tabId={tabId}
                tabName={tabName}
            />
            <ShowMoreList key={tabId}>
                {visibleItems.map((item) => (
                    <Box
                        key={`${tabId}-${item.chartId}`}
                        flex="1 1 calc(25% - 16px)"
                        minWidth="240px"
                        display="block"
                    >
                        <DashboardComponent
                            chart={item.chartId}
                            config={reportConfig}
                            withChartMenu={enableCustomDashboards}
                        />
                    </Box>
                ))}
            </ShowMoreList>
        </Box>
    ) : (
        <Box display="flex" flexWrap="wrap" gap="md" width="100%">
            {visibleItems.map((item) => (
                <Box
                    key={`${tabId}-${item.chartId}`}
                    flex="1 1 calc(25% - 16px)"
                    minWidth="240px"
                >
                    <DashboardComponent
                        chart={item.chartId}
                        config={reportConfig}
                        withChartMenu={enableCustomDashboards}
                    />
                </Box>
            ))}
        </Box>
    )
}
