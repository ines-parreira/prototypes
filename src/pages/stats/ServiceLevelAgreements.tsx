import React from 'react'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {AchievedAndBreachedTicketsChart} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'

import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import DashboardSection from 'pages/stats/DashboardSection'
import {useGridSize} from 'hooks/useGridSize'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'

const SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'SLAs'

export default function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage
                title={SERVICE_LEVEL_AGREEMENT_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters />
                    </>
                }
            >
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <AchievementRateTrendCard />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <BreachedTicketsRateTrendCard />
                    </DashboardGridCell>
                    <DashboardGridCell size={12}>
                        <AchievedAndBreachedTicketsChart />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
