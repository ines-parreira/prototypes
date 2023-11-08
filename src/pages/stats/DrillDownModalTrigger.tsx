import React, {PropsWithChildren} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppDispatch from 'hooks/useAppDispatch'
import {setMetricData, DrillDownMetric} from 'state/ui/stats/drillDownSlice'
import css from './DrillDownModalTrigger.less'

type Props = {
    metricData: DrillDownMetric
}

export const DrillDownModalTrigger = ({
    children,
    metricData,
}: PropsWithChildren<Props>) => {
    const dispatch = useAppDispatch()

    const hasAnalyticsDrillDown: boolean =
        useFlags()[FeatureFlagKey.AnalyticsDrillDown]

    return (
        <>
            {hasAnalyticsDrillDown ? (
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
