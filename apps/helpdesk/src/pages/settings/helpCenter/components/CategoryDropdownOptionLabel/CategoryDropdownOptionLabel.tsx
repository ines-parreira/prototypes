import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import type { Category } from 'models/helpCenter/types'
import { getCategoriesById } from 'state/entities/helpCenter/categories'

import css from './CategoryDropdownOptionLabel.less'

export const getParentsInfo = (
    category: Category,
    categoriesById: Record<string, Category>,
): string => {
    const parents: Category[] = []

    const getParents = (category: Category) => {
        const parentId = category.translation?.parent_category_id
        if (parentId) {
            parents.push(categoriesById[parentId])
            getParents(categoriesById[parentId])
        }
    }
    getParents(category)

    const parentsString =
        parents
            .reverse()
            .map((category) => category.translation?.title)
            .join(' > ') || '< Top Level Category >'

    return parentsString
}

export const CategoryDropdownOptionLabel = ({
    category,
}: {
    category: Category
}) => {
    const categoriesById = useAppSelector(getCategoriesById)

    const parentsString = categoriesById[category.id]
        ? getParentsInfo(category, categoriesById)
        : ''
    return (
        <div>
            <div className={css.category}>{category.translation?.title}</div>
            <div className={classnames(css.parents, css.trimTextFromTheLeft)}>
                {parentsString}
            </div>
        </div>
    )
}
