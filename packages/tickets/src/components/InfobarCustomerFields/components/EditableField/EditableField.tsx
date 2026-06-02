import type { ClipboardEvent, KeyboardEvent } from 'react'
import { useCallback, useMemo, useState } from 'react'

import { isMacOs } from '@repo/utils'

import {
    NumberField,
    Text,
    TextAreaField,
    TextField,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import css from './EditableField.less'

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
    isReadOnly?: boolean
    showTooltip?: boolean
} & (T extends string
    ?
          | {
                type?: 'text'
                minValue?: never
                maxValue?: never
                maxRows?: never
            }
          | {
                type: 'textarea'
                minValue?: never
                maxValue?: never
                maxRows?: number
            }
    : {
          type: 'number'
          minValue?: number
          maxValue?: number
          maxRows?: never
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
        maxRows = 3,
        autoFocus,
        onBlur,
        ariaLabel,
        isInvalid,
        isReadOnly = false,
        showTooltip = false,
    } = props

    const [error, setError] = useState<string | undefined>()
    const [isFocused, setIsFocused] = useState(false)

    const handleChange = useCallback(
        (value: T) => {
            if (isReadOnly) {
                return
            }

            onValueChange(value)
            if (error) {
                setError(undefined)
            }
        },
        [error, isReadOnly, onValueChange],
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
        setIsFocused(false)

        if (isReadOnly) {
            return
        }

        const [isValid, value] = handleValue()
        if (isValid) {
            onBlur?.(value as T)
        }
    }, [handleValue, isReadOnly, onBlur, value])

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            if (isReadOnly) {
                return
            }

            const isEnterKey = event.key === 'Enter'
            const hasModifier = isMacOs ? event.metaKey : event.ctrlKey

            const shouldBlur =
                type === 'textarea' ? isEnterKey && hasModifier : isEnterKey

            if (shouldBlur) {
                event.preventDefault()
                const [isValid] = handleValue()
                if (isValid) {
                    event.currentTarget?.blur()
                }
            }
        },
        [type, isReadOnly, handleValue],
    )

    const handleNumberPaste = useCallback(
        (event: ClipboardEvent<HTMLInputElement>) => {
            if (type !== 'number') {
                return
            }

            if (typeof event.clipboardData?.getData !== 'function') {
                return
            }

            const pastedText = event.clipboardData.getData('text/plain').trim()
            if (!pastedText.startsWith('#')) {
                return
            }

            // Remove the leading hash and any whitespace.
            // Enable users to copy/paste customer IDs (#12345 format) in number fields easily
            const normalizedValue = pastedText.replace(/^#\s*/, '')
            if (!normalizedValue) {
                return
            }

            const parsedValue = Number(normalizedValue)
            if (Number.isNaN(parsedValue)) {
                return
            }

            event.preventDefault()
            handleChange(parsedValue as T)
        },
        [handleChange, type],
    )

    const tooltipContent = useMemo(() => value?.toString(), [value])

    if (type === 'number') {
        return (
            <Tooltip
                isDisabled={!showTooltip || isFocused || !tooltipContent}
                placement="left"
                trigger={
                    <NumberField
                        aria-label={ariaLabel ?? placeholder}
                        id={id}
                        className={className}
                        value={(value ?? null) as number}
                        formatOptions={{ useGrouping: false }}
                        onChange={(value) => handleChange(value as T)}
                        placeholder={placeholder}
                        size="sm"
                        variant="secondary"
                        autoFocus={autoFocus}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        onPaste={handleNumberPaste}
                        error={error}
                        minValue={minValue}
                        maxValue={maxValue}
                        isInvalid={isInvalid}
                        isReadOnly={isReadOnly}
                    />
                }
            >
                <TooltipContent title={tooltipContent} />
            </Tooltip>
        )
    }

    if (type === 'textarea') {
        return (
            <Tooltip
                isDisabled={!showTooltip || isFocused || !tooltipContent}
                placement="left"
                trigger={
                    <TextAreaField
                        id={id}
                        className={className}
                        aria-label={ariaLabel ?? placeholder}
                        value={value as string}
                        onChange={(value) => handleChange(value as T)}
                        placeholder={placeholder}
                        size="sm"
                        variant="secondary"
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleFieldBlur}
                        onKeyDown={handleKeyDown}
                        autoFocus={autoFocus}
                        error={error}
                        isInvalid={isInvalid}
                        isReadOnly={isReadOnly}
                        autoResize
                        maxRows={maxRows}
                    />
                }
            >
                <TooltipContent>
                    <Text className={css.textAreaTooltipContent} size="sm">
                        {tooltipContent}
                    </Text>
                </TooltipContent>
            </Tooltip>
        )
    }

    return (
        <Tooltip
            isDisabled={!showTooltip || isFocused || !tooltipContent}
            placement="left"
            trigger={
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
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleFieldBlur}
                    onKeyDown={handleKeyDown}
                    autoFocus={autoFocus}
                    error={error}
                    isInvalid={isInvalid}
                    isReadOnly={isReadOnly}
                />
            }
        >
            <TooltipContent title={tooltipContent} />
        </Tooltip>
    )
}
