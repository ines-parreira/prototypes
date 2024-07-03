import React, {PropsWithChildren} from 'react'
import Tooltip from 'pages/common/components/Tooltip'
import {logEvent, SegmentEvent} from 'common/segment'

import useAppDispatch from 'hooks/useAppDispatch'
import {DrillDownMetric, setMetricData} from 'state/ui/stats/drillDownSlice'
import css from 'pages/stats/DrillDownModalTrigger.less'
import {hintTooltipDelay} from 'pages/stats/common/constants'
import useId from 'hooks/useId'

export const TRIGGER_ID = 'drill-down'

type Props = {
    metricData: DrillDownMetric
    enabled?: boolean
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

    return (
        <>
            {enabled ? (
                <span id={targetId} className={css.text} onClick={handleClick}>
                    <Tooltip delay={hintTooltipDelay} target={targetId}>
                        Click to view tickets
                    </Tooltip>
                    {children}
                </span>
            ) : (
                children
            )}
        </>
    )
}
