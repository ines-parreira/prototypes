import React from 'react'

import cn from 'classnames'

import TrackerCircle from 'pages/common/components/ProgressTracker/TrackerCircle'

import css from './ActivationProgress.less'

type Props = {
    className?: string
    percentage: number
}
export const ActivationProgress = ({ className, percentage }: Props) => {
    return (
        <TrackerCircle
            className={cn(css.progress, className)}
            percentage={percentage}
            color="#C34CED"
            radius={18}
            strokeWidth={3}
            label={`${percentage}%`}
        />
    )
}
