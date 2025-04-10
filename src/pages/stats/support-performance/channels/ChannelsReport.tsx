import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/common/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/common/layout/DashboardGridCell'
import DashboardSection from 'pages/stats/common/layout/DashboardSection'
import StatsPage from 'pages/stats/common/layout/StatsPage'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import { ChannelsDownloadDataButton } from 'pages/stats/support-performance/channels/ChannelsDownloadDataButton'
import {
    CHANNEL_REPORT_OPTIONAL_FILTERS,
    ChannelsChart,
    ChannelsReportConfig,
} from 'pages/stats/support-performance/channels/ChannelsReportConfig'

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
