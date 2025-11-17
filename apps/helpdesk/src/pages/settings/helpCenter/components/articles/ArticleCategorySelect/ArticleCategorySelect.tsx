import React, { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import type { LocaleCode } from 'models/helpCenter/types'
import ArticleCategorySelectField from 'pages/settings/helpCenter/components/articles/ArticleCategorySelect/ArticleCategorySelectField'
import { getCategoriesById } from 'state/entities/helpCenter/categories'

import useCategoriesOptions from './hooks/useCategoriesOptions'

interface ArticleCategorySelectProps {
    locale: LocaleCode
    categoryId: number | null
    onChange?: (value: number | null) => void
    isDisabled?: boolean
}

const ArticleCategorySelect = ({
    locale,
    categoryId,
    onChange,
    isDisabled = false,
}: ArticleCategorySelectProps): JSX.Element => {
    const options = useCategoriesOptions({ locale })
    const categoriesById = useAppSelector(getCategoriesById)

    const categoryTitlesById = useMemo(() => {
        const titlesById: Record<string, string> = {}

        for (const [id, category] of Object.entries(categoriesById)) {
            if (category.translation?.title) {
                titlesById[id] = category.translation.title
            }
        }

        return titlesById
    }, [categoriesById])

    return (
        <ArticleCategorySelectField
            categoryId={categoryId}
            categoryTitlesById={categoryTitlesById}
            options={options}
            onChange={onChange}
            isDisabled={isDisabled}
        />
    )
}

export default ArticleCategorySelect
