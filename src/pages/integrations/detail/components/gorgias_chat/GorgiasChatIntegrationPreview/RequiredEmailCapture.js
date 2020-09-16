import React from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'

import css from './ChatIntegrationPreview.less'

type Props = {
    language?: ?string,
    conversationColor?: ?string,
}

export default class RequiredEmailCapture extends React.Component<Props> {
    static defaultProps = {
        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    }

    render() {
        const {language, conversationColor} = this.props
        const translatedTexts = GORGIAS_CHAT_WIDGET_TEXTS[language]

        return (
            <div className={css.requiredEmailCapture}>
                <div className={css.emailInputWrapper}>
                    <input
                        type="email"
                        placeholder={
                            translatedTexts.emailCaptureRequiredEmailPlaceholder
                        }
                        readOnly
                    />
                </div>
                <div className={css.messageInputWrapper}>
                    <textarea
                        placeholder={
                            translatedTexts.emailCaptureRequiredMessagePlaceholder
                        }
                        readOnly
                    />
                </div>
                <div className={css.buttonWrapper}>
                    <button style={{backgroundColor: conversationColor}}>
                        {translatedTexts.send}
                    </button>
                </div>
            </div>
        )
    }
}
