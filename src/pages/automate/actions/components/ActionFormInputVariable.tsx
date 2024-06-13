import React from 'react'
import TextInput from 'pages/common/forms/input/TextInput'
import IconButton from 'pages/common/components/button/IconButton'

import Tooltip from 'pages/common/components/Tooltip'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import Label from 'pages/common/forms/Label/Label'
import {CustomInput} from '../types'
import css from './ActionFormInputVariable.less'

type Props = {
    isDisabled: boolean
    customInputs: CustomInput[]
    onDeleteInput: (index: number) => void
    onAddInput: () => void
    onChange: (customInputs: CustomInput, index: number) => void
}

const llmPromptTriggerInputElementId = (id: number) =>
    `llm-prompt-trigger-input-${id}`

export default function ActionFormInputVariable({
    customInputs,
    isDisabled,
    onChange,
    onAddInput,
    onDeleteInput,
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
                    return (
                        <div
                            key={index}
                            className={css.customInputItem}
                            id={llmPromptTriggerInputElementId(index)}
                        >
                            <SelectField
                                disabled={
                                    isDisabled || input?.isTemplateCustomInputs
                                }
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
                            <TextInput
                                value={input.name}
                                isDisabled={
                                    isDisabled || input?.isTemplateCustomInputs
                                }
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
                                isDisabled={
                                    isDisabled || input.isTemplateCustomInputs
                                }
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
                            {input.isTemplateCustomInputs && (
                                <Tooltip
                                    target={llmPromptTriggerInputElementId(
                                        index
                                    )}
                                    placement="top-end"
                                >
                                    This input is required by the 3rd party app
                                    to perform this Action.
                                </Tooltip>
                            )}

                            {!input.isTemplateCustomInputs && (
                                <IconButton
                                    intent="destructive"
                                    isDisabled={isDisabled}
                                    fillStyle="ghost"
                                    onClick={() => onDeleteInput(index)}
                                >
                                    close
                                </IconButton>
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
