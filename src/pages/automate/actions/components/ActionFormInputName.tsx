import React from 'react'
import InputField from 'pages/common/forms/input/InputField'
import css from './CustomActionsForm.less'

type Props = {
    isDisabled: boolean
    value: string
    onChange: (name: string) => void
}

export default function ActionFormInputName({
    isDisabled,
    value,
    onChange,
}: Props) {
    return (
        <InputField
            className={css.formItem}
            label="Action name"
            isRequired
            isDisabled={isDisabled}
            type="text"
            placeholder="e.g. Update shipping address"
            value={value}
            onChange={onChange}
            caption="Provide a name for this Action."
            darkenCaption
        />
    )
}
