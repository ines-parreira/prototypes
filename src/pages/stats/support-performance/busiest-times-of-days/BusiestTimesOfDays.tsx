import React from 'react'

import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { FilterComponentKey, FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { BusiestTimesOfDaysDownloadDataButton } from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {
    BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
    BusiestTimesChart,
    BusiestTimesReportConfig,
} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import { getMetricQuery } from 'pages/stats/support-performance/busiest-times-of-days/utils'
import { getSelectedMetric } from 'state/ui/stats/busiestTimesSlice'

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
