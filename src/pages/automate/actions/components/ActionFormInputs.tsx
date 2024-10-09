import React, {useMemo} from 'react'
import {Label} from '@gorgias/ui-kit'
import _noop from 'lodash/noop'

import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'

import {Input} from '../types'
import ActionFormInput from './ActionFormInput'

import css from './ActionFormInputs.less'

type Props = {
    isDisabled?: boolean
    templateInputs?: Input[]
    semiImmutableInputs?: Input[]
    inputs: Input[]
    onDelete: (index: number) => void
    onAdd: () => void
    onChange: (input: Input, index: number) => void
    appName?: string
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
}: Props) => {
    const semiImmutableInputIdsSet = useMemo(
        () => new Set(semiImmutableInputs.map((input) => input.id)),
        [semiImmutableInputs]
    )

    return (
        <div>
            <Label className={css.label}>
                Collect information from customers to use as variables in this
                Action
            </Label>
            <div className={css.description}>
                Note: AI Agent already has access to the customer’s email
                address and order number.
            </div>
            <div className={css.inputs}>
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
                {inputs.map((input, index) => (
                    <ActionFormInput
                        key={input.id}
                        input={input}
                        onChange={(nextValue) => {
                            onChange(nextValue, index)
                        }}
                        onDelete={() => {
                            onDelete(index)
                        }}
                        isDisabled={isDisabled}
                        isSemiImmutable={semiImmutableInputIdsSet.has(input.id)}
                    />
                ))}
                {inputs.length > 0 && (
                    <div className={css.footer}>
                        <span>Data type/format</span>
                        <span>Variable name e.g. opened</span>
                        <span>
                            Variable description e.g. If customer has opened the
                            product
                        </span>
                    </div>
                )}
                <div>
                    <Button
                        intent="secondary"
                        isDisabled={isDisabled}
                        onClick={onAdd}
                        size="small"
                    >
                        <ButtonIconLabel icon="add">
                            Add Variable
                        </ButtonIconLabel>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ActionFormInputs
