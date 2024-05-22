import React from 'react'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {AgentsPerformanceCardExtra} from 'pages/stats/AgentsPerformanceCardExtra'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import ChartCard from 'pages/stats/ChartCard'
import {AgentsTable} from 'pages/stats/AgentsTable'

import AgentsShoutouts from 'pages/stats/AgentsShoutouts'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/DownloadAgentsPerformanceDataButton'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'

export default function SupportPerformanceAgents() {
    return (
        <div className="full-width">
            <StatsPage
                title={AGENTS_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters />
                        <DownloadAgentsPerformanceDataButton />
                    </>
                }
            >
                <DashboardSection title="Top performers" className="pb-0">
                    <DashboardGridCell size={12}>
                        <AgentsShoutouts />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell size={12}>
                        <ChartCard
                            title={AGENT_PERFORMANCE_SECTION_TITLE}
                            titleExtra={<AgentsPerformanceCardExtra />}
                            noPadding
                        >
                            <AgentsTable />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
