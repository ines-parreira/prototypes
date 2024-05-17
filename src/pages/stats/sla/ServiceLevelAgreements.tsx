import React from 'react'
import {WithSlaEmptyState} from 'pages/stats/sla/components/WithSlaEmptyState'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {AchievedAndBreachedTicketsChart} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import {SLAPolicySelect} from 'pages/stats/sla/components/SLAPolicySelect'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'

import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import DashboardSection from 'pages/stats/DashboardSection'
import {useGridSize} from 'hooks/useGridSize'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'

export const SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'SLAs'
const OVERVIEW_SECTION_LABEL = 'Overview'

export default function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()

    return (
        <WithSlaEmptyState>
            <div className="full-width">
                <StatsPage
                    title={SERVICE_LEVEL_AGREEMENT_PAGE_TITLE}
                    titleExtra={
                        <>
                            <SupportPerformanceFilters />
                        </>
                    }
                >
                    <DashboardSection
                        title={OVERVIEW_SECTION_LABEL}
                        className="pb-0"
                    >
                        <SLAPolicySelect />
                    </DashboardSection>
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
        </WithSlaEmptyState>
    )
}
