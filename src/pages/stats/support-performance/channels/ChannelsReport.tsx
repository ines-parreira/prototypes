import React from 'react'
import {ChannelsHeatmapSwitch} from 'pages/stats/support-performance/channels/ChannelsHeatmapSwitch'
import DashboardSection from 'pages/stats/DashboardSection'
import {useGridSize} from 'hooks/useGridSize'
import {ChannelsTable} from 'pages/stats/support-performance/channels/ChannelsTable'
import ChartCard from 'pages/stats/ChartCard'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'

import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'

export const CHANNELS_REPORT_PAGE_TITLE = 'Channels'
export const CHANNEL_PERFORMANCE_TABLE_TITLE = 'Channel performance'

export default function ChannelsReport() {
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage
                title={CHANNELS_REPORT_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <ChartCard
                            title={CHANNEL_PERFORMANCE_TABLE_TITLE}
                            noPadding
                            titleExtra={<ChannelsHeatmapSwitch />}
                        >
                            <ChannelsTable />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
