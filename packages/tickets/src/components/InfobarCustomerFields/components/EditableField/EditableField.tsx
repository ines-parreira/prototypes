import { useCallback, useState } from 'react'

import { NumberField, TextAreaField, TextField } from '@gorgias/axiom'

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
    ?
          | {
                type?: 'text'
                minValue?: never
                maxValue?: never
            }
          | {
                type?: 'textarea'
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

    const handleValue = useCallback(() => {
        if (value === undefined) {
            return [true]
        }

        const finalValue =
            (type === 'text' || type === 'textarea') &&
            typeof value === 'string'
                ? value.trim()
                : value

        if (validator) {
            const validationError = validator(finalValue as string & number)
            if (validationError) {
                setError(validationError)
                return [false]
            }
        }

        if (finalValue === value || (!finalValue && !value)) {
            setError(undefined)
            return [true, finalValue]
        }

        setError(undefined)
        onValueChange(finalValue as T)
        return [true, finalValue]
    }, [value, validator, onValueChange, type])

    const handleFieldBlur = useCallback(() => {
        const [isValid, value] = handleValue()
        if (isValid) {
            onBlur?.(value as T)
        }
    }, [handleValue, onBlur, value])

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

    if (type === 'textarea') {
        return (
            <TextAreaField
                id={id}
                className={className}
                aria-label={ariaLabel ?? placeholder}
                value={value as string}
                onChange={(value) => handleChange(value as T)}
                placeholder={placeholder}
                size="sm"
                variant="secondary"
                onBlur={handleFieldBlur}
                autoFocus={autoFocus}
                error={error}
                isInvalid={isInvalid}
                autoResize
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
