import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import {
    FilterComponentKey,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { BusiestTimesOfDaysDownloadDataButton } from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {
    BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
    BusiestTimesChart,
    BusiestTimesReportConfig,
} from 'domains/reporting/pages/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import { getMetricQuery } from 'domains/reporting/pages/support-performance/busiest-times-of-days/utils'
import { getSelectedMetric } from 'domains/reporting/state/ui/stats/busiestTimesSlice'
import useAppSelector from 'hooks/useAppSelector'

export const BusiestTimesOfDays = () => {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()
    const selectedMetric = useAppSelector(getSelectedMetric)

    return (
        <div className="full-width">
            <StatsPage
                title={BusiestTimesReportConfig.reportName}
                titleExtra={
                    <>
                        <BusiestTimesOfDaysDownloadDataButton
                            useMetricQuery={getMetricQuery(selectedMetric)}
                        />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanelWrapper
                            persistentFilters={[
                                FilterKey.Period,
                                FilterComponentKey.BusiestTimesMetricSelectFilter,
                            ]}
                            optionalFilters={
                                BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS
                            }
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
                            chart={BusiestTimesChart.BusiestTimesTable}
                            config={BusiestTimesReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
