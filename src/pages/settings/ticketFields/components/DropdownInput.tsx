import React, {memo, useCallback, useState} from 'react'
import uniqueId from 'lodash/uniqueId'
import {Label} from '@gorgias/ui-kit'

import Caption from 'pages/common/forms/Caption/Caption'
import {DROPDOWN_NESTING_DELIMITER} from 'models/customField/constants'
import Button from 'pages/common/components/button/Button'
import Tooltip from 'pages/common/components/Tooltip'
import {
    CustomField,
    CustomFieldInput,
    CustomFieldValue,
} from 'models/customField/types'
import DropdownCSVImport from './DropdownCSVImport'
import DropdownInputRow from './DropdownInputRow'

import css from './DropdownInput.less'

interface DropdownInputProps {
    field: CustomField | CustomFieldInput
    value: CustomFieldValue[]
    onChange: (value: string[]) => void
}

interface InternalValue {
    value: string
    id: string
    error?: string
}

function validate(
    value: CustomFieldValue,
    index: number,
    values: CustomFieldValue[]
): string | undefined {
    // Empty strings are considered valid
    if (!value) {
        return undefined
    }

    // Maximum 5 levels of nesting for individual choices
    if (
        typeof value === 'string' &&
        value.split(DROPDOWN_NESTING_DELIMITER).length > 5
    ) {
        return 'Choices cannot have more than 5 levels of nesting.'
    }

    for (let i = 0; i < values.length; ++i) {
        if (i !== index && values[i] === value) {
            return 'This value already exists. Please use unique values.'
        }
    }

    return undefined
}

export function DropdownInput({field, value, onChange}: DropdownInputProps) {
    const [isImportOpen, setImportOpen] = useState(false)

    // Generate an internal ID for all values to handle drag and drop
    const [values, setValues] = useState<InternalValue[]>(
        value.concat(['']).map((val: CustomFieldValue, index: number) => ({
            value: val.toString(),
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
            <span className={css.formLabelWithTooltip}>
                <Label htmlFor="settings.choices" isRequired>
                    Dropdown values
                </Label>

                <span
                    id="custom-field-dropdown-tooltip-id"
                    className="material-icons-outlined ml-2"
                >
                    info
                </span>
                <Tooltip target="custom-field-dropdown-tooltip-id">
                    Max 2,000 values and 5 nested children levels allowed.
                </Tooltip>

                <Button
                    onClick={() => setImportOpen(true)}
                    fillStyle="ghost"
                    size="small"
                    className={css.import}
                >
                    Import from CSV
                </Button>
            </span>

            {values.map((value, index: number) => (
                <DropdownInputRow
                    key={value.id}
                    field={field}
                    value={value.value}
                    error={value.error}
                    onChange={setValue}
                    onRemove={removeValue}
                    position={index}
                    id={value.id}
                    nextId={values[index + 1]?.id}
                    onHover={handleHover}
                    onDrop={handleDrop}
                    isLast={index === values.length - 1}
                />
            ))}
            <Caption className={css.lastInput}>
                Type {DROPDOWN_NESTING_DELIMITER} symbol to add a new child
                level.{' '}
                <a
                    href="https://docs.gorgias.com/en-US/215327-755feceee342410d80f5cde55e8e4f46#how-to-define-your-fields-to-generate-insights-efficiently"
                    rel="noopener noreferrer"
                    target="_blank"
                >
                    See examples
                </a>
            </Caption>

            <DropdownCSVImport
                isOpen={isImportOpen}
                onImport={(values) => {
                    customSetValues(() => {
                        return values.map((value: string) => ({
                            value,
                            id: uniqueId('dropdown-choice-'),
                        }))
                    })
                }}
                onClose={() => setImportOpen(false)}
                needsConfirmation={values.length > 1}
            />
        </>
    )
}

export default memo(DropdownInput)
