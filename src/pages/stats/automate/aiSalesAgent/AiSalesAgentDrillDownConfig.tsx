import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'hooks/reporting/useDrillDownData'
import { EnrichmentFields } from 'models/reporting/types'
import { formatTicketDrillDownRowData } from 'pages/stats/common/drill-down/DrillDownFormatters'
import { DomainConfig } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { TicketDrillDownTableContent } from 'pages/stats/common/drill-down/TicketDrillDownTableContent'
import { DrillDownMetric } from 'state/ui/stats/drillDownSlice'

import {
    AiSalesAgentChart,
    AiSalesAgentMetricConfig,
} from './AiSalesAgentMetricsConfig'

const useTicketDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )
export type AiSalesAgentDrillDownMetrics =
    | AiSalesAgentChart.AiSalesAgentTotalSalesConv
    | AiSalesAgentChart.AiSalesAgentSuccessRate

export const AiSalesAgentDrillDownConfig: DomainConfig<AiSalesAgentDrillDownMetrics> =
    {
        drillDownHook: useTicketDrillDownHook,
        tableComponent: TicketDrillDownTableContent,
        infoBarObjectType: 'tickets',
        isMetricDataDownloadable: false,
        modalTriggerTooltipText: 'Click to view tickets',
        metricsConfig: {
            [AiSalesAgentChart.AiSalesAgentTotalSalesConv]:
                AiSalesAgentMetricConfig[
                    AiSalesAgentChart.AiSalesAgentTotalSalesConv
                ],
            [AiSalesAgentChart.AiSalesAgentSuccessRate]:
                AiSalesAgentMetricConfig[
                    AiSalesAgentChart.AiSalesAgentSuccessRate
                ],
        },
    }
