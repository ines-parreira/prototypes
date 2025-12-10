import type { MouseEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { NumberField, TextField } from '@gorgias/axiom'

type EditableFieldProps<T extends string | number> = {
    value?: T
    onValueChange: (value: T) => unknown
    placeholder?: string
    renderDisplay?: (value: T, onClick: () => void) => React.ReactNode
    validator?: (value: T) => string | undefined
    className?: string
} & (T extends string
    ? {
          type?: 'text'
          minValue?: never
          maxValue?: never
      }
    : {
          type: 'number'
          minValue?: number
          maxValue?: number
      })

export function EditableField<T extends string | number = string | number>(
    props: EditableFieldProps<T>,
) {
    const {
        value,
        onValueChange,
        placeholder = '+ Add',
        renderDisplay,
        validator,
        className,
        type = 'text',
        minValue,
        maxValue,
    } = props

    const [inputValue, setInputValue] = useState<T | undefined>(value)
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
        (value: T) => {
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

        const finalValue =
            type === 'text' && typeof inputValue === 'string'
                ? inputValue.trim()
                : inputValue

        if (finalValue === value || (!finalValue && !value)) {
            setIsEditing(false)
            setError(undefined)
            return
        }

        if (validator) {
            const validationError = validator(finalValue as string & number)
            if (validationError) {
                setError(validationError)
                return
            }
        }

        setError(undefined)
        setInputValue(finalValue as T)
        onValueChange(finalValue as T)
        setIsEditing(false)
    }, [inputValue, value, validator, onValueChange, type])

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
        if (type === 'number') {
            return (
                <NumberField
                    className={className}
                    value={inputValue as number}
                    onChange={(value) => handleChange(value as T)}
                    placeholder={placeholder}
                    size="sm"
                    variant="secondary"
                    onFocus={handleFieldFocus}
                    onBlur={handleFieldBlur}
                    autoFocus={isEditing}
                    error={error}
                    minValue={minValue}
                    maxValue={maxValue}
                />
            )
        }

        return (
            <TextField
                className={className}
                type="text"
                value={inputValue as string}
                onChange={(value) => handleChange(value as T)}
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
