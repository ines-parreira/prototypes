import { PropsWithChildren, ReactNode, useCallback } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useId from 'hooks/useId'
import { hintTooltipDelay } from 'pages/stats/common/constants'
import css from 'pages/stats/common/drill-down/DrillDownModalTrigger.less'
import {
    DomainsConfig,
    MetricsConfig,
} from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { DrillDownMetric, setMetricData } from 'state/ui/stats/drillDownSlice'

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
            <Tooltip delay={hintTooltipDelay} target={targetId}>
                {tooltipText}
            </Tooltip>
            {children}
        </span>
    )
}

export const WithDrillDownTrigger = ({
    children,
    metricData,
}: {
    children: ReactNode
    metricData: DrillDownMetric | null
}) => {
    if (metricData) {
        return (
            <DrillDownModalTrigger highlighted metricData={metricData}>
                {children}
            </DrillDownModalTrigger>
        )
    }

    return <>{children}</>
}
