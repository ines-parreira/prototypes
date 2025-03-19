import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import InputPrompt from 'gorgias-design-system/Input/InputPrompt'

import css from './ChatIntegrationPreview.less'

type Props = {
    language?: string
    required?: boolean
}

const EmailCaptureMessage: React.FC<Props> = ({
    language,
    required = true,
}) => {
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
                label={
                    required
                        ? translatedTexts.requiredEmailCaptureInputLabel
                        : translatedTexts.emailCaptureInputLabel
                }
                placeholder={translatedTexts.emailCapturePlaceholder}
                required={required}
            />
        </div>
    )
}

export default EmailCaptureMessage
