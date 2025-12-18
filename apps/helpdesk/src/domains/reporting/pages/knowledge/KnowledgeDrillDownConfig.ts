import { useEnrichedDrillDownData } from 'domains/reporting/hooks/useDrillDownData'
import { EnrichmentFields } from 'domains/reporting/models/types'
import { formatTicketDrillDownRowData } from 'domains/reporting/pages/common/drill-down/DrillDownFormatters'
import type { DomainConfig } from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import { getDrillDownQuery } from 'domains/reporting/pages/common/drill-down/helpers'
import { TicketDrillDownTableContent } from 'domains/reporting/pages/common/drill-down/TicketDrillDownTableContent'
import { KnowledgeMetricConfig } from 'domains/reporting/pages/knowledge/KnowledgeMetricConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'

const knowledgeEnrichmentFields: EnrichmentFields[] = [
    EnrichmentFields.TicketName,
    EnrichmentFields.Status,
    EnrichmentFields.Description,
    EnrichmentFields.Channel,
    EnrichmentFields.CreatedDatetime,
    EnrichmentFields.ContactReason,
    EnrichmentFields.IsUnread,
    EnrichmentFields.CustomFields,
]

const useKnowledgeDrillDownHook = (metricData: DrillDownMetric) =>
    useEnrichedDrillDownData(
        getDrillDownQuery(metricData),
        metricData,
        knowledgeEnrichmentFields,
        formatTicketDrillDownRowData,
        EnrichmentFields.TicketId,
    )

export const KnowledgeDrillDownConfig: DomainConfig<KnowledgeMetric> = {
    drillDownHook: useKnowledgeDrillDownHook,
    tableComponent: TicketDrillDownTableContent,
    infoBarObjectType: 'tickets',
    isMetricDataDownloadable: true,
    modalTriggerTooltipText: 'Click to view tickets',
    metricsConfig: KnowledgeMetricConfig,
}
