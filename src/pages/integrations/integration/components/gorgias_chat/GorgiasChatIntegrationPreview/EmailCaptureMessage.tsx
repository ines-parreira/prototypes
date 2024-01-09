import React from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import InputPrompt from 'gorgias-design-system/Input/InputPrompt'
import css from './ChatIntegrationPreview.less'

type Props = {
    language?: string
}

const EmailCaptureMessage: React.FC<Props> = ({language}) => {
    const translatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <div className={css.optionalEmailCapture}>
            <InputPrompt
                id="email-capture-intput"
                isValid
                type="email"
                readOnly
                label={translatedTexts.requiredEmailCaptureInputLabel}
                placeholder={translatedTexts.emailCapturePlaceholder}
                required
            />
        </div>
    )
}

export default EmailCaptureMessage
