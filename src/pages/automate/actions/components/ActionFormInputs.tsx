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
                Collect information from the customer (optional)
            </Label>
            <div className={css.description}>
                List any information AI Agent should ask the customer before
                performing this Action. Note: AI Agent already knows the
                customer’s email and order number.
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
                        <span>Variable name</span>
                        <span>
                            Instructions for AI Agent to collect this
                            information
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
                            Add information
                        </ButtonIconLabel>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ActionFormInputs
