import React from 'react'
import {Label, Tooltip} from '@gorgias/ui-kit'

import _ from 'lodash'
import classNames from 'classnames'
import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {CustomInput} from '../types'
import css from './ActionFormInputVariable.less'

type Props = {
    isDisabled: boolean
    customInputs: CustomInput[]
    onDeleteInput: (index: number) => void
    onAddInput: () => void
    onChange: (customInputs: CustomInput, index: number) => void
    actionAppType?: string
}

export default function ActionFormInputVariable({
    customInputs,
    isDisabled,
    onChange,
    onAddInput,
    onDeleteInput,
    actionAppType,
}: Props) {
    return (
        <div className={css.inputVariables}>
            <Label>Input variables (Optional)</Label>
            <p>
                List any information AI Agent needs to collect from the
                conversation for this Action.
            </p>
            <div className={css.customInputsContainer}>
                {customInputs.map((input, index) => {
                    const isInputDisabled =
                        isDisabled || !!input.isTemplateCustomInputs

                    const inputElementId = (name: string) =>
                        `input-variable-field-${index}-${name}` as const

                    const inputElemenstIdMap = {
                        dataType: inputElementId('dataType'),
                        name: inputElementId('name'),
                        instructions: inputElementId('instructions'),
                        delete: inputElementId('delete'),
                    }
                    return (
                        <div
                            key={index}
                            className={classNames(css.customInputItem, {
                                [css.disabled]: isInputDisabled,
                            })}
                        >
                            <div id={inputElemenstIdMap['dataType']}>
                                <SelectField
                                    disabled={isInputDisabled}
                                    showSelectedOption
                                    value={input.dataType}
                                    onChange={(newDataType) =>
                                        onChange(
                                            {
                                                ...input,
                                                dataType: newDataType as
                                                    | 'string'
                                                    | 'number'
                                                    | 'boolean'
                                                    | 'date',
                                            },
                                            index
                                        )
                                    }
                                    options={[
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
                                    ]}
                                />
                            </div>
                            <TextInput
                                id={inputElemenstIdMap['name']}
                                value={input.name}
                                isDisabled={isInputDisabled}
                                placeholder="e.g. Address"
                                onChange={(newName) =>
                                    onChange(
                                        {
                                            ...input,
                                            name: newName,
                                        },
                                        index
                                    )
                                }
                            />
                            <TextInput
                                id={inputElemenstIdMap['instructions']}
                                isDisabled={isInputDisabled}
                                value={input.instructions}
                                placeholder="e.g. Ask for customer’s shipping address"
                                onChange={(newInstruction) =>
                                    onChange(
                                        {
                                            ...input,
                                            instructions: newInstruction,
                                        },
                                        index
                                    )
                                }
                            />

                            <IconButton
                                id={inputElemenstIdMap['delete']}
                                intent="destructive"
                                isDisabled={isInputDisabled}
                                fillStyle="ghost"
                                onClick={() => onDeleteInput(index)}
                            >
                                close
                            </IconButton>

                            {input.isTemplateCustomInputs && actionAppType && (
                                <>
                                    {Object.values(inputElemenstIdMap).map(
                                        (id) => (
                                            <Tooltip
                                                key={id}
                                                target={id}
                                                placement="top-end"
                                            >
                                                This input is required by{' '}
                                                {_.upperFirst(actionAppType)} to
                                                perform this Action.
                                            </Tooltip>
                                        )
                                    )}
                                </>
                            )}
                        </div>
                    )
                })}
                {customInputs.length > 0 && (
                    <div className={css.formInputFooterInfo}>
                        Data type, input name, instructions for AI Agent to ask
                        for the input
                    </div>
                )}
                <div>
                    <Button
                        intent="secondary"
                        isDisabled={isDisabled}
                        onClick={onAddInput}
                        size="small"
                    >
                        <ButtonIconLabel icon="add">Add Input</ButtonIconLabel>
                    </Button>
                </div>
            </div>
        </div>
    )
}
