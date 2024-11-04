import {Tooltip} from '@gorgias/merchant-ui-kit'
import _omit from 'lodash/omit'
import React, {useMemo, useRef} from 'react'

import {useFlag} from 'common/flags'
import {FeatureFlagKey} from 'config/featureFlags'
import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {Option} from 'pages/common/forms/SelectField/types'

import {Input} from '../types'

import css from './ActionFormInput.less'

type Props = {
    isDisabled?: boolean
    isSemiImmutable?: boolean
    input: Input
    onDelete: () => void
    onChange: (input: Input) => void
    disabledTooltip?: string
}

const ActionFormInput = ({
    input,
    isDisabled,
    isSemiImmutable,
    onChange,
    onDelete,
    disabledTooltip,
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)

    const type = 'data_type' in input ? input.data_type : input.kind

    const isActionsInputsProductEnabled = useFlag(
        FeatureFlagKey.ActionsInputsProduct,
        false
    )

    const typeOptions = useMemo<Option[]>(() => {
        return [
            {
                label: 'String',
                value: 'string',
            },
            {
                label: 'Number',
                value: 'number',
            },
            {
                label: 'Boolean',
                value: 'boolean',
            },
            {
                label: 'Date',
                value: 'date',
            },
            ...(isActionsInputsProductEnabled
                ? [
                      {
                          label: 'Product',
                          value: 'product',
                      },
                  ]
                : []),
        ]
    }, [isActionsInputsProductEnabled])

    return (
        <>
            <div ref={ref} className={css.container}>
                <SelectField
                    disabled={isDisabled || isSemiImmutable}
                    showSelectedOption
                    value={type}
                    onChange={(nextValue) => {
                        if (nextValue === 'product') {
                            onChange({
                                ...('kind' in input
                                    ? input
                                    : _omit(input, ['data_type'])),
                                kind: nextValue,
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                            })
                        } else {
                            onChange({
                                ...('kind' in input
                                    ? _omit(input, ['kind', 'integration_id'])
                                    : input),
                                data_type: nextValue as
                                    | 'string'
                                    | 'number'
                                    | 'boolean'
                                    | 'date',
                            })
                        }
                    }}
                    options={typeOptions}
                />
                <TextInput
                    value={input.name}
                    isDisabled={isDisabled}
                    placeholder="e.g. Address"
                    onChange={(nextValue) => {
                        onChange({
                            ...input,
                            name: nextValue,
                        })
                    }}
                />
                <TextInput
                    isDisabled={isDisabled}
                    value={input.instructions}
                    placeholder="e.g. Ask for customer’s shipping address"
                    onChange={(nextValue) => {
                        onChange({
                            ...input,
                            instructions: nextValue,
                        })
                    }}
                />
                <IconButton
                    intent="destructive"
                    isDisabled={isDisabled || isSemiImmutable}
                    fillStyle="ghost"
                    onClick={onDelete}
                >
                    close
                </IconButton>
            </div>
            {disabledTooltip && isDisabled && (
                <Tooltip target={ref} placement="top-end">
                    {disabledTooltip}
                </Tooltip>
            )}
        </>
    )
}

export default ActionFormInput
