import { useCallback, useState } from 'react'

import { NumberField, TextField } from '@gorgias/axiom'

type EditableFieldProps<T extends string | number> = {
    id?: string
    value: T | undefined
    onValueChange: (value: T) => unknown
    onBlur?: (value: T) => void
    placeholder?: string
    validator?: (value: T) => string | undefined
    className?: string
    autoFocus?: boolean
    ariaLabel?: string
    isInvalid?: boolean
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
        id,
        value,
        onValueChange,
        placeholder = '+ Add',
        validator,
        className,
        type = 'text',
        minValue,
        maxValue,
        autoFocus,
        onBlur,
        ariaLabel,
        isInvalid,
    } = props

    const [error, setError] = useState<string | undefined>()

    const handleChange = useCallback(
        (value: T) => {
            onValueChange(value)
            if (error) {
                setError(undefined)
            }
        },
        [error, onValueChange],
    )

    const handleSubmit = useCallback(() => {
        if (value === undefined) {
            return true
        }

        const finalValue =
            type === 'text' && typeof value === 'string' ? value.trim() : value

        if (validator) {
            const validationError = validator(finalValue as string & number)
            if (validationError) {
                setError(validationError)
                return false
            }
        }

        if (finalValue === value || (!finalValue && !value)) {
            setError(undefined)
            return true
        }

        setError(undefined)
        onValueChange(finalValue as T)
        return true
    }, [value, validator, onValueChange, type])

    const handleFieldBlur = useCallback(() => {
        const success = handleSubmit()
        if (success) {
            onBlur?.(value as T)
        }
    }, [handleSubmit, onBlur, value])

    if (type === 'number') {
        return (
            <NumberField
                aria-label={ariaLabel ?? placeholder}
                id={id}
                className={className}
                value={value as number}
                onChange={(value) => handleChange(value as T)}
                placeholder={placeholder}
                size="sm"
                variant="secondary"
                autoFocus={autoFocus}
                error={error}
                minValue={minValue}
                maxValue={maxValue}
                isInvalid={isInvalid}
            />
        )
    }

    return (
        <TextField
            id={id}
            className={className}
            aria-label={ariaLabel ?? placeholder}
            type="text"
            value={value as string}
            onChange={(value) => handleChange(value as T)}
            placeholder={placeholder}
            size="sm"
            variant="secondary"
            onBlur={handleFieldBlur}
            autoFocus={autoFocus}
            error={error}
            isInvalid={isInvalid}
        />
    )
}
