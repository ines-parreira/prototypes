import React from 'react'

import InputPrompt from 'gorgias-design-system/Input/InputPrompt'
import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../config/integrations/gorgias_chat'

import css from './ChatIntegrationPreview.less'
import BotMessages from './BotMessages'

type Props = {
    name: Maybe<string>
    language?: string
}

export default class RequiredEmailCapture extends React.Component<Props> {
    static defaultProps: Pick<Props, 'language'> = {
        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    }

    render() {
        const {name, language} = this.props

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
                    language={language}
                >
                    <div className={css.optionalEmailCapture}>
                        <InputPrompt
                            id="email-capture-intput"
                            required
                            isValid
                            type="email"
                            readOnly
                            label={
                                translatedTexts.requiredEmailCaptureInputLabel
                            }
                            placeholder={
                                translatedTexts.emailCapturePlaceholder
                            }
                        />
                    </div>
                </BotMessages>
            </div>
        )
    }
}
