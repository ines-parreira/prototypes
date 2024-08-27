import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {DownloadSLAsData} from 'pages/stats/sla/components/DownloadSLAsData'
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
import {FeatureFlagKey} from 'config/featureFlags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {FilterKey} from 'models/stat/types'

export const SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'SLAs'
const OVERVIEW_SECTION_LABEL = 'Overview'

export default function ServiceLevelAgreements() {
    const getGridCellSize = useGridSize()
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
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
                                <FiltersPanel
                                    persistentFilters={[FilterKey.Period]}
                                    optionalFilters={[
                                        FilterKey.Integrations,
                                        FilterKey.Channels,
                                        FilterKey.Agents,
                                        FilterKey.Tags,
                                    ]}
                                />
                            </DashboardGridCell>
                        </DashboardSection>
                    )}
                    <DashboardSection
                        title={OVERVIEW_SECTION_LABEL}
                        className="pb-0"
                    >
                        <SLAPolicySelect />
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
