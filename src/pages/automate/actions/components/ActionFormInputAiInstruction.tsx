import React from 'react'
import TextArea from 'pages/common/forms/TextArea'
import css from './CustomActionsForm.less'

type Props = {
    isDisabled: boolean
    value: string
    onChange: (name: string) => void
}

export default function ActionFormInputAiInstructions({
    isDisabled,
    value,
    onChange,
}: Props) {
    return (
        <TextArea
            className={css.formItem}
            label="AI Agent instructions"
            isRequired
            placeholder="e.g. Update the customer’s shipping address with a new address"
            isDisabled={isDisabled}
            value={value}
            onChange={onChange}
            caption="Describe what the Action does."
            darkenCaption
        />
    )
}
