import React, {Component} from 'react'

import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'
import {CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES} from '../../../../../../config/integrations'

import BotMessages from './BotMessages'
import EmailCaptureMessage from './EmailCaptureMessage'

type Props = {
    mainColor: string
    chatTitle?: string
    language?: string
    autoResponderReply?: string
    isEmailCaptureEnabled?: boolean
}

export default class AutoResponder extends Component<Props> {
    _getMessage = () => {
        const {autoResponderReply, language} = this.props
        const widgetTranslatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        return autoResponderReply === GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC
            ? widgetTranslatedTexts['waitTimeMediumReply'].replace(
                  '{waitTime}',
                  '5'
              )
            : `${
                  autoResponderReply === CHAT_AUTO_RESPONDER_REPLY_IN_MINUTES
                      ? widgetTranslatedTexts.emailCaptureTriggerTypicalReplyMinutes
                      : widgetTranslatedTexts.emailCaptureTriggerTypicalReplyHours
              }`
    }

    render() {
        const {
            chatTitle,
            language,
            isEmailCaptureEnabled = GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ENABLED_DEFAULT,
        } = this.props
        const message = this._getMessage()

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
}
