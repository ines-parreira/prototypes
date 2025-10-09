import { useState } from 'react'

import { Heading, Text } from '@gorgias/axiom'

import loadingStaticIcon from 'assets/img/ai-agent/loading.svg'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountId } from 'state/currentAccount/selectors'

import { CategoryContent } from './CategoryContent'
import { CategoryList } from './CategoryList'
import { useGetSetupTasksConfigByCategory } from './hooks/useGetSetupTasksConfigByCategory'
import { TaskConfig, TasksCategoryKey } from './types'

import css from './SetupTaskSection.less'

export const SetupTaskSection = ({
    shopName,
    shopType,
}: {
    shopName: string
    shopType: string
}) => {
    const accountId = useAppSelector(getCurrentAccountId)

    const { tasksConfigByCategory, completionPercentage, postGoLiveStepId } =
        useGetSetupTasksConfigByCategory({
            accountId,
            shopName,
            shopType,
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

    if (categories.length === 0) {
        return null
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <Heading>Setup checklist</Heading>
                <div className={css.progress}>
                    <img
                        src={loadingStaticIcon}
                        alt="loading icon"
                        width="16px"
                    />
                    <Text size="sm" variant="bold">
                        {completionPercentage}% complete
                    </Text>
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
                />
            </div>
        </div>
    )
}
