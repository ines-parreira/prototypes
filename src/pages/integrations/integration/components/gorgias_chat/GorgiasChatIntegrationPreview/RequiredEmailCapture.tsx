import React from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'

import css from './ChatIntegrationPreview.less'
import {getTextColorBasedOnBackground} from './color-utils'
import BotMessages from './BotMessages'

type Props = {
    name: Maybe<string>
    language: Maybe<string>
    conversationColor: string
}

export default class RequiredEmailCapture extends React.Component<Props> {
    static defaultProps: Pick<Props, 'language'> = {
        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    }

    render() {
        const {conversationColor, name, language} = this.props
        const contrastColor = getTextColorBasedOnBackground(conversationColor)

        const translatedTexts =
            GORGIAS_CHAT_WIDGET_TEXTS[
                language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
            ]

        return (
            <div className={css.requiredEmailCaptureContent}>
                <BotMessages
                    chatTitle={name}
                    messages={[
                        translatedTexts.requiredEmailCaptureWelcomeMessage,
                    ]}
                >
                    <div className={css.optionalEmailCapture}>
                        <div className={css.inputLabel}>
                            {translatedTexts.requiredEmailCaptureInputLabel}{' '}
                            <span className={css.asterisk}>*</span>
                        </div>
                        <div className={css.inputWrapper}>
                            <input
                                className="input"
                                placeholder={
                                    translatedTexts.emailCapturePlaceholder
                                }
                                type="email"
                                readOnly
                            />
                            <button
                                style={{backgroundColor: conversationColor}}
                            >
                                <i
                                    className="material-icons"
                                    style={{color: contrastColor}}
                                >
                                    chevron_right
                                </i>
                            </button>
                        </div>
                    </div>
                </BotMessages>
            </div>
        )
    }
}
