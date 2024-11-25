import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useState} from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import ChartCard from 'pages/stats/ChartCard'
import Legend from 'pages/stats/common/components/Legend/Legend'
import {TableHeatmapSwitch} from 'pages/stats/common/components/Table/TableHeatmapSwitch'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import css from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays.less'
import {BusiestTimesOfDaysDownloadDataButton} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {BusiestTimesOfDaysMetricSelect} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysMetricSelect'
import {BusiestTimesOfDaysTable} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {
    businessHoursLegend,
    getMetricQuery,
} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'
import {getSelectedMetric} from 'state/ui/stats/busiestTimesSlice'

export const BUSIEST_TIME_OF_DAY_PAGE_TITLE = 'Busiest times'
export const BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]
const BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL = 'Busiest times of the week'
const TICKETS_CREATED_TOOLTIP = 'Tickets created per hour per day of the week'
const TICKETS_CLOSED_TOOLTIP = 'Tickets closed per hour per day of the week'
const TICKETS_REPLIED_TOOLTIP = 'Tickets replied per hour per day of the week'
const MESSAGES_SENT_TOOLTIP = 'Messages sent per hour per day of the week'

const SectionTooltips: Record<BusiestTimeOfDaysMetrics, string> = {
    [BusiestTimeOfDaysMetrics.MessagesSent]: MESSAGES_SENT_TOOLTIP,
    [BusiestTimeOfDaysMetrics.TicketsCreated]: TICKETS_CREATED_TOOLTIP,
    [BusiestTimeOfDaysMetrics.TicketsClosed]: TICKETS_CLOSED_TOOLTIP,
    [BusiestTimeOfDaysMetrics.TicketsReplied]: TICKETS_REPLIED_TOOLTIP,
}

const busiestHoursHeatmapLegend = {
    aheadLabel: 'Least busy',
    name: 'Busiest',
    background:
        'linear-gradient(90deg,' +
        'var(--analytics-heatmap-0)' +
        ' 25%, ' +
        'var(--analytics-heatmap-2)' +
        ' 25%, ' +
        'var(--analytics-heatmap-2)' +
        ' 50%, ' +
        'var(--analytics-heatmap-4)' +
        ' 50%, ' +
        'var(--analytics-heatmap-4)' +
        ' 75%, ' +
        'var(--analytics-heatmap-6)' +
        ' 75%, ' +
        'var(--analytics-heatmap-6)' +
        ' 100%)',
    shape: 'rectangle' as const,
}
export const BusiestTimesOfDays = () => {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const busiestTimeOfDaysOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            BUSIEST_TIME_OF_DAY_OPTIONAL_FILTERS
        )
    const getGridCellSize = useGridSize()

    const selectedMetric = useAppSelector(getSelectedMetric)
    const [isHeatmapMode, setIsHeatmapMode] = useState(true)
    const toggleHandler = () => setIsHeatmapMode(!isHeatmapMode)

    return (
        <div className="full-width">
            <StatsPage
                title={BUSIEST_TIME_OF_DAY_PAGE_TITLE}
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
                        <ChartCard
                            noPadding
                            title={BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL}
                            hint={{title: SectionTooltips[selectedMetric]}}
                            titleExtra={
                                <TableHeatmapSwitch
                                    isHeatmapMode={isHeatmapMode}
                                    toggleHandler={toggleHandler}
                                />
                            }
                        >
                            <div className={css.legendWrapper}>
                                <Legend
                                    labels={[
                                        busiestHoursHeatmapLegend,
                                        businessHoursLegend,
                                    ]}
                                />
                            </div>

                            <BusiestTimesOfDaysTable
                                metricName={selectedMetric}
                                useMetricQuery={getMetricQuery(selectedMetric)}
                                isHeatmapMode={isHeatmapMode}
                            />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
