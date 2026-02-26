import InputPrompt from 'gorgias-design-system/Input/InputPrompt'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from '../../../../../../../config/integrations/gorgias_chat'
import BotMessages from './BotMessages'

import css from './ChatIntegrationPreview.less'

type Props = {
    name: Maybe<string>
    language?: string
}

export default function RequiredEmailCapture({
    language = GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    name,
}: Props) {
    const translatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <div className={css.requiredEmailCaptureContent}>
            <BotMessages
                chatTitle={name}
                messages={[translatedTexts.requireEmailCaptureIntro]}
                language={language}
            >
                <div className={css.optionalEmailCapture}>
                    <InputPrompt
                        id="email-capture-intput"
                        required
                        isValid
                        type="email"
                        readOnly
                        label={translatedTexts.requiredEmailCaptureInputLabel}
                        placeholder={translatedTexts.emailCapturePlaceholder}
                    />
                </div>
            </BotMessages>
        </div>
    )
}
