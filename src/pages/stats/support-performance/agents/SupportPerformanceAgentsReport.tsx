import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {AGENTS_SHOUT_OUTS_TITLE} from 'pages/stats/support-performance/agents/AgentsShoutOut'
import {DownloadAgentsPerformanceDataButton} from 'pages/stats/support-performance/agents/DownloadAgentsPerformanceDataButton'
import {
    AGENTS_OPTIONAL_FILTERS,
    AgentsChart,
    SupportPerformanceAgentsReportConfig,
} from 'pages/stats/support-performance/agents/SupportPerformanceAgentsReportConfig'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export const AGENTS_PAGE_TITLE = 'Agents'

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
                                persistentFilters={
                                    SupportPerformanceAgentsReportConfig
                                        .reportFilters.persistent
                                }
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
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={AgentsChart.TopCSATPerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={AgentsChart.TopFirstResponseTimePerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={AgentsChart.TopResponseTimePerformers}
                            config={SupportPerformanceAgentsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(3)}>
                        <CustomReportComponent
                            chart={AgentsChart.TopClosedTicketsPerformers}
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
