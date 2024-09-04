import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {ResolvedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ResolvedTicketsTrendCard'
import {useGridSize} from 'hooks/useGridSize'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import {ReviewedClosedTicketsTrendCard} from 'pages/stats/support-performance/auto-qa/ReviewedClosedTicketsTrendCard'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import DashboardSection from 'pages/stats/DashboardSection'
import {FeatureFlagKey} from 'config/featureFlags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {FilterKey} from 'models/stat/types'

export const AUTO_QA_PAGE_TITLE = 'Auto QA'

export default function AutoQA() {
    const getGridCellSize = useGridSize()

    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <div className="full-width">
            <StatsPage
                title={AUTO_QA_PAGE_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
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
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 365,
                                        },
                                    },
                                }}
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
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <ReviewedClosedTicketsTrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(6)}>
                        <ResolvedTicketsTrendCard
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
