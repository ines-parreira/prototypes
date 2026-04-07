import { Box, TextAreaField } from '@gorgias/axiom'

import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'

type Props = {
    responseMessageContent: ResponseMessageContent
    onChange: (responseMessageContent: ResponseMessageContent) => void
}

export const CancelOrderResponseMessage = ({
    responseMessageContent,
    onChange,
}: Props) => {
    const handleChange = (value: string) => {
        onChange({
            ...responseMessageContent,
            html: value ? `<div>${value}</div>` : '',
            text: value,
        })
    }

    return (
        <Box flexDirection="column" gap="xxs">
            <TextAreaField
                label="Response for unfulfilled orders"
                value={responseMessageContent.text}
                onChange={handleChange}
                placeholder=""
                rows={2}
                caption="When customers request a cancellation, an automated reply is sent. If AI Agent is active, it will replace this message with its own response."
            />
        </Box>
    )
}
