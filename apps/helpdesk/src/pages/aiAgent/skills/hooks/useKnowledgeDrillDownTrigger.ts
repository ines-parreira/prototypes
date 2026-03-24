import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import {
    DomainsConfig,
    MetricsConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import type { KnowledgeMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { KnowledgeMetric } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'

const getTooltipText = (metricName: KnowledgeMetric) =>
    DomainsConfig[MetricsConfig[metricName].domain].modalTriggerTooltipText

/**
 * Hook for managing knowledge metrics drill-down modal interactions.
 *
 * This hook should be used with the `<DrillDownModalTrigger>` component from `@repo/reporting`
 * to enable drill-down functionality on knowledge metrics. It handles:
 * - Setting metric data in Redux state for the drill-down modal
 * - Logging Segment analytics events
 * - Providing tooltip text for the trigger
 *
 * @example
 * ```tsx
 * import { DrillDownModalTrigger } from '@repo/reporting'
 * import { useKnowledgeDrillDownTrigger } from 'pages/aiAgent/skills/hooks/useKnowledgeDrillDownTrigger'
 *
 * function MetricCell() {
 *   const { openDrillDownModal, tooltipText } = useKnowledgeDrillDownTrigger({
 *     metricName: KnowledgeMetric.Tickets,
 *     resourceSourceId: articleId,
 *     resourceSourceSetId: metrics.resourceSourceSetId,
 *     shopIntegrationId,
 *     dateRange: metricsDateRange,
 *   })
 *
 *   return (
 *     <DrillDownModalTrigger onClick={openDrillDownModal} tooltipText={tooltipText}>
 *       <Text>{value}</Text>
 *     </DrillDownModalTrigger>
 *   )
 * }
 * ```
 */
export const useKnowledgeDrillDownTrigger = ({
    metricName,
    title,
    resourceSourceId,
    resourceSourceSetId,
    shopIntegrationId,
    dateRange,
    outcomeCustomFieldId,
    intentCustomFieldId,
    segmentEventName = SegmentEvent.AiAgentTicketDrilldownClicked,
}: {
    metricName: KnowledgeMetric
    title?: string
    resourceSourceId: number
    resourceSourceSetId: number
    shopIntegrationId: number
    dateRange: { start_datetime: string; end_datetime: string }
    outcomeCustomFieldId?: number
    intentCustomFieldId?: number
    segmentEventName?: SegmentEvent
}) => {
    const dispatch = useAppDispatch()
    const tooltipText = title || getTooltipText(metricName)

    const metricData: KnowledgeMetrics = useMemo(
        () => ({
            title: tooltipText,
            metricName,
            resourceSourceId,
            resourceSourceSetId,
            shopIntegrationId,
            dateRange,
            ...(outcomeCustomFieldId && { outcomeCustomFieldId }),
            ...(intentCustomFieldId && { intentCustomFieldId }),
        }),
        [
            tooltipText,
            metricName,
            resourceSourceId,
            resourceSourceSetId,
            shopIntegrationId,
            dateRange,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ],
    )

    const openDrillDownModal = useCallback(() => {
        dispatch(setMetricData(metricData))
        logEvent(segmentEventName, { metric: metricName })
    }, [dispatch, metricData, segmentEventName, metricName])

    return {
        openDrillDownModal,
        tooltipText,
    }
}
