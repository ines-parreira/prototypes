import React from 'react'
import classnames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {Category} from 'models/helpCenter/types'
import {getCategoriesById} from 'state/entities/helpCenter/categories'
import Tooltip from 'pages/common/components/Tooltip'

import css from './CategoryDropdownOptionLabel.less'

export const getParentsInfo = (
    category: Category,
    categoriesById: Record<string, Category>
): string => {
    const parents: Category[] = []

    const getParents = (category: Category) => {
        const parentId = category.parent_category_id
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
    fullText?: boolean
}) => {
    const categoriesById = useAppSelector(getCategoriesById)

    const parentsString = categoriesById[category.id]
        ? getParentsInfo(category, categoriesById)
        : ''
    return (
        <>
            <div id={`categoryOption-${category.id}`}>
                <div className={css['category']}>
                    {category.translation?.title}
                </div>
                <div
                    className={classnames(
                        css['parents'],
                        css['trimTextFromTheLeft']
                    )}
                >
                    {parentsString}
                </div>
            </div>
            <Tooltip
                placement="top-start"
                target={`categoryOption-${category.id}`}
                delay={{show: 1000, hide: 200}}
                boundariesElement="body"
            >
                <div className={css['tooltip']}>
                    <div className={css['category']}>
                        {category.translation?.title}
                    </div>
                    <div className={classnames(css['parents'])}>
                        {parentsString}
                    </div>
                </div>
            </Tooltip>
        </>
    )
}
