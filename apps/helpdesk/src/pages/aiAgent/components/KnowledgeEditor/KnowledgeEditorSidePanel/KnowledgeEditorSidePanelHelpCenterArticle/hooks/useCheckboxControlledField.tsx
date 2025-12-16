import { useEffect, useState } from 'react'

export type UseCheckboxControlledFieldArgs = {
    defaultValue: string
    draftValue: string
    onCommit?: (value: string | null) => void
    defaultChecked?: boolean
}

export type UseCheckboxControlledFieldResult = {
    isChecked: boolean
    value: string
    isDisabled: boolean
    isRequired: boolean
    showError: boolean
    toggleChecked: () => boolean
    handleChange: (value: string) => void
    handleBlur: () => void
    hasError: boolean
}

export function useCheckboxControlledField({
    defaultValue,
    draftValue,
    onCommit,
    defaultChecked = true,
}: UseCheckboxControlledFieldArgs): UseCheckboxControlledFieldResult {
    const [isChecked, setIsChecked] = useState<boolean>(defaultChecked)
    const [inputValue, setInputValue] = useState<string>(
        defaultChecked ? '' : draftValue || '',
    )
    const [hasError, setHasError] = useState<boolean>(false)

    useEffect(() => {
        if (draftValue) {
            setIsChecked(false)
            setInputValue(draftValue)
        } else {
            setIsChecked(defaultChecked)
            setInputValue('')
        }
    }, [draftValue, defaultChecked])

    const toggleChecked = () => {
        const next = !isChecked
        setIsChecked(next)
        if (next) {
            setHasError(false)
            onCommit?.(null)
        } else {
            setInputValue(draftValue || '')
            setHasError(false)
        }
        return next
    }

    const handleChange = (value: string) => {
        setInputValue(value)

        if (value.trim()) {
            if (hasError) {
                setHasError(false)
            }
            onCommit?.(value)
        }
    }

    const handleBlur = () => {
        if (!isChecked) {
            if (!inputValue.trim()) {
                setHasError(true)
            }
        }
    }

    const value = isChecked ? defaultValue : inputValue

    const isDisabled = isChecked
    const isRequired = !isChecked
    const showError = hasError && !isChecked

    return {
        isChecked,
        value,
        isDisabled,
        isRequired,
        showError,
        toggleChecked,
        handleChange,
        handleBlur,
        hasError,
    }
}
