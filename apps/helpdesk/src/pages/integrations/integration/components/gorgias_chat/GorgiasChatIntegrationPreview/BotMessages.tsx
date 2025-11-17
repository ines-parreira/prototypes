import type React from 'react'
import { useContext } from 'react'

import classnames from 'classnames'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import Avatar from 'gorgias-design-system/Avatar/Avatar'

import { ChatIntegrationPreviewContext } from '.'
import ChatTitle from './ChatTitle'

import previewCss from './ChatIntegrationPreview.less'

type Props = {
    className?: string
    chatTitle: Maybe<string>
    messages?: string[]
    language?: string
    children?: React.ReactNode
}

const BotMessages: React.FC<Props> = ({
    className,
    chatTitle,
    children,
    messages,
    language,
}) => {
    const { displayBotLabel, avatar } = useContext(
        ChatIntegrationPreviewContext,
    )

    const companyLogoUrl = avatar?.companyLogoUrl

    const widgetTranslatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <div
            className={classnames(previewCss.appMakerMessageWrapper, className)}
        >
            <div className={previewCss.agent}>
                <div className={previewCss.avatar}>
                    <Avatar
                        isBot={!companyLogoUrl}
                        src={companyLogoUrl}
                        name={chatTitle!}
                    />
                </div>
                <ChatTitle isBot={displayBotLabel} title={chatTitle} />
            </div>
            <div className={previewCss.messages}>
                {messages?.map((message, index) => (
                    <div
                        key={message}
                        className={classnames(previewCss.bubble, {
                            [previewCss.firstMessageOfAppMaker]: index === 0,
                        })}
                    >
                        {message}
                    </div>
                ))}

                {children}

                <div className={previewCss.automatedTimestamp}>
                    {widgetTranslatedTexts.automated}
                </div>
            </div>
        </div>
    )
}

export default BotMessages
