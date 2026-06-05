import { useRef } from 'react'

import { DashboardExportButton, DashboardLayoutRenderer } from '@repo/reporting'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT } from 'domains/reporting/pages/performance/overview/config/defaultLayoutConfig'
import {
    PERFORMANCE_OVERVIEW_DASHBOARD_ID,
    PERFORMANCE_OVERVIEW_TAB_NAME,
    PerformanceOverviewTabs,
} from 'domains/reporting/pages/performance/overview/constants'
import { useExportPerformanceOverviewToCSV } from 'domains/reporting/pages/performance/overview/hooks/useExportPerformanceOverviewToCSV'
import { PerformanceOverviewReportConfig } from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'

export const PerformanceOverviewReport = () => {
    useCleanStatsFilters()
    const contentRef = useRef<HTMLDivElement>(null)

    return (
        <AnalyticsPage
            ref={contentRef}
            title="Performance"
            titleExtra={
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={useExportPerformanceOverviewToCSV}
                />
            }
            filtersSlot={
                <FiltersPanelWrapper
                    persistentFilters={
                        PerformanceOverviewReportConfig.reportFilters.persistent
                    }
                    optionalFilters={
                        PerformanceOverviewReportConfig.reportFilters.optional
                    }
                    filterSettingsOverrides={{
                        [FilterKey.Period]: {
                            initialSettings: {
                                maxSpan: 365,
                            },
                        },
                    }}
                    compact
                />
            }
        >
            <DashboardLayoutRenderer
                defaultLayoutConfig={DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT}
                reportConfig={PerformanceOverviewReportConfig}
                dashboardId={PERFORMANCE_OVERVIEW_DASHBOARD_ID}
                tabId={PerformanceOverviewTabs.Overview}
                tabName={PERFORMANCE_OVERVIEW_TAB_NAME}
                DashboardComponent={DashboardComponent}
                enableCustomDashboards
                enableTablesPersistence
            />
        </AnalyticsPage>
    )
}
