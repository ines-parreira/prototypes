import React from 'react'
import {UseControllerProps, useController} from 'react-hook-form'
import TextArea from 'pages/common/forms/TextArea'
import {ActionFormInputValues} from '../types'
import css from './CustomActionsForm.less'

export default function ActionFormInputAiInstructions<
    T extends Pick<ActionFormInputValues, 'aiAgentInstructions'>
>(props: UseControllerProps<T>) {
    const {field, fieldState} = useController({
        ...props,
        rules: props.rules ?? {
            required: 'Instructions are required',
        },
    })
    return (
        <TextArea
            className={css.formItem}
            label="Instructions for AI Agent"
            isRequired
            placeholder="e.g. Cancel the customer’s full order and refund the full order amount. When a customer wants to cancel part of the order, hand over to an agent."
            isDisabled={field.disabled}
            caption="Describe what the Action does and give AI Agent additional directions on how to perform this Action."
            error={fieldState.error?.message}
            {...field}
        />
    )
}
