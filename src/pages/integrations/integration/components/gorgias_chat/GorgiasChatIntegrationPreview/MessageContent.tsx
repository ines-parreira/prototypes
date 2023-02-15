import classnames from 'classnames'
import {Map} from 'immutable'
import React, {Component, ReactNode, Ref} from 'react'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import Avatar from '../../../../../common/components/Avatar/Avatar'

import {AgentDisplayName} from './AgentDisplayName'
import ArticleAttachment, {
    ArticleAttachmentSchema,
    isArticleAttachment,
} from './ArticleAttachment'
import css from './ChatIntegrationPreview.less'
import CustomerInitialMessages from './CustomerInitialMessages'
import ProductCardAttachment, {ProductAttachment} from './ProductCardAttachment'

export type AgentMessages = {
    content: string
    isHtml: boolean
    attachments: ProductAttachment[] | ArticleAttachmentSchema[]
}[]

type Props = {
    className?: string
    innerRef?: Ref<HTMLDivElement>
    conversationColor: string
    currentUser?: Map<any, any>
    customerInitialMessages: ReactNode[]
    agentMessages: AgentMessages
    hideConversationTimestamp?: boolean
    hideMessageTimestamp?: boolean
    enableAgentMessagesAnimations?: boolean
    chatTitle?: string
    avatar?: {
        imageType: GorgiasChatAvatarImageType
        nameType: GorgiasChatAvatarNameType
        companyLogoUrl?: string
    }
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

export default class MessageContent extends Component<Props> {
    render() {
        const {
            className,
            innerRef,
            conversationColor,
            currentUser,
            customerInitialMessages,
            agentMessages,
            hideConversationTimestamp,
            hideMessageTimestamp,
            enableAgentMessagesAnimations,
            children,
            chatTitle,
            avatar,
        } = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div ref={innerRef} className={classnames(css.content, className)}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={customerInitialMessages}
                    hideConversationTimestamp={hideConversationTimestamp}
                    hideMessageTimestamp={hideMessageTimestamp}
                />

                {agentMessages.length > 0 && (
                    <div className={css.appMakerMessageWrapper}>
                        <Avatar
                            email={currentUser.get('email')}
                            name={currentUser.get('name')}
                            url={currentUser.getIn([
                                'meta',
                                'profile_picture_url',
                            ])}
                            size={35}
                            className={classnames(css.avatar, {
                                [css.isAnimated]: enableAgentMessagesAnimations,
                            })}
                        />
                        <div>
                            <AgentDisplayName
                                chatTitle={chatTitle}
                                className={classnames(css.user, {
                                    [css.isAnimated]:
                                        enableAgentMessagesAnimations,
                                })}
                                name={currentUser.get('name') as string}
                                type={avatar?.nameType}
                            />

                            {agentMessages.map((message, index) => (
                                <div
                                    className={classnames(
                                        css.bubble,
                                        css.firstMessageOfAppMaker,
                                        {
                                            [css.isAnimated]:
                                                enableAgentMessagesAnimations,
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
                        </div>
                    </div>
                )}

                {children}
            </div>
        )
    }
}
