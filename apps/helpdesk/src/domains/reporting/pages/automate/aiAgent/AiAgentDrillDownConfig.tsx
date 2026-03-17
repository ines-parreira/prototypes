import {
    defaultEnrichmentFields,
    useEnrichedDrillDownData,
} from 'domains/reporting/hooks/useDrillDownData'
import { successRateV2DrillDownQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { AiAgentDrillDownMetricName } from 'domains/reporting/pages/automate/aiAgent/aiAgentDrillDownMetrics'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { LegacyTicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/LegacyTicketDrillDownTableContent'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'

export type AiAgentDrillDownMetrics = AiAgentDrillDownMetricName

const useAiAgentTicketDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        successRateV2DrillDownQueryFactory,
        metricData,
        defaultEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )

export const AiAgentDrillDownConfig: DomainConfig<AiAgentDrillDownMetrics> = {
    drillDownHook: useAiAgentTicketDrillDownHook,
    tableComponent: TicketDrillDownTableContent,
    legacyTableComponent: LegacyTicketDrillDownTableContent,
    infoBarObjectType: 'tickets',
    isMetricDataDownloadable: false,
    modalTriggerTooltipText: 'Click to view tickets',
    metricsConfig: {
        [AiAgentDrillDownMetricName.ShoppingAssistantSuccessRateCard]: {
            showMetric: false,
            domain: Domain.AiAgent,
        },
    },
}
