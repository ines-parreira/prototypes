import cn from 'classnames'

import { Icon } from '@gorgias/axiom'

import { TasksCategory, TasksCategoryKey, TasksConfigByCategory } from './types'

import css from './CategoryList.less'

export const CategoryList = ({
    categories,
    selectedCategory,
    onSelectCategory,
    tasksConfigByCategory,
}: {
    categories: TasksCategory[]
    selectedCategory?: TasksCategoryKey | null
    onSelectCategory: (category: TasksCategory) => void
    tasksConfigByCategory?: Partial<TasksConfigByCategory> | null
}) => {
    const isCategoryCompleted = (category: TasksCategory) => {
        return tasksConfigByCategory?.[category]?.every(
            (task) => task.isCompleted,
        )
    }

    return (
        <div className={css.groupList}>
            {categories.map((category) => (
                <div
                    key={category}
                    className={cn(css.task, {
                        [css.selected]: selectedCategory === category,
                        [css.completed]: isCategoryCompleted(category),
                    })}
                    onClick={() => onSelectCategory(category)}
                >
                    {isCategoryCompleted(category) && (
                        <Icon name="circle-check" size="md" />
                    )}
                    <div>{category}</div>
                </div>
            ))}
        </div>
    )
}
