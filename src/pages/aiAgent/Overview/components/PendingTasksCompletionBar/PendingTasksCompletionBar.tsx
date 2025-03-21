import { useMemo } from 'react'

import pluralize from 'pluralize'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import css from './PendingTasksCompletionBar.less'

type Props = {
    totalTasksCompleted?: number
    totalTasks?: number
    isLoading?: boolean
}

export const PendingTasksCompletionBar = ({
    totalTasksCompleted = 0,
    totalTasks = 1,
    isLoading,
}: Props) => {
    const remainingTasks = totalTasks - totalTasksCompleted

    const { progressValue, progressMax } = useMemo(() => {
        // Required because otherwise the progress is unfilled
        if (totalTasksCompleted === 0 && totalTasks === 0) {
            return {
                progressValue: 1,
                progressMax: 1,
            }
        }

        return {
            progressValue: totalTasksCompleted,
            progressMax: totalTasks,
        }
    }, [totalTasksCompleted, totalTasks])

    return isLoading ? (
        <Skeleton height={34} />
    ) : (
        <div className={css.wrapper}>
            <progress
                className={css.progress}
                value={progressValue}
                max={progressMax}
            />
            <div className={css.description}>
                {pluralize('task', remainingTasks, true)} remaining
            </div>
        </div>
    )
}
