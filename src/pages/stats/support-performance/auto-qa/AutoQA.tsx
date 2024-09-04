import React from 'react'
import {ResolvedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ResolvedTicketsTrendCard'
import {useGridSize} from 'hooks/useGridSize'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import DashboardSection from 'pages/stats/DashboardSection'

export const AUTO_QA_PAGE_TITLE = 'Auto QA'

export default function AutoQA() {
    const getGridCellSize = useGridSize()

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
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <ReviewedClosedTicketsTrendCard />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <ResolvedTicketsTrendCard />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
