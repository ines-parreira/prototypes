import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {FeatureFlagKey} from 'config/featureFlags'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import ChartCard from 'pages/stats/ChartCard'
import {AgentsTable} from 'pages/stats/support-performance/agents/AgentsTable'

import AgentsShoutouts from 'pages/stats/support-performance/agents/AgentsShoutouts'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/DownloadAgentsPerformanceDataButton'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'

export default function SupportPerformanceAgents() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const getGridCellSize = useGridSize()

    return (
        <div className="full-width">
            <StatsPage
                title={AGENTS_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <DownloadAgentsPerformanceDataButton />
                    </>
                }
            >
                {isAnalyticsNewFilters && (
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanel
                                persistentFilters={[FilterKey.Period]}
                                optionalFilters={[
                                    FilterKey.Channels,
                                    FilterKey.Integrations,
                                    FilterKey.Tags,
                                    FilterKey.Agents,
                                    FilterKey.CustomFields,
                                ]}
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 365,
                                        },
                                    },
                                }}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
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
