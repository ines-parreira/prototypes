import pluralize from 'pluralize'

import { Skeleton } from '@gorgias/axiom'

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

    return isLoading ? (
        <Skeleton height={14} width={100} />
    ) : (
        <div className={css.wrapper}>
            <div className={css.description}>
                {pluralize('task', remainingTasks, true)} remaining
            </div>
        </div>
    )
}
