import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import ChartCard from 'pages/stats/ChartCard'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {AGENT_PERFORMANCE_SECTION_TITLE} from 'pages/stats/support-performance/agents/AgentsTableChart'
import {AutoQAAgentsCardExtra} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsCardExtra'
import {AutoQAAgentsTable} from 'pages/stats/support-performance/auto-qa/AutoQAAgentsTable'
import {AutoQADownloadDataButton} from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import {CommunicationSkillsTrendCard} from 'pages/stats/support-performance/auto-qa/CommunicationSkillsTrendCard'
import {LanguageProficiencyTrendCard} from 'pages/stats/support-performance/auto-qa/LanguageProficiencyTrendCard'
import {ResolutionCompletenessTrendCard} from 'pages/stats/support-performance/auto-qa/ResolutionCompletenessTrendCard'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export const AUTO_QA_PAGE_TITLE = 'Auto QA'
const AUTO_QA_TITLE_TOOLTIP =
    "An agent receives the ticket's scores if they are the assigned agent at the end of the period"
export const AUTO_QA_OPTIONAL_FILTERS = [
    FilterKey.Integrations,
    FilterKey.Channels,
    FilterKey.Agents,
    FilterKey.Tags,
    FilterKey.CustomFields,
]

export default function AutoQA() {
    const getGridCellSize = useGridSize()

    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const isAutoQaLanguageProficiency =
        !!useFlags()[FeatureFlagKey.AutoQaLanguageProficiency]
    const autoQAOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            AUTO_QA_OPTIONAL_FILTERS
        )

    const trendCardColumnWidth = isAutoQaLanguageProficiency ? 3 : 4

    return (
        <div className="full-width">
            <StatsPage
                title={AUTO_QA_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <AutoQADownloadDataButton />
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
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 365,
                                        },
                                    },
                                }}
                                persistentFilters={[FilterKey.Period]}
                                optionalFilters={autoQAOptionalFilters}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <ReviewedClosedTicketsTrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <ResolutionCompletenessTrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <CommunicationSkillsTrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                    {isAutoQaLanguageProficiency && (
                        <DashboardGridCell
                            size={getGridCellSize(trendCardColumnWidth)}
                        >
                            <LanguageProficiencyTrendCard
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                            />
                        </DashboardGridCell>
                    )}
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <ChartCard
                            title={AGENT_PERFORMANCE_SECTION_TITLE}
                            hint={{title: AUTO_QA_TITLE_TOOLTIP}}
                            titleExtra={<AutoQAAgentsCardExtra />}
                            noPadding
                        >
                            <AutoQAAgentsTable />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
