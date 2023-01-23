import classnames from 'classnames'
import {Map} from 'immutable'
import React, {Component} from 'react'

import Avatar from '../../../../../common/components/Avatar/Avatar'

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
    conversationColor: string
    currentUser?: Map<any, any>
    customerInitialMessages: string[] | JSX.Element[]
    agentMessages: AgentMessages
    hideMessageTimestamp?: boolean
    enableAgentMessagesAnimations?: boolean
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
            conversationColor,
            currentUser,
            customerInitialMessages,
            agentMessages,
            hideMessageTimestamp,
            enableAgentMessagesAnimations,
        } = this.props

        if (!currentUser) {
            return null
        }

        return (
            <div className={css.content}>
                <CustomerInitialMessages
                    conversationColor={conversationColor}
                    messages={customerInitialMessages}
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
                            <div
                                className={classnames(css.user, {
                                    [css.isAnimated]:
                                        enableAgentMessagesAnimations,
                                })}
                            >
                                {currentUser.get('name')}
                            </div>

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
            </div>
        )
    }
}
