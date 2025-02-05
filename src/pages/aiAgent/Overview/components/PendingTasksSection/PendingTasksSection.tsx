import {Skeleton} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {useState} from 'react'

import {CardTitle} from 'pages/aiAgent/Onboarding/components/Card'
import {OverviewCard} from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'

import {usePendingTasks} from '../../hooks/usePendingTasks'
import {PendingTask} from '../PendingTask/PendingTask'
import {PendingTasksCompletionBar} from '../PendingTasksCompletionBar/PendingTasksCompletionBar'
import css from './PendingTasksSection.less'

const Expander = ({
    isLoading,
    isExpanded,
    onClick,
}: {
    isLoading: boolean
    isExpanded: boolean
    onClick: () => void
}) => {
    return isLoading ? (
        <div className={css.expander}>
            <Skeleton height={14} width={150} />
        </div>
    ) : (
        <button className={css.expander} onClick={onClick}>
            Show all tasks (9 total)
            <i className={classNames('material-icons', css.titleIcon)}>
                {isExpanded ? 'arrow_drop_up' : 'arrow_drop_down'}
            </i>
        </button>
    )
}

export const PendingTasksSection = () => {
    const [isPendingTasksExpanded, setIsPendingTasksExpanded] = useState(false)
    const {isLoading, pendingTasks, completedTasks, totalTasks} =
        usePendingTasks()

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

    // Easy way to manage the collapsible tasks
    // Collapse animation will come later
    const tasksToDisplay = isPendingTasksExpanded
        ? pendingTasks
        : pendingTasks?.slice(0, 3)

    return (
        <OverviewCard>
            <div className={css.innerCard}>
                <CardTitle>
                    <span className={css.title}>
                        Complete AI Agent Setup
                        <i
                            className={classNames(
                                'material-icons',
                                css.titleIcon
                            )}
                        >
                            auto_awesome
                        </i>
                    </span>
                </CardTitle>
                <PendingTasksCompletionBar
                    isLoading={isLoading}
                    totalTasks={totalTasks}
                    totalTasksCompleted={completedTasks?.length}
                />
                <div className={css.pendingTasksContainer}>
                    <div className={css.pendingTaskInnerContainer}>
                        {isLoading && loadingTasks}
                        {!isLoading &&
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
                                        isLoading={isLoading}
                                    />
                                </div>
                            ))}
                    </div>
                </div>
                <div className={css.expanderContainer}>
                    <Expander
                        isLoading={isLoading}
                        isExpanded={isPendingTasksExpanded}
                        onClick={() =>
                            setIsPendingTasksExpanded(!isPendingTasksExpanded)
                        }
                    />
                </div>
            </div>
        </OverviewCard>
    )
}
