import React, {useState} from 'react'
import {BusiestTimesOfDaysDownloadDataButton} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
import {bHoursLegend} from 'pages/stats/common/components/charts/PerHourPerWeekTableStat/PerHourPerWeekTableStat'
import {BusiestTimesOfDaysHeatmapSwitch} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysHeatmapSwitch'
import {useGridSize} from 'hooks/useGridSize'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import ChartCard from 'pages/stats/ChartCard'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {BusiestTimesOfDaysMetricSelect} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysMetricSelect'
import {BusiestTimesOfDaysTable} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysTable'
import {BusiestTimeOfDaysMetrics} from 'pages/stats/support-performance/busiest-times-of-days/types'
import {getMetricQuery} from 'pages/stats/support-performance/busiest-times-of-days/utils'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import Legend from 'pages/stats/common/components/Legend/Legend'
import css from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDays.less'

export const BUSIEST_TIME_OF_DAY_PAGE_TITLE = 'Busiest times of days'
const BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL = 'Busiest time of the week'
const SECTION_TOOLTIP = 'Tickets created per hour per day of the week'

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
    const getGridCellSize = useGridSize()

    const [selectedMetric, setSelectedMetric] =
        useState<BusiestTimeOfDaysMetrics>(
            BusiestTimeOfDaysMetrics.TicketsCreated
        )
    const [isHeatmapMode, setIsHeatmapMode] = useState(false)

    return (
        <div className="full-width">
            <StatsPage
                title={BUSIEST_TIME_OF_DAY_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters />
                        <BusiestTimesOfDaysDownloadDataButton
                            useMetricQuery={getMetricQuery(selectedMetric)}
                        />
                    </>
                }
            >
                <DashboardSection>
                    <BusiestTimesOfDaysMetricSelect
                        selectedMetric={selectedMetric}
                        setSelectedMetric={setSelectedMetric}
                    />
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <ChartCard
                            noPadding
                            title={BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL}
                            hint={{title: SECTION_TOOLTIP}}
                            titleExtra={
                                <BusiestTimesOfDaysHeatmapSwitch
                                    isHeatmapMode={isHeatmapMode}
                                    setIsHeatmapMode={setIsHeatmapMode}
                                />
                            }
                        >
                            <div className={css.legendWrapper}>
                                <Legend
                                    labels={[
                                        busiestHoursHeatmapLegend,
                                        bHoursLegend,
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
