import React, { PropsWithChildren } from 'react'

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

export const DrillDownModalTrigger = ({
    children,
    metricData,
    enabled = true,
    highlighted = false,
    segmentEventName = SegmentEvent.StatClicked,
}: PropsWithChildren<Props>) => {
    const dispatch = useAppDispatch()

    const handleClick = () => {
        dispatch(setMetricData(metricData))
        logEvent(segmentEventName, { metric: metricData.metricName })
    }

    const targetId = `${TRIGGER_ID}-${useId()}`
    const tooltipText = getTooltipText(metricData)

    return (
        <>
            {enabled ? (
                <span
                    id={targetId}
                    className={classNames(css.text, {
                        [css.highlighted]: highlighted,
                    })}
                    onClick={handleClick}
                >
                    <Tooltip delay={hintTooltipDelay} target={targetId}>
                        {tooltipText}
                    </Tooltip>
                    {children}
                </span>
            ) : (
                children
            )}
        </>
    )
}
