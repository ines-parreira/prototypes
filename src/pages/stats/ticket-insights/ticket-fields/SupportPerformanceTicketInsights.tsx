import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import useAppSelector from 'hooks/useAppSelector'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import { SharedActionsMenu } from 'pages/stats/common/components/SharedActionsMenu/SharedActionsMenu'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { DownloadTicketFieldsDataButton } from 'pages/stats/ticket-insights/ticket-fields/DownloadTicketFieldsDataButton'
import { TicketFieldsBlankState } from 'pages/stats/ticket-insights/ticket-fields/TicketFieldsBlankState'
import {
    TicketFieldsChart,
    TicketFieldsReportConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { useCustomFieldsReportData } from 'services/reporting/ticketFieldsReportingService'
import { getSelectedCustomField } from 'state/ui/stats/ticketInsightsSlice'

export function SupportPerformanceTicketInsights() {
    const featureFlags = useFlags()
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const isReportingExtendFieldAndTagEnabled =
        !!featureFlags[FeatureFlagKey.ReportingExtendFieldAndTag]

    const { download, isLoading } = useCustomFieldsReportData(
        String(selectedCustomField.id),
    )

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
                    isReportingExtendFieldAndTagEnabled ? (
                        <SharedActionsMenu
                            downloadAction={download}
                            isDownloadLoading={isLoading}
                            isTicketFieldsReport
                        />
                    ) : (
                        <DownloadTicketFieldsDataButton
                            selectedCustomFieldId={selectedCustomField.id}
                        />
                    )
                ) : null
            }
        >
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={
                            TicketFieldsReportConfig.reportFilters.persistent
                        }
                        optionalFilters={
                            TicketFieldsReportConfig.reportFilters.optional
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
            {selectedCustomField.id && (
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(4)}>
                        <DashboardComponent
                            chart={TicketFieldsChart.TicketDistributionTable}
                            config={TicketFieldsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(8)}>
                        <DashboardComponent
                            chart={TicketFieldsChart.TicketInsightsFieldTrend}
                            config={TicketFieldsReportConfig}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <DashboardComponent
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
