import React from 'react'

import ChartCard from 'pages/stats/ChartCard'
import {ChannelsCardExtra} from 'pages/stats/support-performance/channels/ChannelsCardExtra'
import {ChannelsTable} from 'pages/stats/support-performance/channels/ChannelsTable'

export const CHANNEL_PERFORMANCE_TABLE_TITLE = 'Channel performance'

export const ChannelsPerformanceTableChart = () => {
    return (
        <ChartCard
            title={CHANNEL_PERFORMANCE_TABLE_TITLE}
            noPadding
            titleExtra={<ChannelsCardExtra />}
        >
            <ChannelsTable />
        </ChartCard>
    )
}
