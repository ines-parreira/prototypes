import React, {Component} from 'react'
import classnames from 'classnames'

import {assetsUrl} from 'utils'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'
import {CHAT_AUTO_RESPONDER_TEXTS} from '../../../../../../config/integrations'

import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'

type Props = {
    conversationColor: string
    name?: string
    language?: string
    autoResponderReply?: string
}

export default class OptionalEmailCapture extends Component<Props> {
    render() {
        const {conversationColor, name, language, autoResponderReply} =
            this.props

        const autoResponderTranslatedTexts =
            CHAT_AUTO_RESPONDER_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]
        const widgetTranslatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        const translatedReply =
            autoResponderReply === GORGIAS_CHAT_AUTO_RESPONDER_REPLY_DYNAMIC
                ? widgetTranslatedTexts['waitTimeMediumReply'].replace(
                      '{waitTime}',
                      '10'
                  )
                : autoResponderTranslatedTexts[autoResponderReply!]

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={['hi']}
                />

                <div className={css.appMakerMessageWrapper}>
                    <div className={classnames(css.avatar, css.robotLogo)}>
                        <img
                            src={assetsUrl('/img/icons/robot-icon.svg')}
                            alt="Robot icon"
                        />
                    </div>
                    <div>
                        <div className={css.user}>{name}</div>

                        <div
                            className={classnames(
                                css.bubble,
                                css.firstMessageOfAppMaker,
                                'mb-2'
                            )}
                        >
                            {translatedReply}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
