import { useEffect, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { Heading, Icon, Text } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

import { ProgressIcon } from '../AiAgentTasks/ProgressIcon'
import { CategoryContent } from './CategoryContent'
import { CategoryList } from './CategoryList'
import { useGetSetupTasksConfigByCategory } from './hooks/useGetSetupTasksConfigByCategory'
import { useMarkAllTasksAsCompleted } from './hooks/useMarkAllTasksAsCompleted'
import { useMarkPostGoLiveStepCompleted } from './hooks/useMarkPostGoLiveStepCompleted'
import { PostGoLiveModal } from './PostGoLiveModal'
import type { TaskConfig, TasksCategoryKey } from './types'

import css from './SetupTaskSection.less'

export const SetupTaskSection = ({
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
}) => {
    const accountId = useAppSelector(getCurrentAccountId)
    const [showMarkAsCompleted, setShowMarkAsCompleted] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowMarkAsCompleted(false)
            }
        }

        if (showMarkAsCompleted) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showMarkAsCompleted])

    const {
        tasksConfigByCategory,
        completionPercentage,
        postGoLiveStepId,
        postGoLiveStep,
    } = useGetSetupTasksConfigByCategory({
        accountId,
        shopName,
        shopType,
    })

    const { markAllAsCompleted } = useMarkAllTasksAsCompleted({
        postGoLiveStepId,
        postGoLiveStepConfiguration: postGoLiveStep?.stepsConfiguration,
        tasksConfigByCategory,
        accountId,
        shopName,
    })

    const categories = Object.keys(tasksConfigByCategory) as TasksCategoryKey[]
    const [selectedCategory, setSelectedCategory] =
        useState<TasksCategoryKey | null>(null)

    const defaultCategory =
        categories.find((category) => {
            const categoryTasks = tasksConfigByCategory[category] || []
            return categoryTasks.some((task) => !task.isCompleted)
        }) ||
        categories[categories.length - 1] ||
        null

    if (defaultCategory !== null && selectedCategory === null) {
        setSelectedCategory(defaultCategory)
    }

    const selectedCategoryTasks: TaskConfig[] = selectedCategory
        ? tasksConfigByCategory[selectedCategory] || []
        : []

    const handleMarkAllAsCompleted = async () => {
        await markAllAsCompleted()
        setShowMarkAsCompleted(false)
        logEvent(SegmentEvent.PostGoLiveMarkAllAsCompletedClicked, {
            shop_name: shopName,
            shop_type: shopType,
        })
        triggerCompletionModal()
    }

    const isAllTasksCompleted =
        completionPercentage === 100 && categories.length > 0
    const isPostGoLiveStepCompleted = !!postGoLiveStep?.completedDatetime

    const { showCompletionModal, handleCloseModal, triggerCompletionModal } =
        useMarkPostGoLiveStepCompleted({
            postGoLiveStepId,
            postGoLiveStep,
            isAllTasksCompleted,
            accountId,
            shopName,
        })

    const closeModal = () => {
        handleCloseModal()
        logEvent(SegmentEvent.PostGoLiveCompletedModalClosed, {
            shop_name: shopName,
            shop_type: shopType,
        })
    }

    const getProgressBasedOnPercentage = () => {
        if (completionPercentage > 80) return 3
        if (completionPercentage > 40) return 2
        if (completionPercentage > 0) return 1
        return 0
    }

    if (categories.length === 0 || isPostGoLiveStepCompleted) {
        return null
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <Heading size="sm">Setup checklist</Heading>
                <div className={css.progress}>
                    <span>
                        <ProgressIcon
                            progress={getProgressBasedOnPercentage()}
                            className={css.progressIcon}
                        />
                    </span>
                    <Text size="sm" variant="bold">
                        {completionPercentage}% complete
                    </Text>
                    <div className={css.list} ref={dropdownRef}>
                        <div
                            className={css.actionButton}
                            onClick={() => {
                                setShowMarkAsCompleted(!showMarkAsCompleted)
                            }}
                        >
                            <Icon name="dots-meatballs-horizontal" size="sm" />
                        </div>
                        {showMarkAsCompleted && (
                            <div
                                className={css.listItem}
                                onClick={handleMarkAllAsCompleted}
                            >
                                <Icon name="circle-check" size="sm" />
                                <span>Mark all as completed</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className={css.tasksSection}>
                <CategoryList
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    tasksConfigByCategory={tasksConfigByCategory}
                />
                <CategoryContent
                    selectedCategoryTasks={selectedCategoryTasks}
                    shopName={shopName}
                    postGoLiveStepId={postGoLiveStepId}
                    shopType={shopType}
                />
            </div>

            <PostGoLiveModal
                isOpen={showCompletionModal}
                handleOnClose={closeModal}
            />
        </div>
    )
}
