import classNames from 'classnames'
import React, {useState} from 'react'

import {CardTitle} from 'pages/aiAgent/Onboarding/components/Card'
import {OverviewCard} from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'

import {PendingTask} from '../PendingTask/PendingTask'
import {PendingTasksCompletionBar} from '../PendingTasksCompletionBar/PendingTasksCompletionBar'
import {Expander} from './Expander'
import css from './PendingTasksSection.less'
import {StorePicker} from './StorePicker'

export const pendingTasksCollapsibleId = 'overview-pending-tasks-collapsible'

type PendingTask = {
    title: string
    caption: string
    featureUrl: string
    type: 'BASIC' | 'RECOMMENDED'
}
type Store = {
    name: string
    id: number
}
type Props = {
    selectedStore: Store
    stores: Store[]
    onStoreChange: (store: Store) => void
    isLoading: boolean
    pendingTasks: PendingTask[]
    completedTasks: PendingTask[]
    totalTasks: number
}

export const PendingTasksSection = ({
    stores,
    selectedStore,
    onStoreChange,
    completedTasks,
    isLoading,
    pendingTasks,
    totalTasks,
}: Props) => {
    const [isPendingTasksExpanded, setIsPendingTasksExpanded] = useState(false)

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
                <div className={css.titleContainer}>
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
                    <StorePicker
                        stores={stores}
                        selectedStore={selectedStore}
                        onStoreChange={onStoreChange}
                    />
                </div>
                <PendingTasksCompletionBar
                    isLoading={isLoading}
                    totalTasks={totalTasks}
                    totalTasksCompleted={completedTasks?.length}
                />
                <div className={css.pendingTasksContainer}>
                    <div
                        className={css.pendingTaskInnerContainer}
                        id={pendingTasksCollapsibleId}
                        role="region"
                    >
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
                {pendingTasks.length > 3 && (
                    <div className={css.expanderContainer}>
                        <Expander
                            controlId={pendingTasksCollapsibleId}
                            tasksCount={pendingTasks?.length}
                            isLoading={isLoading}
                            isExpanded={isPendingTasksExpanded}
                            onClick={() =>
                                setIsPendingTasksExpanded(
                                    !isPendingTasksExpanded
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </OverviewCard>
    )
}
