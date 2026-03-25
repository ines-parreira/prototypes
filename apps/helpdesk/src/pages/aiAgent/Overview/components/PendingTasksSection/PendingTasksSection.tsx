import { useState } from 'react'

import partyPopperImg from 'assets/img/ai-agent/ai-agent_party-popper.svg'
import { CardTitle } from 'pages/aiAgent/components/Card'
import { OverviewCard } from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import { useTaskDisplayLimit } from 'pages/aiAgent/Overview/hooks/pendingTasks/useTaskDisplayLimit'

import type { Task } from '../../hooks/pendingTasks/tasks/Task'
import { PendingTask } from '../PendingTask/PendingTask'
import { PendingTasksCompletionBar } from '../PendingTasksCompletionBar/PendingTasksCompletionBar'
import { Expander } from './Expander'

import css from './PendingTasksSection.less'

export const pendingTasksCollapsibleId = 'overview-pending-tasks-collapsible'

type Props = {
    isLoading: boolean
    isFetched: boolean
    pendingTasks: Task[]
    completedTasks: Task[]
}

export const PendingTasksSection = ({
    completedTasks,
    isLoading,
    isFetched,
    pendingTasks,
}: Props) => {
    const [isPendingTasksExpanded, setIsPendingTasksExpanded] = useState(false)

    const allTasksCompleted =
        completedTasks.length === pendingTasks.length + completedTasks.length

    const loadingTasks = (
        <>
            <div className={css.pendingTaskWrapper}>
                <PendingTask isLoading={isLoading} />
            </div>
            <div className={css.pendingTaskWrapper}>
                <PendingTask isLoading={isLoading} />
            </div>
            <div className={css.pendingTaskWrapper}>
                <PendingTask isLoading={isLoading} />
            </div>
        </>
    )

    const maxTasks = useTaskDisplayLimit()

    const tasksToDisplay = isPendingTasksExpanded
        ? pendingTasks
        : pendingTasks.slice(0, maxTasks)

    // If both values are true, it means that one of the requests is cancelled or blocked
    const isLoadingState = isLoading && isFetched ? false : isLoading

    return (
        <OverviewCard>
            <div className={css.innerCard}>
                <div className={css.headerContainer}>
                    <div className={css.titleContainer}>
                        <CardTitle>
                            <div className={css.title}>
                                Complete AI Agent setup
                            </div>
                        </CardTitle>
                    </div>
                    <PendingTasksCompletionBar
                        isLoading={isLoadingState}
                        totalTasks={pendingTasks.length + completedTasks.length}
                        totalTasksCompleted={completedTasks?.length}
                    />
                </div>

                {!allTasksCompleted || isLoading ? (
                    <>
                        <div className={css.pendingTasksContainer}>
                            <div
                                className={css.pendingTaskInnerContainer}
                                id={pendingTasksCollapsibleId}
                                role="region"
                            >
                                {isLoadingState && loadingTasks}
                                {!isLoadingState &&
                                    tasksToDisplay?.map((task) => (
                                        <div
                                            className={css.pendingTaskWrapper}
                                            key={task.title}
                                        >
                                            <PendingTask
                                                title={task.title}
                                                caption={task.caption}
                                                type={task.type}
                                                ctaUrl={task.featureUrl}
                                                isLoading={isLoadingState}
                                            />
                                        </div>
                                    ))}
                            </div>
                        </div>
                        {pendingTasks.length > maxTasks && (
                            <div className={css.expanderContainer}>
                                <Expander
                                    controlId={pendingTasksCollapsibleId}
                                    isLoading={isLoadingState}
                                    isExpanded={isPendingTasksExpanded}
                                    onClick={() =>
                                        setIsPendingTasksExpanded(
                                            !isPendingTasksExpanded,
                                        )
                                    }
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <div className={css.completed}>
                        <img src={partyPopperImg} alt="Party popper" />{' '}
                        <div className={css.completedText}>
                            Congrats! You’ve finished all tasks for this store.
                        </div>
                    </div>
                )}
            </div>
        </OverviewCard>
    )
}
