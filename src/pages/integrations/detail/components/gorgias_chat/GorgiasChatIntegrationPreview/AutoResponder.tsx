import React, {Component} from 'react'
import classnames from 'classnames'

import {CHAT_AUTO_RESPONDER_TEXTS} from '../../../../../../config/integrations/index'
import {GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT} from '../../../../../../config/integrations/gorgias_chat'

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
        const {
            conversationColor,
            name,
            language,
            autoResponderReply,
        } = this.props

        const translatedTexts =
            CHAT_AUTO_RESPONDER_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={['hi']}
                />

                <div className={css.appMakerMessageWrapper}>
                    <div className={classnames(css.avatar, css.robotLogo)}>
                        <img
                            src={`${
                                window.GORGIAS_ASSETS_URL || ''
                            }/static/private/img/icons/robot-icon.svg`}
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
                            {translatedTexts[autoResponderReply!]}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
