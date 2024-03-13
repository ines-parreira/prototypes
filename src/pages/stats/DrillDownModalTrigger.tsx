import React, {PropsWithChildren} from 'react'
import {logEvent, SegmentEvent} from 'common/segment'

import useAppDispatch from 'hooks/useAppDispatch'
import {DrillDownMetric, setMetricData} from 'state/ui/stats/drillDownSlice'
import css from './DrillDownModalTrigger.less'

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

    return (
        <>
            {enabled ? (
                <span className={css.text} onClick={handleClick}>
                    {children}
                </span>
            ) : (
                children
            )}
        </>
    )
}
