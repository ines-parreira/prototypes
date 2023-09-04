import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {HeatmapSwitch} from 'pages/stats/HeatmapSwitch'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import ChartCard from 'pages/stats/ChartCard'
import {AgentsTable} from 'pages/stats/AgentsTable'

import {FeatureFlagKey} from 'config/featureFlags'

import DashboardSection from './DashboardSection'
import StatsPage from './StatsPage'
import {DownloadAgentsPerformanceDataButton} from './DownloadAgentsPerformanceDataButton'
import AgentsShoutouts from './AgentsShoutoutsGrid'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'

export default function SupportPerformanceAgents() {
    const hasExportAgentsPerformance: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsExportAgentsPerformance]
    const hasShoutoutsEnabled: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewAgentPerformanceShoutouts]
    const hasAgentsPerformanceHeatmaps: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewAgentPerformanceHeatmaps]

    return (
        <div className="full-width">
            <StatsPage
                title={AGENTS_PAGE_TITLE}
                filters={
                    <>
                        <SupportPerformanceFilters />
                        {hasExportAgentsPerformance && (
                            <DownloadAgentsPerformanceDataButton />
                        )}
                    </>
                }
            >
                {hasShoutoutsEnabled && (
                    <DashboardSection title="Top performers" className="pb-0">
                        <DashboardGridCell size={12}>
                            <AgentsShoutouts />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <DashboardSection>
                    <DashboardGridCell size={12}>
                        <ChartCard
                            title={AGENT_PERFORMANCE_SECTION_TITLE}
                            titleExtra={
                                hasAgentsPerformanceHeatmaps && (
                                    <HeatmapSwitch />
                                )
                            }
                            noPadding
                        >
                            <AgentsTable />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
        </div>
    )
}
