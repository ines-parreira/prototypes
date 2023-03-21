import React from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import {getTextColorBasedOnBackground} from '../../gorgias_chat/GorgiasChatIntegrationPreview/color-utils'

import css from './ChatIntegrationPreview.less'

type Props = {
    conversationColor: string
    language?: string
}

const EmailCaptureMessage: React.FC<Props> = ({
    conversationColor,
    language,
}) => {
    const translatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    const contrastColor = getTextColorBasedOnBackground(conversationColor)

    return (
        <div className={css.optionalEmailCapture}>
            <div className={css.inputLabel}>
                {translatedTexts.emailCaptureInputLabel}
            </div>
            <div className={css.inputWrapper}>
                <input
                    className="input"
                    placeholder={translatedTexts.emailCapturePlaceholder}
                    type="email"
                    readOnly
                />
                <button style={{backgroundColor: conversationColor}}>
                    <i
                        className="material-icons"
                        style={{color: contrastColor}}
                    >
                        chevron_right
                    </i>
                </button>
            </div>
        </div>
    )
}

export default EmailCaptureMessage
