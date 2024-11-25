import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {AchievedAndBreachedTicketsChart} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'
import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
import {SLAPolicySelect} from 'pages/stats/sla/components/SLAPolicySelect'
import {WithSlaEmptyState} from 'pages/stats/sla/components/WithSlaEmptyState'
import StatsPage from 'pages/stats/StatsPage'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export const SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'SLAs'
export const SERVICE_LEVEL_OPTIONAL_FILTERS = [
    FilterKey.Integrations,
    FilterKey.Channels,
    FilterKey.Agents,
    FilterKey.Tags,
    FilterKey.CustomFields,
]
const OVERVIEW_SECTION_LABEL = 'Overview'

export function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const SLAsOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            SERVICE_LEVEL_OPTIONAL_FILTERS
        )
    return (
        <WithSlaEmptyState>
            <div className="full-width">
                <StatsPage
                    title={SERVICE_LEVEL_AGREEMENT_PAGE_TITLE}
                    titleExtra={
                        <>
                            <SupportPerformanceFilters
                                hidden={isAnalyticsNewFilters}
                            />
                            <DownloadSLAsData hidden={isAnalyticsNewFilters} />
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
                                    persistentFilters={[
                                        FilterKey.Period,
                                        FilterKey.SlaPolicies,
                                        FilterKey.AggregationWindow,
                                    ]}
                                    optionalFilters={SLAsOptionalFilters}
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
                    <DashboardSection
                        title={OVERVIEW_SECTION_LABEL}
                        className="pb-0"
                    >
                        {!isAnalyticsNewFilters && <SLAPolicySelect />}
                    </DashboardSection>
                    <DashboardSection>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <AchievementRateTrendCard
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={getGridCellSize(6)}>
                            <BreachedTicketsRateTrendCard
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                            />
                        </DashboardGridCell>
                        <DashboardGridCell size={12}>
                            <AchievedAndBreachedTicketsChart
                                isAnalyticsNewFilters={isAnalyticsNewFilters}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                    <AnalyticsFooter />
                </StatsPage>
            </div>
        </WithSlaEmptyState>
    )
}
