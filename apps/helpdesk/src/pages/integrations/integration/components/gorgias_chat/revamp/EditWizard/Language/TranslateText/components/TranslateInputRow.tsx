import { useState } from 'react'

import { TextAreaField } from '@gorgias/axiom'

import css from './TranslateInputRow.less'

type Props = {
    value: string
    maxLength: number
    keyName: string
    defaultValue: string
    isRequired: boolean
    saveValue: (key: string, value: string) => void
}

export const TranslateInputRow = ({
    value,
    maxLength,
    keyName,
    defaultValue,
    isRequired,
    saveValue,
}: Props) => {
    const [localValue, setLocalValue] = useState(value)

    const handleChange = (newValue: string) => {
        setLocalValue(newValue)
        saveValue(keyName, newValue)
    }

    return (
        <div className={css.row}>
            <TextAreaField
                value={defaultValue ?? ''}
                isDisabled
                onChange={() => {}}
                aria-label="Default text"
                autoResize
            />
            <TextAreaField
                value={localValue}
                maxLength={maxLength}
                isRequired={isRequired}
                placeholder={defaultValue}
                onChange={handleChange}
                aria-label={defaultValue}
                autoResize
            />
        </div>
    )
}
