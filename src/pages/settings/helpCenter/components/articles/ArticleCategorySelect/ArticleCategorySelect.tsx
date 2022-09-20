import React, {useState} from 'react'
import classNames from 'classnames'

import useAppSelector from 'hooks/useAppSelector'
import {getCategoriesById} from 'state/entities/helpCenter/categories'
import {LocaleCode} from 'models/helpCenter/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'

import useCategoriesOptions, {
    NO_CATEGORY_OPTION,
} from './hooks/useCategoriesOptions'

import css from './ArticleCategorySelect.less'

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
    const options = useCategoriesOptions({locale})
    const categoriesById = useAppSelector(getCategoriesById)
    const [selectFieldClassName, setSelectFieldClassName] = useState<string>('')

    const selectOption = categoryId === null ? NO_CATEGORY_OPTION : categoryId

    const handleOnSearchChange = (text: string) => {
        setSelectFieldClassName(text ? css.filteredCategories : '')
    }

    return (
        <SelectField
            allowCustomValue
            fullWidth
            disabled={isDisabled}
            value={
                selectOption && categoriesById[selectOption]
                    ? categoriesById[selectOption].translation?.title
                    : '- No Category -'
            }
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
                selectFieldClassName
            )}
            className={classNames(css.select, {
                [css.noCategory]: categoryId === null,
            })}
        />
    )
}

export default ArticleCategorySelect
