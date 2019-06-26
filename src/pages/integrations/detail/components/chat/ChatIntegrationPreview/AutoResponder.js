import React from 'react'
import classnames from 'classnames'

import {CHAT_AUTO_RESPONDER_TEXTS} from '../../../../../../config/integrations'
import {SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT} from '../../../../../../config/integrations/smooch_inside'

import css from './ChatIntegrationPreview.less'


type Props = {
    conversationColor?: string,
    name?: string,
    language?: string,
    autoResponderReply?: string
}

export default class OptionalEmailCapture extends React.Component<Props> {
    render() {
        const {conversationColor, name, language, autoResponderReply} = this.props

        const translatedTexts = CHAT_AUTO_RESPONDER_TEXTS[language || SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT]

        return (
            <div className={css.content}>
                <div
                    className={classnames(css.bubble, css.primary, css.firstMessageOfAppUser, css.lastMessage)}
                    style={{backgroundColor: conversationColor}}
                >
                    hi
                </div>

                <div className={css.appMakerMessageWrapper}>
                    <div className={classnames(css.avatar, css.gorgiasLogo)}>
                        <img src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/icons/gorgias-icon-logo-white.png`}/>
                    </div>
                    <div>
                        <div className={css.user}>
                            {name}
                        </div>

                        <div className={classnames(css.bubble, css.firstMessageOfAppMaker, 'mb-2')}>
                            {translatedTexts[autoResponderReply]}
                        </div>

                    </div>
                </div>
            </div>
        )
    }
}
