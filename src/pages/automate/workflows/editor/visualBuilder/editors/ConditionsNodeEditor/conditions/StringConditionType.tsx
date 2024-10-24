import {produce} from 'immer'
import React, {useRef, useState} from 'react'

import {
    ConditionSchema,
    DoesNotExistSchema,
    ExistsSchema,
    StringSchema,
} from 'pages/automate/workflows/models/conditions.types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import InputField from 'pages/common/forms/input/InputField'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'

import css from '../ConditionsNodeEditor.less'

type Props = {
    condition: Exclude<StringSchema, ExistsSchema | DoesNotExistSchema>
    onChange: (condition: ConditionSchema) => void
    shouldShowErrors?: boolean
    isDisabled?: boolean
    options?: {
        value: string | null
        label: string
    }[]
}

export const StringConditionType = ({
    condition,
    onChange,
    shouldShowErrors,
    isDisabled,
    options,
}: Props) => {
    const key = Object.keys(condition)[0] as AllKeys<typeof condition>
    const schema = condition[key]

    const [isOpen, setIsOpen] = useState(false)
    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    if (!schema) {
        return null
    }

    if (options?.length) {
        const value = schema[1]
        const label = options.find((option) => option.value === value)?.label
        const hasError = shouldShowErrors && !label

        return (
            <SelectInputBox
                floating={floatingRef}
                label={label}
                onToggle={setIsOpen}
                ref={targetRef}
                hasError={hasError}
                placeholder="value"
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={targetRef}
                            value={value}
                        >
                            <DropdownBody>
                                {options.map((option) => (
                                    <DropdownItem
                                        key={option.label}
                                        option={option}
                                        onClick={(nextValue) => {
                                            onChange(
                                                produce(condition, (draft) => {
                                                    const schema = draft[key]

                                                    if (!schema) {
                                                        return
                                                    }

                                                    schema[1] = nextValue
                                                })
                                            )
                                        }}
                                        shouldCloseOnSelect
                                    />
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        )
    }

    const value = String(schema[1] ?? '')
    const hasError = shouldShowErrors && !value

    return (
        <InputField
            className={css.input}
            placeholder="value"
            onChange={(nextValue) => {
                onChange(
                    produce(condition, (draft) => {
                        const schema = draft[key]

                        if (!schema) {
                            return
                        }

                        schema[1] = nextValue
                    })
                )
            }}
            error={hasError && 'Enter a value'}
            hasError={hasError}
            value={value}
            isDisabled={isDisabled}
        />
    )
}
