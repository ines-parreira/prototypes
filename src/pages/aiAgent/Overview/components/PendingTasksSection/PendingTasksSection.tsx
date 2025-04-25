import { useState } from 'react'

import classNames from 'classnames'

import partyPopperImg from 'assets/img/ai-agent/ai-agent_party-popper.svg'
import { IntegrationType } from 'models/integration/constants'
import { CardTitle } from 'pages/aiAgent/Onboarding/components/Card'
import { OverviewCard } from 'pages/aiAgent/Overview/components/OverviewCard/OverviewCard'
import { useTaskDisplayLimit } from 'pages/aiAgent/Overview/hooks/pendingTasks/useTaskDisplayLimit'

import { Task } from '../../hooks/pendingTasks/tasks/Task'
import { PendingTask } from '../PendingTask/PendingTask'
import { PendingTasksCompletionBar } from '../PendingTasksCompletionBar/PendingTasksCompletionBar'
import { Expander } from './Expander'
import { StorePicker } from './StorePicker'

import css from './PendingTasksSection.less'

export const pendingTasksCollapsibleId = 'overview-pending-tasks-collapsible'

type Store = {
    name: string
    id: number
    type: IntegrationType
}
type Props = {
    selectedStore: Store
    stores: Store[]
    onStoreChange: (store: Store) => void
    isLoading: boolean
    pendingTasks: Task[]
    completedTasks: Task[]
}

export const PendingTasksSection = ({
    stores,
    selectedStore,
    onStoreChange,
    completedTasks,
    isLoading,
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

    return (
        <OverviewCard>
            <div className={css.innerCard}>
                <div className={css.titleContainer}>
                    <CardTitle>
                        <div className={css.title}>
                            Setup your store
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.titleIcon,
                                )}
                            >
                                auto_awesome
                            </i>
                        </div>
                    </CardTitle>
                </div>
                {stores.length > 1 && (
                    <StorePicker
                        stores={stores}
                        selectedStore={selectedStore}
                        onStoreChange={onStoreChange}
                    />
                )}
                <PendingTasksCompletionBar
                    isLoading={isLoading}
                    totalTasks={pendingTasks.length + completedTasks.length}
                    totalTasksCompleted={completedTasks?.length}
                />
                {!allTasksCompleted || isLoading ? (
                    <>
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
                        {pendingTasks.length > maxTasks && (
                            <div className={css.expanderContainer}>
                                <Expander
                                    controlId={pendingTasksCollapsibleId}
                                    isLoading={isLoading}
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
