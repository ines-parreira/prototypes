import React, { useMemo } from 'react'

import { CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES } from 'config/integrations'
import {
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import BotMessages from './BotMessages'
import EmailCaptureMessage from './EmailCaptureMessage'

type Props = {
    autoResponderReply?: string
    chatTitle?: string
    isEmailCaptureEnabled?: boolean
    language?: string
}

const AutoResponder = ({
    autoResponderReply,
    chatTitle,
    isEmailCaptureEnabled = GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    language,
}: Props) => {
    const message = useMemo(() => {
        const widgetTranslatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        return autoResponderReply === GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC
            ? widgetTranslatedTexts['waitTimeMediumReply'].replace(
                  '{waitTime}',
                  '5',
              )
            : `${
                  autoResponderReply === CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES
                      ? widgetTranslatedTexts.emailCaptureTriggerTypicalReplyMinutes
                      : widgetTranslatedTexts.emailCaptureTriggerTypicalReplyHours
              }`
    }, [autoResponderReply, language])

    return (
        <BotMessages
            chatTitle={chatTitle}
            messages={[message]}
            language={language}
        >
            {isEmailCaptureEnabled && (
                <EmailCaptureMessage language={language} />
            )}
        </BotMessages>
    )
}

export default AutoResponder
