import React from 'react'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'

export const AUTO_QA_PAGE_TITLE = 'Auto QA'

export default function AutoQA() {
    return (
        <div className="full-width">
            <StatsPage
                title={AUTO_QA_PAGE_TITLE}
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
