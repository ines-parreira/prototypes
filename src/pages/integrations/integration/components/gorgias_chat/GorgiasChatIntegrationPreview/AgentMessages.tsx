import React from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'

import {GorgiasChatAvatarSettings} from 'models/integration/types'

import {AgentDisplayName} from './AgentDisplayName'
import ArticleAttachment, {
    ArticleAttachmentSchema,
    isArticleAttachment,
} from './ArticleAttachment'
import ChatAvatar from './ChatAvatar'
import ProductCardAttachment, {ProductAttachment} from './ProductCardAttachment'

import css from './ChatIntegrationPreview.less'

export type AgentMessage = {
    content: string
    isHtml: boolean
    attachments: ProductAttachment[] | ArticleAttachmentSchema[]
}

const renderAgentMessage = ({
    content,
    isHtml,
    attachments,
}: {
    content: string
    isHtml: boolean
    attachments: ProductAttachment[] | ArticleAttachmentSchema[]
}) => {
    if (isHtml) {
        return (
            <>
                <div
                    dangerouslySetInnerHTML={{
                        __html: content,
                    }}
                />
                {attachments.map((attachment, index) => {
                    if (isArticleAttachment(attachment)) {
                        return (
                            <ArticleAttachment
                                title={attachment.title}
                                summary={attachment.summary}
                            />
                        )
                    }
                    const {url} = attachment

                    return (
                        <ProductCardAttachment
                            key={`${url}-${index}`}
                            attachment={attachment}
                        />
                    )
                })}
            </>
        )
    }
    return <>{content}</>
}

type Props = {
    currentUser: Map<any, any>
    messages: AgentMessage[]
    enableAgentMessagesAnimations?: boolean
    chatTitle?: string
    avatar?: GorgiasChatAvatarSettings
}

const AgentMessages: React.FC<Props> = ({
    currentUser,
    messages,
    enableAgentMessagesAnimations,
    chatTitle,
    avatar,
}) => (
    <div className={css.appMakerMessageWrapper}>
        <ChatAvatar
            avatar={avatar}
            agentName={currentUser.get('name')}
            agentAvatarUrl={currentUser.getIn(['meta', 'profile_picture_url'])}
            chatTitle={chatTitle}
            className={classnames(css.avatar, {
                [css.isAnimated]: enableAgentMessagesAnimations,
            })}
        />
        <div>
            <AgentDisplayName
                chatTitle={chatTitle}
                className={classnames(css.user, {
                    [css.isAnimated]: enableAgentMessagesAnimations,
                })}
                name={currentUser.get('name') as string}
                type={avatar?.nameType}
            />

            {messages.map((message, index) => (
                <div
                    className={classnames(
                        css.bubble,
                        css.firstMessageOfAppMaker,
                        {
                            [css.isAnimated]: enableAgentMessagesAnimations,
                        }
                    )}
                    key={
                        enableAgentMessagesAnimations ? index : message.content
                    }
                >
                    {renderAgentMessage(message)}
                </div>
            ))}
        </div>
    </div>
)

export default AgentMessages
