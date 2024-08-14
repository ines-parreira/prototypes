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
            label="AI Agent instructions"
            isRequired
            placeholder="e.g. Update the customer’s shipping address with a new address"
            isDisabled={field.disabled}
            caption="Describe what the Action does."
            darkenCaption
            error={fieldState.error?.message}
            {...field}
        />
    )
}
