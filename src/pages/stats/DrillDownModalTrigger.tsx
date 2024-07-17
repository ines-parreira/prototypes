import React, {PropsWithChildren} from 'react'
import {Tooltip} from '@gorgias/ui-kit'
import {logEvent, SegmentEvent} from 'common/segment'

import useAppDispatch from 'hooks/useAppDispatch'
import {DrillDownMetric, setMetricData} from 'state/ui/stats/drillDownSlice'
import css from 'pages/stats/DrillDownModalTrigger.less'
import {hintTooltipDelay} from 'pages/stats/common/constants'
import useId from 'hooks/useId'
import {ConvertMetric, VoiceMetric} from 'state/ui/stats/types'

export const TRIGGER_ID = 'drill-down'

type Props = {
    metricData: DrillDownMetric
    enabled?: boolean
}

const getTooltipText = (metricName: string) => {
    switch (metricName) {
        case ConvertMetric.CampaignSalesCount:
            return 'Click to view orders'
        case VoiceMetric.AverageWaitTime:
        case VoiceMetric.AverageTalkTime:
            return 'Click to view calls'
        default:
            return 'Click to view tickets'
    }
}

export const DrillDownModalTrigger = ({
    children,
    metricData,
    enabled = true,
}: PropsWithChildren<Props>) => {
    const dispatch = useAppDispatch()

    const handleClick = () => {
        dispatch(setMetricData(metricData))
        logEvent(SegmentEvent.StatClicked, {metric: metricData.metricName})
    }

    const targetId = `${TRIGGER_ID}-${useId()}`
    const tooltipText = getTooltipText(metricData.metricName)

    return (
        <>
            {enabled ? (
                <span id={targetId} className={css.text} onClick={handleClick}>
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
