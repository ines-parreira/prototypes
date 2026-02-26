import cn from 'classnames'

import { Icon } from '@gorgias/axiom'

import type {
    TasksCategory,
    TasksCategoryKey,
    TasksConfigByCategory,
} from './types'

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
                    <Icon
                        name={
                            isCategoryCompleted(category)
                                ? 'circle-check'
                                : 'shape-circle'
                        }
                        size="md"
                        color="var(--content-neutral-secondary)"
                    />
                    <div>{category}</div>
                </div>
            ))}
        </div>
    )
}
