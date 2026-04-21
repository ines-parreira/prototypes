import { Box, Text, TextAreaField, ToggleField } from '@gorgias/axiom'

import { AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH } from 'models/selfServiceConfiguration/constants'
import type { ReportIssueCaseReasonAction } from 'models/selfServiceConfiguration/types'

import { usePropagateError } from '../ScenarioFormContext'

type Props = {
    reasonKey: string
    value: ReportIssueCaseReasonAction
    onChange: (nextValue: ReportIssueCaseReasonAction) => void
}

export const ScenarioReasonAction = ({ reasonKey, value, onChange }: Props) => {
    const hasError =
        value.responseMessageContent.text.length >
        AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH

    usePropagateError(`action-${reasonKey}`, hasError)

    const handleTextChange = (text: string) => {
        onChange({
            ...value,
            responseMessageContent: {
                html: text ? `<div>${text}</div>` : '',
                text,
            },
            showHelpfulPrompt: text.length ? value.showHelpfulPrompt : false,
        })
    }

    const handleShowHelpfulPromptChange = (next: boolean) => {
        onChange({ ...value, showHelpfulPrompt: next })
    }

    return (
        <Box flexDirection="column" gap="xs">
            <Box flexDirection="column" gap="xxs">
                <Text size="md" variant="medium">
                    Response text
                </Text>
                <Text size="sm" color="content-neutral-secondary">
                    After customers choose this option, reply with an automated
                    message.
                </Text>
            </Box>
            <TextAreaField
                value={value.responseMessageContent.text}
                onChange={handleTextChange}
                maxLength={AUTOMATED_RESPONSE_MESSAGE_TEXT_MAX_LENGTH}
                isInvalid={hasError}
                rows={3}
                aria-label="Response text"
            />
            <ToggleField
                value={value.showHelpfulPrompt}
                onChange={handleShowHelpfulPromptChange}
                isDisabled={!value.responseMessageContent.text.length}
                label="Ask customers if your response was helpful"
                caption="A ticket is created only if customers need more help"
            />
        </Box>
    )
}
