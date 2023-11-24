import React, {PropsWithChildren} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import {setMetricData, DrillDownMetric} from 'state/ui/stats/drillDownSlice'
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

    return (
        <>
            {hasAnalyticsDrillDown && enabled ? (
                <span
                    className={css.text}
                    onClick={() => dispatch(setMetricData(metricData))}
                >
                    {children}
                </span>
            ) : (
                children
            )}
        </>
    )
}
