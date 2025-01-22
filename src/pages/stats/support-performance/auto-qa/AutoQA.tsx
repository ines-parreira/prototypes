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
import {AutoQADownloadDataButton} from 'pages/stats/support-performance/auto-qa/AutoQADownloadDataButton'
import {
    AUTO_QA_PAGE_TITLE,
    AutoQAChart,
    AutoQAReportConfig,
} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export default function AutoQA() {
    const getGridCellSize = useGridSize()

    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const autoQAOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            AutoQAReportConfig.reportFilters.optional
        )

    const trendCardColumnWidth = 3
    const manualDimensionTrendCardColumnWidth = 3

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
                                persistentFilters={
                                    AutoQAReportConfig.reportFilters.persistent
                                }
                                optionalFilters={autoQAOptionalFilters}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.ReviewedClosedTickets}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.ResolutionCompleteness}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>

                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth
                        )}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.Accuracy}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth
                        )}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.InternalCompliance}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth
                        )}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.Efficiency}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.CommunicationSkills}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(trendCardColumnWidth)}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.LanguageProficiency}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell
                        size={getGridCellSize(
                            manualDimensionTrendCardColumnWidth
                        )}
                    >
                        <CustomReportComponent
                            chart={AutoQAChart.BrandVoice}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <CustomReportComponent
                            chart={AutoQAChart.AgentsTable}
                            config={AutoQAReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
