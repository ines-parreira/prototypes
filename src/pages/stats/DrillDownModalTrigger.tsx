import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {PropsWithChildren} from 'react'
import {logEvent, SegmentEvent} from 'common/segment'

import {FeatureFlagKey} from 'config/featureFlags'
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

    const hasAnalyticsDrillDown: boolean =
        useFlags()[FeatureFlagKey.AnalyticsDrillDown]

    const handleClick = () => {
        dispatch(setMetricData(metricData))
        logEvent(SegmentEvent.StatClicked, {metric: metricData.metricName})
    }

    return (
        <>
            {hasAnalyticsDrillDown && enabled ? (
                <span className={css.text} onClick={handleClick}>
                    {children}
                </span>
            ) : (
                children
            )}
        </>
    )
}
