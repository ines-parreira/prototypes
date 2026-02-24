import { useRef } from 'react'
import type { ReactNode } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'
import classnames from 'classnames'
import { marked } from 'marked'

import { JourneyTypeEnum } from '@gorgias/convert-client'

import error from 'assets/img/icons/error.svg'
import type { PlaygroundMessage as PlaygroundMessageType } from 'models/aiAgentPlayground/types'
import { MessageType } from 'models/aiAgentPlayground/types'
import { AI_AGENT_SENDER } from 'pages/aiAgent/PlaygroundV2/constants'
import { useAIJourneyContext } from 'pages/aiAgent/PlaygroundV2/contexts/AIJourneyContext'
import { useMessagesContext } from 'pages/aiAgent/PlaygroundV2/contexts/MessagesContext'
import { useSettingsContext } from 'pages/aiAgent/PlaygroundV2/contexts/SettingsContext'
import { ProductCarousel } from 'pages/common/components/ProductCarousel'
import { Avatar } from 'pages/tickets/detail/components/TicketMessages/Avatar'
import { assertUnreachable } from 'utils'
import { linkifyHtml } from 'utils/html'

import TicketEvent from '../../../components/TicketEvent/TicketEvent'
import type { PlaygroundChannels } from '../../types'

import css from './PlaygroundMessage.less'

type Props = {
    withAnimation?: boolean
    message: PlaygroundMessageType
    channel: PlaygroundChannels
    children?: ReactNode
}

const PlaygroundMessage = ({
    withAnimation = false,
    message,
    channel,
    children,
}: Props) => {
    const { mode } = useSettingsContext()
    const { messages } = useMessagesContext()
    const {
        aiJourneySettings: { includeProductImage, selectedProduct, mediaUrls },
        currentJourney,
    } = useAIJourneyContext()
    const isAiAgentSender = message.sender === AI_AGENT_SENDER
    const messageType = message.type

    const isJourneyFirstMessage =
        mode === 'outbound' &&
        message.createdDatetime === messages[0]?.createdDatetime

    const renderFirstJourneyImage =
        isJourneyFirstMessage &&
        currentJourney?.type !== JourneyTypeEnum.Campaign &&
        includeProductImage &&
        selectedProduct !== null

    const renderCampaignImage =
        isJourneyFirstMessage &&
        currentJourney?.type === JourneyTypeEnum.Campaign &&
        mediaUrls &&
        mediaUrls.length > 0

    const productImage = useRef({
        src: selectedProduct?.image?.src,
        alt: selectedProduct?.title,
    })

    const campaignImage = useRef({
        name: mediaUrls?.[0]?.name,
        url: mediaUrls?.[0]?.url,
        content_type: mediaUrls?.[0]?.content_type,
    })

    switch (messageType) {
        case MessageType.ERROR:
            return (
                <MessageContainer
                    channel={channel}
                    sender={message.sender}
                    withAnimation={withAnimation}
                    isAiAgentSender={isAiAgentSender}
                    type={messageType}
                    role="alert"
                >
                    <div className={css.aiAgentErrorIconContainer}>
                        <img alt="timer" src={error} />
                    </div>

                    {message.content}
                </MessageContainer>
            )
        case MessageType.TICKET_EVENT:
            return <TicketEvent type={message.outcome} />
        case MessageType.PLACEHOLDER:
            return (
                <MessageContainer
                    channel={channel}
                    sender={message.sender}
                    withAnimation={withAnimation}
                    type={messageType}
                    isAiAgentSender={isAiAgentSender}
                >
                    <PlaygroundPlaceholderMessage />
                </MessageContainer>
            )
        case MessageType.MESSAGE:
        case MessageType.PROMPT:
        case MessageType.INTERNAL_NOTE:
            const attachments =
                message.attachments
                    ?.filter(
                        (attachment) =>
                            attachment.content_type ===
                            'application/productCard',
                    )
                    .map((attachment) => ({
                        id: Number(attachment.extra.product_id),
                        title: attachment.name,
                        url: attachment.url,
                        price: Number(attachment.extra.price),
                        currency: attachment.extra.currency,
                        featured_image: attachment.extra.featured_image,
                        variant_name: attachment.extra.variant_name,
                        onClick: () =>
                            window.open(
                                attachment.extra.product_link,
                                '_blank',
                            ),
                    })) ?? []

            return (
                <MessageContainer
                    channel={channel}
                    sender={message.sender}
                    withAnimation={withAnimation}
                    type={messageType}
                    isAiAgentSender={isAiAgentSender}
                >
                    {typeof message.content === 'string' ? (
                        <div
                            className={css.messageContent}
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(
                                    linkifyHtml(
                                        marked(message.content, {
                                            async: false,
                                        }),
                                    ),
                                ),
                            }}
                        />
                    ) : (
                        message.content
                    )}

                    {renderFirstJourneyImage && (
                        <img
                            className={css.journeyImage}
                            src={productImage.current.src}
                            alt={productImage.current.alt}
                        />
                    )}

                    {renderCampaignImage && (
                        <img
                            className={css.journeyImage}
                            src={campaignImage.current.url}
                            alt={campaignImage.current.name}
                        />
                    )}

                    {message?.attachments && (
                        <div className={css.productCarouselContainer}>
                            <ProductCarousel
                                shouldHideRepositionImage
                                products={attachments}
                            />
                        </div>
                    )}
                    {children}
                </MessageContainer>
            )
        default:
            assertUnreachable(messageType)
    }
}

type MessageContainerProps = {
    children: ReactNode
    channel: PlaygroundChannels
    sender: string
    withAnimation: boolean
    type: MessageType
    isAiAgentSender: boolean
    role?: string
}

const MessageContainer = ({
    children,
    sender,
    withAnimation,
    type,
    isAiAgentSender,
    channel,
    role,
}: MessageContainerProps) => {
    const getChannelIcon = (): string => {
        switch (channel) {
            case 'chat':
                return 'forum'
            case 'email':
                return 'mail'
            case 'sms':
                return 'sms'
            default:
                return 'mail'
        }
    }

    return (
        <div
            className={classnames(css.messageContainer, {
                [css.internalNoteContainer]: type === MessageType.INTERNAL_NOTE,
                [css.messageAnimation]: withAnimation,
                [css.messageContainerHover]:
                    !!isAiAgentSender && type === MessageType.MESSAGE,
            })}
            role={role}
            data-agent-message={isAiAgentSender}
        >
            <div className={css.messageAvatarContainer}>
                {isAiAgentSender ? (
                    <Avatar
                        isAIAgent={isAiAgentSender}
                        isAgent={isAiAgentSender}
                        name={sender}
                    />
                ) : (
                    <Avatar name={sender} className={css.messageAvatar} />
                )}
            </div>
            <div className={css.messageContentContainer}>
                <div className={css.messageHeader}>
                    {isAiAgentSender && type === MessageType.INTERNAL_NOTE && (
                        <i
                            className={classnames(
                                'material-icons',
                                css.avatarIcon,
                            )}
                        >
                            account_circle
                        </i>
                    )}
                    <span
                        className={classnames(
                            css.messageSenderCommon,
                            isAiAgentSender
                                ? type === MessageType.INTERNAL_NOTE
                                    ? css.aiAgentInternalNoteTypeSender
                                    : css.aiAgentTypeSender
                                : css.shopperTypeSender,
                        )}
                    >
                        {sender}
                    </span>
                    <i
                        className={classnames(
                            'material-icons',
                            css.messageTypeIcon,
                        )}
                        title={`${channel} channel`}
                    >
                        {type !== MessageType.INTERNAL_NOTE
                            ? getChannelIcon()
                            : 'note'}
                    </i>
                </div>
                <div
                    className={classnames(
                        css.messageContainer,
                        type === MessageType.ERROR && css.messageErrorContainer,
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    )
}

const PlaygroundPlaceholderMessage = () => {
    return (
        <div className={css.messageContent}>
            <div className={css.aiAgentLoadingSkeletonContainer} role="status">
                Thinking...
            </div>
        </div>
    )
}

export default PlaygroundMessage
