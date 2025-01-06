import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {CustomReportComponent} from 'pages/stats/common/CustomReport/CustomReportComponent'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {BusiestTimesOfDaysDownloadDataButton} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {BusiestTimesOfDaysMetricSelect} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysMetricSelect'
import {
    BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS,
    BusiestTimesChart,
    BusiestTimesReportConfig,
} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesReportConfig'
import {getMetricQuery} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'
import {getSelectedMetric} from 'state/ui/stats/busiestTimesSlice'

export const BusiestTimesOfDays = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const busiestTimeOfDaysOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS
        )
    const getGridCellSize = useGridSize()
    const selectedMetric = useAppSelector(getSelectedMetric)

    return (
        <div className="full-width">
            <StatsPage
                title={BusiestTimesReportConfig.reportName}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <BusiestTimesOfDaysDownloadDataButton
                            useMetricQuery={getMetricQuery(selectedMetric)}
                        />
                    </>
                }
            >
                {isAnalyticsNewFilters && (
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
                                    busiestTimeOfDaysOptionalFilters
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
                )}
                <DashboardSection>
                    {!isAnalyticsNewFilters && (
                        <BusiestTimesOfDaysMetricSelect />
                    )}
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <CustomReportComponent
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
