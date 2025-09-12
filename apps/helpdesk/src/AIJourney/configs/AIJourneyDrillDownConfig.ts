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
import { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

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
            return [...defaultEnrichmentFields, EnrichmentFields.CustomerName]
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
    },
}
