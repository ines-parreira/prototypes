import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { ChannelsDownloadDataButton } from 'domains/reporting/pages/support-performance/channels/ChannelsDownloadDataButton'
import {
    CHANNEL_REPORT_OPTIONAL_FILTERS,
    ChannelsChart,
    ChannelsReportConfig,
} from 'domains/reporting/pages/support-performance/channels/ChannelsReportConfig'
import { useGridSize } from 'hooks/useGridSize'

export function ChannelsReport() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()

    return (
        <div className="full-width">
            <StatsPage
                title={ChannelsReportConfig.reportName}
                titleExtra={
                    <>
                        <ChannelsDownloadDataButton />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={[FilterKey.Period]}
                            optionalFilters={CHANNEL_REPORT_OPTIONAL_FILTERS}
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 365,
                                    },
                                },
                            }}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <DashboardComponent
                            chart={ChannelsChart.ChannelsPerformanceTable}
                            config={ChannelsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
