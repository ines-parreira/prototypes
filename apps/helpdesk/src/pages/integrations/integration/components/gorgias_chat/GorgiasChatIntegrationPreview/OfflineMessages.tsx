import {
    GORGIAS_CHAT_SSP_TEXTS,
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import BotMessages from './BotMessages'
import QuickReplies from './QuickReplies'

type Props = {
    mainColor: string
    chatTitle: string
    language?: string
}

const OfflineMessages: React.FC<Props> = ({
    mainColor,
    chatTitle,
    language,
}) => {
    const widgetTranslatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    const sspTexts =
        GORGIAS_CHAT_SSP_TEXTS[language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT]

    return (
        <>
            <BotMessages
                chatTitle={chatTitle}
                messages={[
                    widgetTranslatedTexts.contactFormIntro,
                    widgetTranslatedTexts.contactFormAskSubject,
                ]}
                language={language}
            />
            <QuickReplies
                quickReplies={[
                    sspTexts.trackOrderShort,
                    sspTexts.reportIssueShort,
                    sspTexts.cancelOrderShort,
                    widgetTranslatedTexts.productQuestionShort,
                    sspTexts.other,
                ]}
                mainColor={mainColor}
            />
        </>
    )
}

export default OfflineMessages
