import {
    AIJourneyMetric,
    AIJourneyMetricsConfig,
} from 'AIJourney/types/AIJourneyTypes'
import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { LegacyTicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/LegacyTicketDrillDownTableContent'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

export const getEnrichmentFields = (metricName: string) => {
    switch (metricName) {
        case AIJourneyMetric.TotalOrders:
            return [
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
                EnrichmentFields.CustomerIntegrationDataByExternalId,
            ]
        case AIJourneyMetric.ResponseRate:
        case AIJourneyMetric.ClickThroughRate:
        case AIJourneyMetric.OptOutRate:
        case AIJourneyMetric.DiscountCodesGenerated:
            return [...defaultEnrichmentFields, EnrichmentFields.CustomerName]
        case AIJourneyMetric.DiscountCodesUsed:
        case AIJourneyMetric.SankeyConversions:
            return [
                ...defaultEnrichmentFields,
                EnrichmentFields.CustomerName,
                EnrichmentFields.CustomerIntegrationDataByExternalId,
            ]
        default:
            return [...defaultEnrichmentFields]
    }
}

const useAIJourneyDrillDownHook = (metricData: DrillDownMetric) => {
    return useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        getEnrichmentFields(metricData.metricName),
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )
}

export const AIJourneyDrillDownConfig: DomainConfig<AIJourneyMetric> = {
    drillDownHook: useAIJourneyDrillDownHook,
    tableComponent: TicketDrillDownTableContent,
    legacyTableComponent: LegacyTicketDrillDownTableContent,
    infoBarObjectType: 'tickets',
    isMetricDataDownloadable: false,
    modalTriggerTooltipText: 'Click to view associated tickets',
    metricsConfig: {
        [AIJourneyMetric.TotalOrders]:
            AIJourneyMetricsConfig[AIJourneyMetric.TotalOrders],
        [AIJourneyMetric.ResponseRate]:
            AIJourneyMetricsConfig[AIJourneyMetric.ResponseRate],
        [AIJourneyMetric.ClickThroughRate]:
            AIJourneyMetricsConfig[AIJourneyMetric.ClickThroughRate],
        [AIJourneyMetric.OptOutRate]:
            AIJourneyMetricsConfig[AIJourneyMetric.OptOutRate],
        [AIJourneyMetric.DiscountCodesGenerated]:
            AIJourneyMetricsConfig[AIJourneyMetric.DiscountCodesGenerated],
        [AIJourneyMetric.DiscountCodesUsed]:
            AIJourneyMetricsConfig[AIJourneyMetric.DiscountCodesUsed],
        [AIJourneyMetric.TotalConversations]:
            AIJourneyMetricsConfig[AIJourneyMetric.TotalConversations],
        [AIJourneyMetric.TotalOptOuts]:
            AIJourneyMetricsConfig[AIJourneyMetric.TotalOptOuts],
        [AIJourneyMetric.TotalReplies]:
            AIJourneyMetricsConfig[AIJourneyMetric.TotalReplies],
        [AIJourneyMetric.OptOutAfterReply]:
            AIJourneyMetricsConfig[AIJourneyMetric.OptOutAfterReply],
        [AIJourneyMetric.SankeyConversions]:
            AIJourneyMetricsConfig[AIJourneyMetric.SankeyConversions],
    },
}
