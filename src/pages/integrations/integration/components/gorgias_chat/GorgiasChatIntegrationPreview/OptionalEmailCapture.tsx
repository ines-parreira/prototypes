import React from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import EmailCaptureMessage from './EmailCaptureMessage'
import BotMessages from './BotMessages'

type Props = {
    mainColor: string
    chatTitle: string
    language?: string
}

const OptionalEmailCapture: React.FC<Props> = ({chatTitle, language}) => {
    const translatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <BotMessages
            chatTitle={chatTitle}
            messages={[translatedTexts.emailCaptureOnlineTriggerText]}
            language={language}
        >
            <EmailCaptureMessage language={language} />
        </BotMessages>
    )
}

export default OptionalEmailCapture
