import React, { useState } from 'react'

import EmojiSelect from 'pages/common/components/ViewTable/EmojiSelect/EmojiSelect'

export type EmojiInputProps = {
    value?: string
    defaultValue?: string
    onChange?: (value: string) => void
    name?: string
    className?: string
}

export const EmojiInput = ({
    value: controlledValue,
    onChange,
    defaultValue = '',
    name,
    className,
}: EmojiInputProps) => {
    const isControlled = typeof controlledValue !== 'undefined'

    const [internalValue, setInternalValue] = useState(defaultValue)

    const value = isControlled ? controlledValue : internalValue

    const handleChange = (nextValue: string) => {
        if (onChange) {
            onChange(nextValue)
        }

        if (!isControlled) {
            setInternalValue(nextValue)
        }
    }

    return (
        <>
            <input type="hidden" value={value} name={name} />
            <EmojiSelect
                emoji={value}
                onEmojiSelect={handleChange}
                onEmojiClear={() => handleChange('')}
                className={className}
            />
        </>
    )
}
