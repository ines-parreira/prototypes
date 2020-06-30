import React from 'react'

import {
    SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    SMOOCH_INSIDE_WIDGET_TEXTS,
} from '../../../../../../config/integrations/smooch_inside'

import css from './ChatIntegrationPreview.less'

type Props = {
    language?: ?string,
    conversationColor?: ?string,
}

export default class RequiredEmailCapture extends React.Component<Props> {
    static defaultProps = {
        language: SMOOCH_INSIDE_WIDGET_LANGUAGE_DEFAULT,
    }

    render() {
        const {language, conversationColor} = this.props
        const translatedTexts = SMOOCH_INSIDE_WIDGET_TEXTS[language]

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
