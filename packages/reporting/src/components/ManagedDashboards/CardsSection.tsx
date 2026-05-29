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
    enableCustomDashboards = false,
}: CardsSectionProps<TChart>) {
    const visibleItems = section.items.filter((item) => item.visibility)

    const keyKpisConfig: MetricConfigItem[] = section.items.map((item) => ({
        id: item.chartId,
        label: reportConfig.charts[item.chartId].label,
        visibility: item.visibility,
    }))

    return (
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
                        maxWidth="calc(25% - 16px)"
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
    )
}
