import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { TextField } from '@gorgias/axiom'

interface EditableFieldProps {
    value?: string
    onValueChange: (value: string) => unknown
    placeholder?: string
    renderDisplay?: (value: string, onClick: () => void) => React.ReactNode
    validator?: (value: string) => string | undefined
    className?: string
}

export function EditableField({
    value,
    onValueChange,
    placeholder = '+ Add',
    renderDisplay,
    validator,
    className,
}: EditableFieldProps) {
    const [inputValue, setInputValue] = useState<string | undefined>(value)
    const [isEditing, setIsEditing] = useState(false)
    const [error, setError] = useState<string | undefined>()
    const prevValueRef = useRef(value)

    useEffect(() => {
        if (
            !isEditing &&
            inputValue !== undefined &&
            value !== prevValueRef.current
        ) {
            setInputValue(value)
        }
        prevValueRef.current = value
    }, [value, isEditing, inputValue])

    const handleChange = useCallback(
        (value: string) => {
            setInputValue(value)
            if (error) {
                setError(undefined)
            }
        },
        [error],
    )

    const handleSubmit = useCallback(() => {
        if (inputValue === undefined) {
            setIsEditing(false)
            return
        }

        const trimmedValue = inputValue.trim()

        if (trimmedValue === value || (!trimmedValue && !value)) {
            setIsEditing(false)
            setError(undefined)
            return
        }

        if (validator) {
            const validationError = validator(trimmedValue)
            if (validationError) {
                setError(validationError)
                return
            }
        }

        setError(undefined)
        setInputValue(trimmedValue)
        onValueChange(trimmedValue)
        setIsEditing(false)
    }, [inputValue, value, validator, onValueChange])

    const handleClick = useCallback((e?: MouseEvent) => {
        e?.preventDefault()
        setIsEditing(true)
    }, [])

    const handleFieldFocus = useCallback(() => {
        setIsEditing(true)
    }, [])

    const handleFieldBlur = useCallback(() => {
        setIsEditing(false)
        handleSubmit()
    }, [handleSubmit])

    if (!renderDisplay || isEditing || error || !inputValue) {
        return (
            <TextField
                className={className}
                type="text"
                value={inputValue}
                onChange={handleChange}
                placeholder={placeholder}
                size="sm"
                variant="secondary"
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
                autoFocus={isEditing}
                error={error}
            />
        )
    }

    return <>{renderDisplay(inputValue ?? value, handleClick)}</>
}
