import type { RefObject } from 'react'
import { useMemo } from 'react'

import {
    Label,
    ListItem,
    Select,
    SelectTrigger,
    TextField,
} from '@gorgias/axiom'

import type { LocaleCode } from 'models/helpCenter/types'

import useCategoriesOptions from './hooks/useCategoriesOptions'
import type { CategoryOption } from './hooks/useCategoriesOptions'

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
    const options = useCategoriesOptions({ locale })

    const selectedOption = useMemo(() => {
        return options.find((opt) => opt.value === categoryId) || options[0]
    }, [options, categoryId])

    const handleSelect = (option: CategoryOption) => {
        if (onChange) {
            onChange(option.value)
        }
    }

    return (
        <div className={css.wrapper}>
            <Label>Category</Label>
            <Select<CategoryOption>
                trigger={({ ref, selectedText, isOpen }) => (
                    <SelectTrigger>
                        <TextField
                            inputRef={ref as RefObject<HTMLInputElement>}
                            value={selectedText}
                            isDisabled={isDisabled}
                            isFocused={isOpen}
                            trailingSlot={
                                isOpen
                                    ? 'arrow-chevron-up'
                                    : 'arrow-chevron-down'
                            }
                        />
                    </SelectTrigger>
                )}
                items={options}
                selectedItem={selectedOption}
                onSelect={handleSelect}
                aria-label="Select article category"
                isDisabled={isDisabled}
                isSearchable={options.length > 1}
                maxWidth={266}
            >
                {(option: CategoryOption) => (
                    <ListItem
                        id={option.id}
                        label={option.textValue}
                        textValue={option.textValue}
                    />
                )}
            </Select>
        </div>
    )
}

export default ArticleCategorySelect
