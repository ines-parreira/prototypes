import React, {useState} from 'react'
import {BusiestTimesOfDaysDownloadDataButton} from 'pages/stats/support-performance/busiest-times-of-days/BusiestTimesOfDaysDownloadDataButton'
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

export const BUSIEST_TIME_OF_DAY_PAGE_TITLE = 'Busiest times of days'
const BUSIEST_TIME_OF_THE_WEEK_SECTION_LABEL = 'Busiest time of the week'
const SECTION_TOOLTIP = 'Tickets created per hour per day of the week'

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
