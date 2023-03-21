import React from 'react'

import {
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

const OfflineMessages: React.FC<Props> = ({mainColor, chatTitle, language}) => {
    const widgetTranslatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <>
            <BotMessages
                chatTitle={chatTitle}
                messages={[
                    widgetTranslatedTexts.contactFormIntro,
                    widgetTranslatedTexts.contactFormAskSubject,
                ]}
            />
            <QuickReplies
                quickReplies={[
                    'Track Order',
                    'Report Issue',
                    'Cancel Order',
                    'Product Question',
                    'Other',
                ]}
                mainColor={mainColor}
            />
        </>
    )
}

export default OfflineMessages
