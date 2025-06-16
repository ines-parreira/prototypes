import {
    defaultEnrichmentFields,
    extraEnrichmentFieldsPerMetric,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import { EnrichmentFields } from 'models/reporting/types'
import {
    AiSalesAgentChart,
    AiSalesAgentDrillDownMetrics,
    AiSalesAgentMetricsWithDrillDownConfig,
} from 'pages/stats/automate/aiSalesAgent/AiSalesAgentMetricsConfig'
import { formatTicketDrillDownRowData } from 'pages/stats/common/drill-down/DrillDownFormatters'
import { DomainConfig } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'pages/stats/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'pages/stats/common/drill-down/TicketDrillDownTableContent'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'

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
