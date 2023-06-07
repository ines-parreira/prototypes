import React from 'react'
import classnames from 'classnames'

import {assetsUrl} from 'utils'

import {useChatIntegrationPreviewContext} from './ChatIntegrationPreviewContext'
import ChatTitle from './ChatTitle'

import css from './BotMessages.less'
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
            {companyLogoUrl ? (
                <div
                    className={css.avatar}
                    style={{
                        backgroundImage: `url(${companyLogoUrl})`,
                    }}
                />
            ) : (
                <div className={css.avatar}>
                    <img
                        src={assetsUrl('/img/icons/bot-icon.svg')}
                        alt="Robot icon"
                    />
                </div>
            )}

            <div>
                <ChatTitle isBot title={chatTitle} />

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
