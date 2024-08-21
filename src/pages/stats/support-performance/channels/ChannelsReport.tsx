import React from 'react'
import {ChannelsDownloadDataButton} from 'pages/stats/support-performance/channels/ChannelsDownloadDataButton'
import {ChannelsCardExtra} from 'pages/stats/support-performance/channels/ChannelsCardExtra'
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

export function ChannelsReport() {
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage
                title={CHANNELS_REPORT_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters />
                        <ChannelsDownloadDataButton />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <ChartCard
                            title={CHANNEL_PERFORMANCE_TABLE_TITLE}
                            noPadding
                            titleExtra={<ChannelsCardExtra />}
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
