import React, { useMemo, useRef } from 'react'

import classNames from 'classnames'
import _omit from 'lodash/omit'

import { IconButton, Tooltip } from '@gorgias/axiom'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import CheckBox from 'pages/common/forms/CheckBox'
import TextInput from 'pages/common/forms/input/TextInput'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Option } from 'pages/common/forms/SelectField/types'

import { Input } from '../types'

import css from './ActionFormInput.less'

type Props = {
    isDisabled?: boolean
    isSemiImmutable?: boolean
    input: Input
    onDelete: () => void
    onChange: (input: Input) => void
    disabledTooltip?: string
    error?: {
        name?: string
        instructions?: string
    }
    onNameBlur?: () => void
    onInstructionsBlur?: () => void
    showOptionalFlag?: boolean
}

const ActionFormInput = ({
    input,
    isDisabled,
    isSemiImmutable,
    onChange,
    onDelete,
    disabledTooltip,
    error,
    onNameBlur,
    onInstructionsBlur,
    showOptionalFlag = false,
}: Props) => {
    const ref = useRef<HTMLDivElement>(null)

    const type = 'data_type' in input ? input.data_type : input.kind

    const isActionsInputsProductEnabled = useFlag(
        FeatureFlagKey.ActionsInputsProduct,
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

    const showOptional = showOptionalFlag && 'data_type' in input
    return (
        <>
            <div
                ref={ref}
                className={classNames(css.container, {
                    [css.optional]: showOptional,
                })}
            >
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
                            })
                        } else {
                            onChange({
                                ...('kind' in input
                                    ? _omit(input, ['kind'])
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
                    onChange={(nextValue) => {
                        onChange({
                            ...input,
                            name: nextValue,
                        })
                    }}
                    hasError={!!error?.name}
                    onBlur={onNameBlur}
                />
                <TextInput
                    isDisabled={isDisabled}
                    value={input.instructions}
                    onChange={(nextValue) => {
                        onChange({
                            ...input,
                            instructions: nextValue,
                        })
                    }}
                    hasError={!!error?.instructions}
                    onBlur={onInstructionsBlur}
                />
                {showOptional && (
                    <CheckBox
                        isChecked={!!input.optional}
                        onChange={(nextValue) => {
                            onChange({
                                ...input,
                                optional: nextValue,
                            })
                        }}
                        isDisabled={isDisabled || isSemiImmutable}
                    />
                )}
                <IconButton
                    icon="close"
                    intent="destructive"
                    isDisabled={isDisabled || isSemiImmutable}
                    fillStyle="ghost"
                    onClick={onDelete}
                    aria-label="close"
                />
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
