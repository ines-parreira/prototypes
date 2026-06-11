import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import {
    DomainsConfig,
    MetricsConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import type { IntentMetrics } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import type { IntentMetric } from 'domains/reporting/state/ui/stats/types'
import { useAppDispatch } from 'hooks/useAppDispatch'

const getTooltipText = (metricName: IntentMetric) =>
    DomainsConfig[MetricsConfig[metricName].domain].modalTriggerTooltipText

/**
 * Hook for managing intent metrics drill-down modal interactions.
 *
 * This hook should be used with the `<DrillDownModalTrigger>` component from `@repo/reporting`
 * to enable drill-down functionality on intent metrics. It handles:
 * - Setting metric data in Redux state for the drill-down modal
 * - Logging Segment analytics events
 * - Providing tooltip text for the trigger
 *
 * @example
 * ```tsx
 * import { DrillDownModalTrigger } from '@repo/reporting'
 * import { useIntentDrillDownTrigger } from 'pages/aiAgent/skills/hooks/useIntentDrillDownTrigger'
 * import { IntentMetric } from 'domains/reporting/state/ui/stats/types'
 *
 * function MetricCell() {
 *   const { openDrillDownModal, tooltipText } = useIntentDrillDownTrigger({
 *     metricName: IntentMetric.TicketVolume,
 *     intentName: 'Product::Details',
 *     integrationIds: ['123', '456'],
 *     dateRange: metricsDateRange,
 *     outcomeCustomFieldId: 111,
 *     intentCustomFieldId: 222,
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
export const useIntentDrillDownTrigger = ({
    metricName,
    intentName = '',
    optionalIntentFieldValues,
    integrationIds,
    outcomeCustomFieldId,
    intentCustomFieldId,
    outcomeValue,
    dateRange,
    title,
    segmentEventName = SegmentEvent.AiAgentTicketDrilldownClicked,
}: {
    metricName: IntentMetric
    intentName?: string
    optionalIntentFieldValues?: string[]
    integrationIds: string[]
    outcomeCustomFieldId?: number
    intentCustomFieldId: number
    outcomeValue?: string
    dateRange: { start_datetime: string; end_datetime: string }
    title?: string
    segmentEventName?: SegmentEvent
}) => {
    const dispatch = useAppDispatch()
    const tooltipText = title || getTooltipText(metricName)

    const intentFieldValues = useMemo(
        () => optionalIntentFieldValues ?? [intentName],
        [optionalIntentFieldValues, intentName],
    )

    const metricData: IntentMetrics = useMemo(
        () => ({
            title: tooltipText,
            metricName,
            ...(outcomeCustomFieldId && {
                outcomeFieldId: outcomeCustomFieldId,
            }),
            ...(outcomeValue && { outcomeFieldValues: [outcomeValue] }),
            intentFieldValues,
            intentFieldId: intentCustomFieldId,
            integrationIds,
            dateRange,
        }),
        [
            tooltipText,
            metricName,
            outcomeCustomFieldId,
            outcomeValue,
            intentFieldValues,
            intentCustomFieldId,
            integrationIds,
            dateRange,
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
