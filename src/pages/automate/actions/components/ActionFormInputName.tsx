import React from 'react'
import {UseControllerProps, useController} from 'react-hook-form'
import InputField from 'pages/common/forms/input/InputField'
import {ActionFormInputValues} from '../types'
import css from './CustomActionsForm.less'

type Props = {
    caption?: string
    label?: string
}

export default function ActionFormInputName<
    T extends Pick<ActionFormInputValues, 'name'>
>({
    caption = 'Provide a name for this Action.',
    label = 'Action name',
    ...props
}: UseControllerProps<T> & Props) {
    const {field, fieldState} = useController({
        ...props,
        rules: props.rules ?? {
            required: 'Action name is required',
        },
    })
    return (
        <InputField
            className={css.formItem}
            label={label}
            isRequired
            isDisabled={field.disabled}
            type="text"
            placeholder="e.g. Update shipping address"
            caption={caption}
            darkenCaption
            error={fieldState.error?.message}
            {...field}
        />
    )
}
