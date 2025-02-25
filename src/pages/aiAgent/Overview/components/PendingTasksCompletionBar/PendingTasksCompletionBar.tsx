import React from 'react'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import css from './PendingTasksCompletionBar.less'

type Props = {
    totalTasksCompleted?: number
    totalTasks?: number
    isLoading?: boolean
}

export const PendingTasksCompletionBar: React.FC<Props> = ({
    totalTasksCompleted = 0,
    totalTasks = 1,
    isLoading,
}: Props) => {
    let ariaProps: Record<string, string | number> = {}
    if (isLoading) {
        ariaProps = { 'aria-busy': 'true', 'aria-live': 'polite' }
    } else {
        ariaProps = {
            'aria-value': totalTasksCompleted,
            'aria-valuemin': 0,
            'aria-valuemax': totalTasks,
            'aria-valuetext': `You completed ${totalTasksCompleted} tasks on a total of ${totalTasks}`,
        }
    }

    const position = Math.min(100, (totalTasksCompleted / totalTasks) * 100)

    return (
        <div role="progressbar" {...ariaProps}>
            <div className={css.bar}>
                {isLoading ? (
                    <Skeleton height={16} />
                ) : (
                    <>
                        <div className={css.dashLine}></div>
                        <div
                            className={css.gradientLine}
                            style={{ width: `${position}%` }}
                        />
                        <div
                            className={css.plainDot}
                            /** Dot is 16px width, to center it we remove 50% of 16px */
                            style={{ left: `calc(${position}% - 8px)` }}
                        >
                            <div className={css.wrapperDot}>
                                <div className={css.centerDot}></div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
