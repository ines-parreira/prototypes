import React from 'react'

import InputField from 'pages/common/forms/input/InputField'

import FormLabel from './FormLabel'

type Props = {
    value: string
    onChange: (nextValue: string) => void
    onBlur: () => void
    error?: string
}

const ActionsPlatformTemplateName = ({
    value,
    onChange,
    onBlur,
    error,
}: Props) => {
    return (
        <InputField
            label={
                <FormLabel
                    isRequired
                    tooltip="AI Agent uses the Action name to identify and match it with a customer’s question."
                >
                    Action name
                </FormLabel>
            }
            error={error}
            autoFocus
            type="text"
            caption="Provide a name for this Action. e.g. Cancel order"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    )
}

export default ActionsPlatformTemplateName
