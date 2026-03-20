import { useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { getPreviousUrl } from '@repo/routing'

import { Box } from '@gorgias/axiom'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { AnalyticsOverviewReportConfig } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { DashboardExportButton } from 'pages/aiAgent/analyticsOverview/components/DashboardExportButton/DashboardExportButton'
import { DashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardLayoutRenderer'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { STATS_ROUTES } from 'routes/constants'

export const AnalyticsOverviewLayout = () => {
    useCleanStatsFilters()
    const contentRef = useRef<HTMLDivElement>(null)
    const { onAnalyticsReportViewed } = useAiAgentAnalyticsDashboardTracking()

    useEffectOnce(() => {
        const previousUrl = getPreviousUrl()
        const previousReport = previousUrl?.split('/app/')[1] ?? '-'

        onAnalyticsReportViewed({
            reportName: STATS_ROUTES.ANALYTICS_OVERVIEW,
            previousReport,
        })
    })

    return (
        <AnalyticsPage
            ref={contentRef}
            title="Overview"
            titleExtra={
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={useExportAnalyticsOverviewToCSV}
                />
            }
            filtersSlot={
                <Box padding="lg" paddingBottom="0px">
                    <FiltersPanelWrapper
                        persistentFilters={
                            AnalyticsOverviewReportConfig.reportFilters
                                .persistent
                        }
                        withSavedFilters={false}
                        optionalFilters={[]}
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                        }}
                        compact
                    />
                </Box>
            }
        >
            <DashboardLayoutRenderer
                defaultLayoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                reportConfig={AnalyticsOverviewReportConfig}
                dashboardId={ManagedDashboardId.AiAgentOverview}
                tabId={ManagedDashboardsTabId.Overview}
                tabName="Overview"
            />
        </AnalyticsPage>
    )
}
