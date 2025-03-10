import React, { PropsWithChildren } from 'react'

import classNames from 'classnames'

import { Tooltip } from '@gorgias/merchant-ui-kit'

import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useId from 'hooks/useId'
import { hintTooltipDelay } from 'pages/stats/common/constants'
import css from 'pages/stats/DrillDownModalTrigger.less'
import {
    DrillDownMetric,
    setMetricData,
    setShouldUseNewFilterData,
} from 'state/ui/stats/drillDownSlice'
import {
    ConvertMetric,
    VoiceAgentsMetric,
    VoiceMetric,
} from 'state/ui/stats/types'

export const TRIGGER_ID = 'drill-down'

type Props = {
    metricData: DrillDownMetric
    enabled?: boolean
    highlighted?: boolean
    useNewFilterData?: boolean
    segmentEventName?: SegmentEvent
}

const getTooltipText = (metricName: string) => {
    switch (metricName) {
        case ConvertMetric.CampaignSalesCount:
            return 'Click to view orders'
        case VoiceMetric.AverageTalkTime:
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.QueueAverageWaitTime:
        case VoiceMetric.QueueAverageTalkTime:
        case VoiceMetric.QueueInboundCalls:
        case VoiceMetric.DEPRECATED_QueueMissedInboundCalls:
        case VoiceMetric.QueueInboundUnansweredCalls:
        case VoiceMetric.QueueInboundMissedCalls:
        case VoiceMetric.QueueInboundAbandonedCalls:
        case VoiceMetric.QueueOutboundCalls:
        case VoiceAgentsMetric.AgentTotalCalls:
        case VoiceAgentsMetric.AgentInboundAnsweredCalls:
        case VoiceAgentsMetric.AgentInboundMissedCalls:
        case VoiceAgentsMetric.AgentOutboundCalls:
        case VoiceAgentsMetric.AgentAverageTalkTime:
            return 'Click to view calls'
        default:
            return 'Click to view tickets'
    }
}

export const DrillDownModalTrigger = ({
    children,
    metricData,
    enabled = true,
    highlighted = false,
    useNewFilterData = false,
    segmentEventName = SegmentEvent.StatClicked,
}: PropsWithChildren<Props>) => {
    const dispatch = useAppDispatch()

    const handleClick = () => {
        dispatch(setMetricData(metricData))
        if (useNewFilterData) {
            dispatch(setShouldUseNewFilterData(true))
        }
        logEvent(segmentEventName, { metric: metricData.metricName })
    }

    const targetId = `${TRIGGER_ID}-${useId()}`
    const tooltipText = getTooltipText(metricData.metricName)

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
