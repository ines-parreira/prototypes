import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {CustomReportComponent} from 'pages/stats/common/CustomReport/CustomReportComponent'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {AGENTS_SHOUT_OUTS_TITLE} from 'pages/stats/support-performance/agents/AgentsShoutout'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
import {
    AgentsChart,
    SupportPerformanceAgentsReportConfig,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENTS_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
]

export default function SupportPerformanceAgentsReport() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const supportPerformanceAgentsOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            AGENTS_OPTIONAL_FILTERS
        )
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
                <DashboardSection
                    title={AGENTS_SHOUT_OUTS_TITLE}
                    className="pb-0"
                >
                    <DashboardGridCell size={12}>
                        <CustomReportComponent
                            chart={AgentsChart.TopPerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <DashboardSection>
                    <DashboardGridCell size={12}>
                        <CustomReportComponent
                            chart={AgentsChart.Table}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
