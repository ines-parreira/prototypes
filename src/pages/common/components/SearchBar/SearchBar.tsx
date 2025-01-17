import React, {useState} from 'react'

import css from 'pages/common/components/SearchBar/SearchBar.less'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'

export type SearchBarProps = {
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    placeholder?: string
    label?: string
}

export const SearchBar = ({
    value: controlledValue,
    onChange,
    defaultValue = '',
    placeholder,
    label = 'Search',
}: SearchBarProps) => {
    const isControlled = typeof controlledValue !== 'undefined'

    const [internalValue, setInternalValue] = useState(defaultValue)

    const value = isControlled ? controlledValue : internalValue

    const handleChange = (nextValue: string) => {
        if (onChange) {
            onChange(nextValue)
        }

        if (!controlledValue) {
            setInternalValue(nextValue)
        }
    }

    return (
        <TextInput
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            aria-label={label}
            prefix={<IconInput icon="search" />}
            suffix={
                value && (
                    <button
                        className={css.clearButton}
                        onClick={() => handleChange('')}
                        type="button"
                        title="Clear"
                    >
                        <IconInput icon="close" />
                    </button>
                )
            }
        />
    )
}
