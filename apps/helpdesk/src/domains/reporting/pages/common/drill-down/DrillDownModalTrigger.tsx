import type { PropsWithChildren } from 'react'
import { useCallback } from 'react'

import { useId } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classNames from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import { hintTooltipDelay } from 'domains/reporting/pages/common/constants'
import css from 'domains/reporting/pages/common/drill-down/DrillDownModalTrigger.less'
import {
    DomainsConfig,
    MetricsConfig,
} from 'domains/reporting/pages/common/drill-down/DrillDownTableConfig'
import type { DrillDownMetric } from 'domains/reporting/state/ui/stats/drillDownSlice'
import { setMetricData } from 'domains/reporting/state/ui/stats/drillDownSlice'
import useAppDispatch from 'hooks/useAppDispatch'

export const TRIGGER_ID = 'drill-down'

type Props = {
    metricData: DrillDownMetric
    enabled?: boolean
    highlighted?: boolean
    segmentEventName?: SegmentEvent
}

const getTooltipText = (metricData: DrillDownMetric) =>
    DomainsConfig[MetricsConfig[metricData.metricName].domain]
        .modalTriggerTooltipText

const useDrillDownModalOpener = ({
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

export const useOpenDrillDownModal = (metricData: DrillDownMetric) => {
    return useDrillDownModalOpener({
        segmentEventName: SegmentEvent.StatClicked,
        metricData,
    })
}

export const DrillDownModalTrigger = ({
    children,
    metricData,
    enabled = true,
    highlighted = false,
    segmentEventName = SegmentEvent.StatClicked,
}: PropsWithChildren<Props>) => {
    const openDrillDownModal = useDrillDownModalOpener({
        metricData,
        segmentEventName,
    })

    const targetId = `${TRIGGER_ID}-${useId()}`
    const tooltipText = getTooltipText(metricData)

    if (!enabled) return <>{children}</>

    return (
        <span
            id={targetId}
            className={classNames(css.text, {
                [css.highlighted]: highlighted,
            })}
            onClick={openDrillDownModal}
        >
            <Tooltip
                delay={hintTooltipDelay}
                target={targetId}
                innerProps={{ boundariesElement: 'window' }}
                container={window.document.body}
            >
                {tooltipText}
            </Tooltip>
            {children}
        </span>
    )
}
