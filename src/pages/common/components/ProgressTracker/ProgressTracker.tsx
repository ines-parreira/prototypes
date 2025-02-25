import React from 'react'

import classNames from 'classnames'

import css from 'pages/common/components/ProgressTracker/ProgressTracker.less'
import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'

type Props = {
    className?: string
    step: number
    totalSteps: number
    stepLabel?: string
    cta: React.ReactNode
    stepTrackerColor: string
}

const ProgressTracker = (props: Props) => {
    const { stepLabel, step, totalSteps, cta, stepTrackerColor, className } =
        props

    const percentage = (step / totalSteps) * 100
    return (
        <div className={classNames(css.container, className)}>
            <div className={css.progressTracker}>
                <div className={css.progressCircle}>
                    <TrackerCircle
                        percentage={percentage}
                        color={stepTrackerColor}
                    />
                </div>
                <div className={css.label}>
                    {stepLabel ? stepLabel + ' ' : ''}
                    {step}/{totalSteps}
                </div>
            </div>
            <div className={css.cta}>{cta}</div>
        </div>
    )
}

export default ProgressTracker
