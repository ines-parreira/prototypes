import React from 'react'
import {Map} from 'immutable'
import classnames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatAvatarSettings,
} from 'models/integration/types'

import Avatar from 'pages/common/components/Avatar/Avatar'

import {AgentDisplayName} from './AgentDisplayName'
import ArticleAttachment, {
    ArticleAttachmentSchema,
    isArticleAttachment,
} from './ArticleAttachment'
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
}) => {
    const hasAvatarCustomization =
        useFlags()[FeatureFlagKey.ChatAgentAvatarCustomization]

    return (
        <div className={css.appMakerMessageWrapper}>
            <Avatar
                email={currentUser.get('email')}
                name={
                    avatar?.nameType === GorgiasChatAvatarNameType.CHAT_TITLE
                        ? chatTitle
                        : currentUser.get('name')
                }
                showFirstInitialOnly={
                    avatar?.nameType ===
                    GorgiasChatAvatarNameType.AGENT_FIRST_NAME
                }
                url={
                    !hasAvatarCustomization ||
                    avatar?.imageType ===
                        GorgiasChatAvatarImageType.AGENT_PICTURE
                        ? currentUser.getIn(['meta', 'profile_picture_url'])
                        : avatar?.imageType ===
                          GorgiasChatAvatarImageType.COMPANY_LOGO
                        ? avatar.companyLogoUrl
                        : undefined
                }
                size={35}
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
    )
}

export default AgentMessages
