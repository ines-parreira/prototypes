import { Text, TextAreaField } from '@gorgias/axiom'

import { AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH } from 'models/selfServiceConfiguration/constants'
import type { ResponseMessageContent } from 'models/selfServiceConfiguration/types'

import { usePropagateError } from '../ReturnOrderFlowViewContext'

import css from './ReturnOrderAutomatedResponseAction.less'

type Props = {
    responseMessageContent: ResponseMessageContent
    onChange: (responseMessageContent: ResponseMessageContent) => void
}

export const ReturnOrderAutomatedResponseAction = ({
    responseMessageContent,
    onChange,
}: Props) => {
    const hasError =
        responseMessageContent.text.length >
        AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH

    usePropagateError('response_message_content', hasError)

    const handleChange = (text: string) => {
        onChange({
            html: text,
            text,
        })
    }

    return (
        <div className={css.container}>
            <Text size="md" variant="medium">
                Response text
            </Text>
            <TextAreaField
                value={responseMessageContent.text}
                onChange={handleChange}
                maxLength={AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
                isInvalid={hasError}
                rows={3}
                aria-label="Response text"
            />
            <Text size="sm" className={css.description}>
                When customers request a return, an automated reply is sent. If
                AI Agent is active, it will replace this message with its own
                response.
            </Text>
        </div>
    )
}
