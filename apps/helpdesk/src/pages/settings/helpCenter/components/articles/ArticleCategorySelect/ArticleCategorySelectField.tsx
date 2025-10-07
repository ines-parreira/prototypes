import React, { useMemo, useState } from 'react'

import classNames from 'classnames'

import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Option } from 'pages/common/forms/SelectField/types'

import { NO_CATEGORY_OPTION } from './hooks/useCategoriesOptions'

import css from './ArticleCategorySelect.less'

interface ArticleCategorySelectProps {
    categoryId: number | null
    categoryTitlesById: Record<string, string>
    options: Option[]
    onChange?: (value: number | null) => void
    isDisabled?: boolean
}

const ArticleCategorySelectField = ({
    categoryId,
    categoryTitlesById,
    options,
    onChange,
    isDisabled = false,
}: ArticleCategorySelectProps): JSX.Element => {
    const [selectFieldClassName, setSelectFieldClassName] = useState<string>('')

    const selectedCategoryTitle = useMemo(
        () =>
            categoryTitlesById[categoryId || NO_CATEGORY_OPTION] ||
            '- No Category -',

        [categoryId, categoryTitlesById],
    )

    const handleOnSearchChange = (text: string) => {
        setSelectFieldClassName(text ? css.filteredCategories : '')
    }

    return (
        <SelectField
            allowCustomValue
            fullWidth
            disabled={isDisabled}
            value={selectedCategoryTitle}
            onChange={(value) => {
                if (!onChange) {
                    return
                }
                if (value === NO_CATEGORY_OPTION) {
                    onChange(null)
                } else if (typeof value === 'number') {
                    onChange(value)
                }
            }}
            onSearchChange={handleOnSearchChange}
            options={options}
            dropdownMenuClassName={classNames(
                css.categoryDropdown,
                selectFieldClassName,
            )}
            className={classNames(css.select, {
                [css.noCategory]: categoryId === null,
            })}
        />
    )
}

export default ArticleCategorySelectField
