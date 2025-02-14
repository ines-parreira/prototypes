import {useFlags} from 'launchdarkly-react-client-sdk'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import {CustomReportComponent} from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'
import {CustomFieldSelect} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {DownloadTicketFieldsDataButton} from 'pages/stats/ticket-insights/ticket-fields/DownloadTicketFieldsDataButton'
import {TicketFieldsBlankState} from 'pages/stats/ticket-insights/ticket-fields/TicketFieldsBlankState'
import {
    TICKET_INSIGHTS_OPTIONAL_FILTERS,
    TicketFieldsChart,
    TicketFieldsReportConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

export function SupportPerformanceTicketInsights() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const supportPerformanceTicketInsightsOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            TICKET_INSIGHTS_OPTIONAL_FILTERS
        )
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const getGridCellSize = useGridSize()

    if (!selectedCustomField.isLoading && selectedCustomField.id === null) {
        return (
            <StatsPage
                title={TicketFieldsReportConfig.reportName}
                titleExtra={null}
            >
                <TicketFieldsBlankState />
            </StatsPage>
        )
    }

    return (
        <StatsPage
            title={TicketFieldsReportConfig.reportName}
            titleExtra={
                selectedCustomField.id ? (
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <DownloadTicketFieldsDataButton
                            selectedCustomFieldId={selectedCustomField.id}
                        />
                    </>
                ) : null
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
                                TicketFieldsReportConfig.reportFilters
                                    .persistent
                            }
                            optionalFilters={
                                supportPerformanceTicketInsightsOptionalFilters
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
            {!isAnalyticsNewFilters && (
                <DashboardSection className="pb-0">
                    <CustomFieldSelect />
                </DashboardSection>
            )}
            {selectedCustomField.id && (
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <CustomReportComponent
                            chart={TicketFieldsChart.TicketDistributionTable}
                            config={TicketFieldsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(8)}>
                        <CustomReportComponent
                            chart={TicketFieldsChart.TicketInsightsFieldTrend}
                            config={TicketFieldsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <CustomReportComponent
                            chart={
                                TicketFieldsChart.CustomFieldsTicketCountBreakdownTableChart
                            }
                            config={TicketFieldsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            <AnalyticsFooter />
        </StatsPage>
    )
}
