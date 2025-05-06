import { ReactNode, useEffect, useState } from 'react'

import classnames from 'classnames'

import { Badge, LoadingSpinner, Skeleton } from '@gorgias/merchant-ui-kit'

import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import error from 'assets/img/icons/error.svg'
import {
    AgentSkill,
    MessageType,
    PlaygroundMessage as PlaygroundMessageType,
    ProcessingStatus,
} from 'models/aiAgentPlayground/types'
import Avatar from 'pages/common/components/Avatar/Avatar'
import { ProductCarousel } from 'pages/common/components/ProductCarousel'
import { assertUnreachable } from 'utils'
import { sanitizeHtmlDefault } from 'utils/html'

import TicketEvent from '../../../components/TicketEvent/TicketEvent'
import { PlaygroundChannels } from '../PlaygroundChat/PlaygroundChat.types'

import css from './PlaygroundMessage.less'

export const AI_AGENT_SENDER = 'AI Agent'
export const GREETING_MESSAGE_TEXT = 'Hey there 👋'

type Props = {
    withAnimation?: boolean
    message: PlaygroundMessageType
    channel: PlaygroundChannels
}

const PlaygroundMessage = ({
    withAnimation = false,
    message,
    channel,
}: Props) => {
    const isAiAgentSender = message.sender === AI_AGENT_SENDER
    const messageType = message.type

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
                    agentSkill={
                        message.type === MessageType.MESSAGE
                            ? message.agentSkill
                            : undefined
                    }
                    isAiAgentSender={isAiAgentSender}
                >
                    {typeof message.content === 'string' ? (
                        <div
                            className={css.messageContent}
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtmlDefault(message.content),
                            }}
                        />
                    ) : (
                        message.content
                    )}

                    {message?.attachments && (
                        <div className={css.productCarouselContainer}>
                            <ProductCarousel
                                shouldHideRepositionImage
                                products={attachments}
                            />
                        </div>
                    )}
                </MessageContainer>
            )
        default:
            assertUnreachable(messageType)
    }
}

export const PlaygroundGenericErrorMessage = ({
    onClick,
}: {
    onClick: () => void
}) => (
    <div className={css.errorMessageText}>
        AI Agent encountered an error and didn’t send a response.
        <div
            className={css.errorMessageLink}
            role="button"
            tabIndex={0}
            onClick={onClick}
        >
            Try again.
        </div>
    </div>
)

const agentSkillText = {
    [AgentSkill.SALES]: 'Shopping Assistant',
    [AgentSkill.SUPPORT]: 'Support Agent',
}

type MessageContainerProps = {
    children: ReactNode
    channel: PlaygroundChannels
    sender: string
    withAnimation: boolean
    type: MessageType
    agentSkill?: AgentSkill
    isAiAgentSender: boolean
    role?: string
}

const MessageContainer = ({
    children,
    sender,
    withAnimation,
    type,
    agentSkill,
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
        }
    }

    return (
        <div
            className={classnames(css.messageContainer, {
                [css.internalNoteContainer]: type === MessageType.INTERNAL_NOTE,
                [css.messageAnimation]: withAnimation,
            })}
            role={role}
        >
            <div>
                {isAiAgentSender ? (
                    <Avatar
                        size={36}
                        url={aiAgentAvatarSrc}
                        className={css.messageAvatar}
                    />
                ) : (
                    <Avatar
                        size={36}
                        name={sender}
                        className={css.messageAvatar}
                    />
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
                    {agentSkill && (
                        <Badge
                            className={css.messageBadge}
                            type={'magenta'}
                            corner="square"
                        >
                            {agentSkillText[agentSkill]}
                        </Badge>
                    )}
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
    const [processingStatus, setProcessingStatus] = useState(
        ProcessingStatus.CHECKING_PERMISSIONS,
    )

    useEffect(() => {
        const timeoutsToClear: NodeJS.Timeout[] = []

        const aiAgentProcessingStatusUpdate = (
            newStatus: ProcessingStatus,
            delay: number,
        ) => {
            return setTimeout(() => {
                setProcessingStatus(newStatus)
            }, delay)
        }

        timeoutsToClear.push(
            aiAgentProcessingStatusUpdate(ProcessingStatus.SUMMARIZING, 5000),
            aiAgentProcessingStatusUpdate(
                ProcessingStatus.GATHERING_INFO,
                10000,
            ),
            aiAgentProcessingStatusUpdate(ProcessingStatus.GENERATING, 15000),
        )
        return () => {
            timeoutsToClear.forEach(clearTimeout)
        }
    }, [])

    return (
        <div
            className={classnames(
                css.messageContent,
                css.aiAgentLoadingSkeletonContainer,
            )}
            role="status"
            aria-live="polite"
        >
            <Skeleton
                className={css.aiAgentLoadingSkeleton}
                height={32}
                width="100%"
                count={1}
            />
            <Skeleton
                className={css.aiAgentLoadingSkeleton}
                height={32}
                width="80%"
                count={1}
            />
            <Skeleton
                className={css.aiAgentLoadingSkeleton}
                height={32}
                width="50%"
                count={1}
            />
            <Badge type={'magenta'} className={css.aiAgentProcessingBadge}>
                <LoadingSpinner
                    size={12}
                    className={css.aiAgentProcessingIcon}
                />
                <div className={css.aiAgentProcessingStatus}>
                    {processingStatus}
                </div>
            </Badge>
        </div>
    )
}

export default PlaygroundMessage
