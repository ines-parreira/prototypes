import React from 'react'
import classnames from 'classnames'

import Avatar from 'gorgias-design-system/Avatar/Avatar'

import {useChatIntegrationPreviewContext} from './ChatIntegrationPreviewContext'
import ChatTitle from './ChatTitle'

import previewCss from './ChatIntegrationPreview.less'

type Props = {
    className?: string
    chatTitle: Maybe<string>
    messages?: string[]
}

const BotMessages: React.FC<Props> = ({
    className,
    chatTitle,
    children,
    messages,
}) => {
    const chatIntegrationPreviewContext = useChatIntegrationPreviewContext()
    const companyLogoUrl = chatIntegrationPreviewContext?.avatar?.companyLogoUrl

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
                <ChatTitle isBot title={chatTitle} />
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

                <div className={previewCss.automatedTimestamp}>Automated</div>
            </div>
        </div>
    )
}

export default BotMessages
