import { useGridSize } from '@repo/hooks'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { TicketFieldsActionMenu } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsActionMenu'
import { TicketFieldsBlankState } from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketFieldsBlankState'
import {
    TicketFieldsChart,
    TicketFieldsReportConfig,
} from 'domains/reporting/pages/ticket-insights/ticket-fields/TicketInsightsFieldsReportConfig'
import { getSelectedCustomField } from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import useAppSelector from 'hooks/useAppSelector'

export function SupportPerformanceTicketInsights() {
    const getGridCellSize = useGridSize()
    useCleanStatsFilters()
    const selectedCustomField = useAppSelector(getSelectedCustomField)

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
                    <TicketFieldsActionMenu
                        ticketFieldId={selectedCustomField.id}
                    />
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
