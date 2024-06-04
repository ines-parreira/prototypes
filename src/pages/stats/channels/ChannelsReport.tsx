import React from 'react'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'

import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'

export const CHANNELS_REPORT_PAGE_TITLE = 'Channels'

export default function ChannelsReport() {
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
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
