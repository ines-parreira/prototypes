import { useCallback } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import {
    DomainsConfig,
    MetricsConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'

const useCreateDrillDownModalHandler = ({
    metricData,
    segmentEventName,
}: {
    metricData: DrillDownMetric
    segmentEventName: SegmentEvent
}) => {
    const dispatch = useAppDispatch()

    return useCallback(() => {
        dispatch(setMetricData(metricData))
        logEvent(segmentEventName, { metric: metricData.metricName })
    }, [dispatch, metricData, segmentEventName])
}

const getTooltipText = (metricName: DrillDownMetric['metricName']) =>
    DomainsConfig[MetricsConfig[metricName].domain].modalTriggerTooltipText

/**
 * Hook for managing drill-down modal interactions in analytics reporting.
 *
 * This hook should be used with the `<DrillDownModalTrigger>` component from `@repo/reporting`
 * to enable drill-down functionality on metrics and statistics. It handles:
 * - Setting metric data in Redux state for the drill-down modal
 * - Logging Segment analytics events
 * - Providing tooltip text for the trigger
 *
 * @example
 * ```tsx
 * import { DrillDownModalTrigger } from '@repo/reporting'
 * import { useDrillDownModalTrigger } from 'domains/reporting/hooks/drill-down/useDrillDownModalTrigger'
 *
 * function MyMetricCard() {
 *   const { openDrillDownModal, tooltipText } = useDrillDownModalTrigger({
 *     metricName: 'ai_agent_conversation_count',
 *     segmentEventName: SegmentEvent.StatClicked,
 *   })
 *
 *   return (
 *     <DrillDownModalTrigger
 *       onClick={openDrillDownModal}
 *       tooltipText={tooltipText}
 *     />
 *   )
 * }
 * ```
 *
 * @returns An object containing:
 * - `openDrillDownModal`: Callback to open the drill-down modal with the specified metric data
 * - `tooltipText`: Text to display in the trigger tooltip (auto-generated from config or custom)
 */
export const useDrillDownModalTrigger = ({
    metricName,
    segmentEventName = SegmentEvent.StatClicked,
    title,
    integrationId,
    journeyIds,
}: {
    metricName: DrillDownMetric['metricName']
    title?: string
    integrationId?: string
    journeyIds?: string[] | []
    segmentEventName?: SegmentEvent
}) => {
    const tooltipText = title || getTooltipText(metricName)

    const metricData = {
        title: tooltipText,
        metricName: metricName,
        integrationId,
        journeyIds,
    } as DrillDownMetric

    const openDrillDownModal = useCreateDrillDownModalHandler({
        metricData,
        segmentEventName,
    })

    return {
        openDrillDownModal,
        tooltipText,
    }
}
