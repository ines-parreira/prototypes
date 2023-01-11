import React, {memo, useCallback, useState} from 'react'
import uniqueId from 'lodash/uniqueId'

import Caption from 'pages/common/forms/Caption/Caption'
import DropdownInputRow from './DropdownInputRow'

import css from './DropdownInput.less'

interface DropdownInputProps {
    value: string[]
    onChange: (value: string[]) => void
}

interface InternalValue {
    value: string
    id: string
    error?: string
}

function validate(
    value: string,
    index: number,
    values: string[]
): string | undefined {
    // Empty strings are considered valid
    if (!value) {
        return undefined
    }

    for (let i = 0; i < values.length; ++i) {
        if (i !== index && values[i] === value) {
            return 'This value already exists. Please use unique values.'
        }
    }

    return undefined
}

export function DropdownInput({value, onChange}: DropdownInputProps) {
    // Generate an internal ID for all values to handle drag and drop
    const [values, setValues] = useState<InternalValue[]>(
        value.concat(['']).map((val: string, index: number) => ({
            value: val,
            id: uniqueId('dropdown-choice-'),
            error: validate(val, index, value),
        }))
    )

    // Update the state and add an empty option at the end if necessary
    const customSetValues = useCallback(
        (setter: (values: InternalValue[]) => InternalValue[]) => {
            setValues((old: InternalValue[]) => {
                const next = setter(old.slice())

                // Add empty choice at the end
                if (next[next.length - 1].value) {
                    next.push({
                        value: '',
                        id: uniqueId('dropdown-choice-'),
                    })
                }

                // Notify parent component of change
                const withoutEmptyLastRow = !next[next.length - 1].value
                    ? next.slice(0, next.length - 1)
                    : next.slice()
                onChange(withoutEmptyLastRow.map((value) => value.value))

                return next
            })
        },
        [onChange]
    )

    const setValue = useCallback(
        (index: number, value: string) => {
            customSetValues((values: InternalValue[]) => {
                // Update current value and validation status
                values[index].value = value
                const allValues = values.map((v) => v.value)
                values[index].error = validate(value, index, allValues)

                // Check if changing this value fixed other validation errors
                for (let i = 0; i < values.length; ++i) {
                    if (i === index || !values[i].error) {
                        continue
                    }
                    values[i].error = validate(values[i].value, i, allValues)
                }

                return values
            })
        },
        [customSetValues]
    )
    const removeValue = useCallback(
        (index: number) => {
            customSetValues((values: InternalValue[]) => {
                values.splice(index, 1)
                return values
            })
        },
        [customSetValues]
    )

    const handleHover = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            customSetValues((values: InternalValue[]) => {
                const original = values[dragIndex]
                values.splice(dragIndex, 1)
                values.splice(hoverIndex, 0, original)
                return values
            })
        },
        [customSetValues]
    )
    const handleDrop = useCallback(() => {
        customSetValues((values: InternalValue[]) => values)
    }, [customSetValues])

    return (
        <>
            {values.map((value, index: number) => (
                <DropdownInputRow
                    key={value.id}
                    value={value.value}
                    error={value.error}
                    onChange={setValue}
                    onRemove={removeValue}
                    position={index}
                    id={value.id}
                    onHover={handleHover}
                    onDrop={handleDrop}
                    isLast={index === values.length - 1}
                />
            ))}
            <Caption className={css.lastInput}>
                Use :: to separate nesting levels (e.g.
                Category::Subcategory::Item). Max 5 nesting levels allowed.
            </Caption>
        </>
    )
}

export default memo(DropdownInput)
