import React, {Component} from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'
import {CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES} from '../../../../../../config/integrations'

import BotMessages from './BotMessages'
import EmailCaptureMessage from './EmailCaptureMessage'

type Props = {
    conversationColor: string
    chatTitle?: string
    language?: string
    autoResponderReply?: string
}

export default class AutoResponder extends Component<Props> {
    render() {
        const {conversationColor, chatTitle, language, autoResponderReply} =
            this.props

        const widgetTranslatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        const translatedReply =
            autoResponderReply === GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC
                ? widgetTranslatedTexts['waitTimeMediumReply'].replace(
                      '{waitTime}',
                      '5'
                  )
                : `${widgetTranslatedTexts.emailCaptureTriggerTextBase} ${
                      autoResponderReply ===
                      CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES
                          ? widgetTranslatedTexts.emailCaptureTriggerTypicalReplyMinutes
                          : widgetTranslatedTexts.emailCaptureTriggerTypicalReplyHours
                  }`

        return (
            <BotMessages chatTitle={chatTitle} messages={[translatedReply]}>
                <EmailCaptureMessage
                    conversationColor={conversationColor}
                    language={language}
                />
            </BotMessages>
        )
    }
}
