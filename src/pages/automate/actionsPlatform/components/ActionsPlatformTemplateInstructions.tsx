import React from 'react'

import TextArea from 'pages/common/forms/TextArea'

import FormLabel from './FormLabel'

type Props = {
    value: string
    onChange: (nextValue: string) => void
    onBlur: () => void
    error?: string
}

const ActionsPlatformTemplateInstructions = ({
    value,
    onChange,
    onBlur,
    error,
}: Props) => {
    return (
        <TextArea
            label={
                <FormLabel
                    isRequired
                    tooltip={
                        <>
                            The Action description complements the Action name
                            to help AI Agent match this Action with a customer’s
                            question.
                            <ul>
                                <li>
                                    Describe what the Action does and doesn't do
                                    (e.g. This Action cancels the order and
                                    refunds the customer with the full amount.
                                    It does not partially cancel orders).
                                </li>
                                <li>
                                    Describe scenario(s) in which the Action is
                                    needed. It's also helpful to include
                                    examples of a customer question that
                                    requires this Action.
                                </li>
                            </ul>
                        </>
                    }
                    placement="right"
                >
                    Description
                </FormLabel>
            }
            error={error}
            caption="Describe the outcome of this Action. e.g. Cancels the customer’s order when the customer asks"
            value={value}
            onChange={onChange}
            onBlur={onBlur}
        />
    )
}

export default ActionsPlatformTemplateInstructions
