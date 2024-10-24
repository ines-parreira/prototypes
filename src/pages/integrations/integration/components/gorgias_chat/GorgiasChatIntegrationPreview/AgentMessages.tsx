import classnames from 'classnames'
import {Map} from 'immutable'
import React from 'react'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'

import ArticleAttachment from 'gorgias-design-system/Attachments/ArticleAttachment'
import {GorgiasChatAvatarSettings} from 'models/integration/types'

import {AgentDisplayName} from './AgentDisplayName'

import {ArticleAttachmentSchema, isArticleAttachment} from './ArticleAttachment'
import ChatAvatar from './ChatAvatar'
import css from './ChatIntegrationPreview.less'
import {FileIcon} from './icon-utils'
import ProductCardAttachment, {ProductAttachment} from './ProductCardAttachment'

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
                                description={attachment.summary}
                                leadIcon={<FileIcon />}
                                style={{margin: '-14px'}}
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
    language?: string
}

const AgentMessages: React.FC<Props> = ({
    currentUser,
    messages,
    enableAgentMessagesAnimations,
    chatTitle,
    avatar,
    language,
}) => {
    const widgetTranslatedTexts =
        GORGIAS_CHAT_WIDGET_TEXTS[
            language || GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT
        ]

    return (
        <div className={css.appMakerMessageWrapper}>
            <div className={css.agent}>
                <div
                    className={classnames(css.avatar, {
                        [css.isAnimated]: enableAgentMessagesAnimations,
                    })}
                >
                    <ChatAvatar
                        avatar={avatar}
                        agentName={currentUser.get('name')}
                        agentAvatarUrl={currentUser.getIn([
                            'meta',
                            'profile_picture_url',
                        ])}
                        chatTitle={chatTitle}
                    />
                </div>
                <AgentDisplayName
                    chatTitle={chatTitle}
                    className={classnames(css.user, {
                        [css.isAnimated]: enableAgentMessagesAnimations,
                    })}
                    name={currentUser.get('name') as string}
                    type={avatar?.nameType}
                />
            </div>
            <div className={css.messages}>
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
                            enableAgentMessagesAnimations
                                ? index
                                : message.content
                        }
                    >
                        {renderAgentMessage(message)}
                    </div>
                ))}
                <div className={css.automatedTimestamp}>
                    {widgetTranslatedTexts.automated}
                </div>
            </div>
        </div>
    )
}

export default AgentMessages
