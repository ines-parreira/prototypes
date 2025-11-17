import classnames from 'classnames'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import {
    GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
    GORGIAS_CHAT_WIDGET_TEXTS,
} from 'config/integrations/gorgias_chat'
import ArticleAttachment from 'gorgias-design-system/Attachments/ArticleAttachment'
import type { GorgiasChatAvatarSettings } from 'models/integration/types'
import { ProductCarousel } from 'pages/common/components/ProductCarousel'
import type { ProductCardAttachment } from 'pages/common/draftjs/plugins/toolbar/components/AddProductLink'
import { transformAttachmentToProduct } from 'pages/convert/campaigns/utils/transformAttachmentToProduct'

import { AgentDisplayName } from './AgentDisplayName'
import type { ArticleAttachmentSchema } from './ArticleAttachment'
import { isArticleAttachment } from './ArticleAttachment'
import ChatAvatar from './ChatAvatar'
import { FileIcon } from './icon-utils'

import css from './ChatIntegrationPreview.less'

export type AgentMessage = {
    content: string
    isHtml: boolean
    attachments: ProductCardAttachment[] | ArticleAttachmentSchema[]
}

const renderAgentMessage = ({
    content,
    isHtml,
    attachments,
}: {
    content: string
    isHtml: boolean
    attachments: ProductCardAttachment[] | ArticleAttachmentSchema[]
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
                                key={index}
                                title={attachment.title}
                                description={attachment.summary}
                                leadIcon={<FileIcon />}
                                style={{ margin: '-14px' }}
                            />
                        )
                    }
                })}
            </>
        )
    }
    return <>{content}</>
}

const renderAttachments = (
    attachments: ProductCardAttachment[] | ArticleAttachmentSchema[],
    conversationColor: string,
) => {
    const products = transformAttachmentToProduct(fromJS(attachments), {})

    if (products.length) {
        return (
            <div className={css.productCarousel}>
                <ProductCarousel
                    products={products}
                    mainColor={conversationColor}
                    shouldHideRepositionImage={true}
                />
            </div>
        )
    }
}

type Props = {
    currentUser: Map<any, any>
    messages: AgentMessage[]
    conversationColor: string
    backgroundColor?: string
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
    conversationColor,
    backgroundColor,
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
                        key={
                            enableAgentMessagesAnimations
                                ? index
                                : message.content
                        }
                    >
                        <div
                            className={classnames(
                                css.bubble,
                                css.firstMessageOfAppMaker,
                                {
                                    [css.isAnimated]:
                                        enableAgentMessagesAnimations,
                                },
                            )}
                            style={
                                backgroundColor
                                    ? {
                                          backgroundColor: backgroundColor,
                                      }
                                    : {}
                            }
                        >
                            {renderAgentMessage(message)}
                        </div>
                        {renderAttachments(
                            message.attachments,
                            conversationColor,
                        )}
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
