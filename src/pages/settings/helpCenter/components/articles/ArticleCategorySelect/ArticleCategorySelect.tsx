import React from 'react'
import classNames from 'classnames'

import {LocaleCode} from '../../../../../../models/helpCenter/types'
import SelectField from '../../../../../common/forms/SelectField/SelectField'

import useCategoriesOptions, {
    NO_CATEGORY_OPTION,
} from './hooks/useCategoriesOptions'

import css from './ArticleCategorySelect.less'

interface ArticleCategorySelectProps {
    locale: LocaleCode
    categoryId: number | null | undefined
    helpCenterId: number
    onChange?: (value: number | null) => void
}

const ArticleCategorySelect = ({
    locale,
    categoryId,
    helpCenterId,
    onChange,
}: ArticleCategorySelectProps): JSX.Element => {
    const options = useCategoriesOptions({locale, helpCenterId})

    const selectOption = categoryId === null ? NO_CATEGORY_OPTION : categoryId

    return (
        <SelectField
            fullWidth
            value={selectOption}
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
            options={options}
            className={classNames(css.select, {
                [css.noCategory]: categoryId === null,
            })}
        />
    )
}

export default ArticleCategorySelect
