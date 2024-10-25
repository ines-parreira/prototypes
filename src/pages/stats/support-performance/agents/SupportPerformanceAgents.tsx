import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilter} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilter'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import ChartCard from 'pages/stats/ChartCard'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/DownloadAgentsPerformanceDataButton'
import StatsPage from 'pages/stats/StatsPage'
import {AgentsPerformanceCardExtra} from 'pages/stats/support-performance/agents/AgentsPerformanceCardExtra'
import AgentsShoutouts from 'pages/stats/support-performance/agents/AgentsShoutouts'
import {AgentsTable} from 'pages/stats/support-performance/agents/AgentsTable'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'
export const AGENTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export default function SupportPerformanceAgents() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const supportPerformanceAgentsOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilter(AGENTS_OPTIONAL_FILTERS)
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
                            <FiltersPanelWrapper
                                persistentFilters={[FilterKey.Period]}
                                optionalFilters={
                                    supportPerformanceAgentsOptionalFilters
                                }
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
