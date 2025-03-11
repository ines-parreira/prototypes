import React, { useMemo } from 'react'

import _noop from 'lodash/noop'

import { Label } from '@gorgias/merchant-ui-kit'

import Button from 'pages/common/components/button/Button'

import { Input } from '../types'
import ActionFormInput from './ActionFormInput'

import css from './ActionFormInputs.less'

type Props = {
    isDisabled?: boolean
    templateInputs?: Input[]
    semiImmutableInputs?: Input[]
    inputs: Input[]
    onDelete: (id: string) => void
    onAdd: () => void
    onChange: (input: Input) => void
    onNameBlur?: (id: Input['id']) => void
    onInstructionsBlur?: (id: Input['id']) => void
    appName?: string
    label?: string
    description?: string | null
    showOptionalFlag?: boolean
    errors?: Record<
        string,
        {
            name?: string
            instructions?: string
        }
    >
}

const ActionFormInputs = ({
    isDisabled,
    templateInputs = [],
    semiImmutableInputs = [],
    inputs,
    onAdd,
    onDelete,
    onChange,
    appName,
    label = 'Collect information from customers to use as variables in this Action',
    description = 'Note: AI Agent already has access to the customer’s email address and order number.',
    errors,
    onNameBlur,
    onInstructionsBlur,
    showOptionalFlag = false,
}: Props) => {
    const semiImmutableInputIdsSet = useMemo(
        () => new Set(semiImmutableInputs.map((input) => input.id)),
        [semiImmutableInputs],
    )

    return (
        <div className={css.container}>
            <Label>{label}</Label>
            {description && <div>{description}</div>}
            {templateInputs.map((input) => (
                <ActionFormInput
                    key={input.id}
                    input={input}
                    onChange={_noop}
                    onDelete={_noop}
                    isDisabled
                    disabledTooltip={
                        appName
                            ? `This information is required by ${appName} to perform this Action.`
                            : undefined
                    }
                />
            ))}
            {inputs.map((input) => (
                <ActionFormInput
                    key={input.id}
                    input={input}
                    onChange={(nextValue) => {
                        onChange(nextValue)
                    }}
                    onDelete={() => {
                        onDelete(input.id)
                    }}
                    isDisabled={isDisabled}
                    isSemiImmutable={semiImmutableInputIdsSet.has(input.id)}
                    error={errors?.[input.id]}
                    onNameBlur={() => {
                        onNameBlur?.(input.id)
                    }}
                    onInstructionsBlur={() => {
                        onInstructionsBlur?.(input.id)
                    }}
                    showOptionalFlag={showOptionalFlag}
                />
            ))}
            {(inputs.length > 0 || templateInputs.length > 0) && (
                <div className={css.footer}>
                    <span>Data type/format</span>
                    <span>Variable name</span>
                    <span>Variable description</span>
                    {showOptionalFlag && <span>Optional</span>}
                </div>
            )}
            <div>
                <Button
                    intent="secondary"
                    isDisabled={isDisabled}
                    onClick={onAdd}
                    size="small"
                    leadingIcon="add"
                >
                    Add Variable
                </Button>
            </div>
        </div>
    )
}

export default ActionFormInputs
