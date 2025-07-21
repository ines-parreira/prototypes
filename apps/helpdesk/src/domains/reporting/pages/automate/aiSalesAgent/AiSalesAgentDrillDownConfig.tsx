import {
    defaultEnrichmentFields,
    extraEnrichmentFieldsPerMetric,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import {
    AiSalesAgentChart,
    AiSalesAgentDrillDownMetrics,
    AiSalesAgentMetricsWithDrillDownConfig,
} from 'domains/reporting/pages/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

const useTicketDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        extraEnrichmentFieldsPerMetric[metricData.metricName] ||
            defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )

export const AiSalesAgentDrillDownConfig: DomainConfig<AiSalesAgentDrillDownMetrics> =
    {
        drillDownHook: useTicketDrillDownHook,
        tableComponent: TicketDrillDownTableContent,
        infoBarObjectType: 'tickets',
        isMetricDataDownloadable: false,
        modalTriggerTooltipText: 'Click to view tickets',
        metricsConfig: {
            [AiSalesAgentChart.AiSalesAgentTotalSalesConv]:
                AiSalesAgentMetricsWithDrillDownConfig[
                    AiSalesAgentChart.AiSalesAgentTotalSalesConv
                ],
            [AiSalesAgentChart.AiSalesAgentSuccessRate]:
                AiSalesAgentMetricsWithDrillDownConfig[
                    AiSalesAgentChart.AiSalesAgentSuccessRate
                ],
            [AiSalesAgentChart.AiSalesDiscountOffered]:
                AiSalesAgentMetricsWithDrillDownConfig[
                    AiSalesAgentChart.AiSalesDiscountOffered
                ],
            [AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders]:
                AiSalesAgentMetricsWithDrillDownConfig[
                    AiSalesAgentChart.AiSalesAgentTotalNumberOfOrders
                ],
            [AiSalesAgentChart.AiSalesAgentTotalProductRecommendations]:
                AiSalesAgentMetricsWithDrillDownConfig[
                    AiSalesAgentChart.AiSalesAgentTotalProductRecommendations
                ],
        },
    }
