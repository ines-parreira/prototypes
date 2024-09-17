import React, {useEffect, useState} from 'react'
import classnames from 'classnames'
import {sanitizeHtmlDefault} from 'utils/html'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import Avatar from 'pages/common/components/Avatar/Avatar'
import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import error from 'assets/img/icons/error.svg'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Loader from 'pages/common/components/Loader/Loader'
import {
    MessageType,
    PlaygroundMessage as PlaygroundMessageType,
    ProcessingStatus,
} from 'models/aiAgentPlayground/types'
import TicketEvent from '../TicketEvent/TicketEvent'
import css from './PlaygroundMessage.less'

export const AI_AGENT_SENDER = 'AI Agent'

type Props = {
    withAnimation?: boolean
    message: PlaygroundMessageType
}

const PlaygroundMessage = ({withAnimation = false, message}: Props) => {
    const isAiAgentSender = message.sender === AI_AGENT_SENDER
    const [processingStatus, setProcessingStatus] = useState(
        ProcessingStatus.CHECKING_PERMISSIONS
    )

    const aiAgentProcessingStatusUpdate = (
        newStatus: ProcessingStatus,
        delay: number
    ) => {
        return setTimeout(() => {
            setProcessingStatus(newStatus)
        }, delay)
    }

    useEffect(() => {
        const timeoutsToClear: NodeJS.Timeout[] = []
        if (message.type === MessageType.PLACEHOLDER) {
            timeoutsToClear.push(
                aiAgentProcessingStatusUpdate(
                    ProcessingStatus.SUMMARIZING,
                    5000
                ),
                aiAgentProcessingStatusUpdate(
                    ProcessingStatus.GATHERING_INFO,
                    10000
                ),
                aiAgentProcessingStatusUpdate(
                    ProcessingStatus.GENERATING,
                    15000
                )
            )
        }
        return () => {
            timeoutsToClear.forEach(clearTimeout)
        }
    }, [message])

    // TODO: refactor component and support render component per message type
    // https://linear.app/gorgias/issue/AUTAI-1497/create-render-component-for-playgroundmessage
    if (message.type === MessageType.TICKET_EVENT) {
        return <TicketEvent type={message.outcome} />
    }

    const isAcceptedMessageType =
        message.type === MessageType.MESSAGE ||
        message.type === MessageType.PLACEHOLDER ||
        message.type === MessageType.PROMPT

    return (
        <div
            className={classnames(css.messageContainer, {
                [css.internalNoteContainer]:
                    message.type === MessageType.INTERNAL_NOTE,
                [css.messageAnimation]: withAnimation,
            })}
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
                        name={message.sender}
                        className={css.messageAvatar}
                    />
                )}
            </div>
            <div className={css.messageContentContainer}>
                <div className={css.messageHeader}>
                    {isAiAgentSender &&
                        message.type === MessageType.INTERNAL_NOTE && (
                            <i
                                className={classnames(
                                    'material-icons',
                                    css.avatarIcon
                                )}
                            >
                                account_circle
                            </i>
                        )}
                    <span
                        className={classnames(
                            css.messageSenderCommon,
                            isAiAgentSender
                                ? isAcceptedMessageType
                                    ? css.aiAgentTypeSender
                                    : css.aiAgentInternalNoteTypeSender
                                : css.shopperTypeSender
                        )}
                    >
                        {message.sender}
                    </span>
                    <i
                        className={classnames(
                            'material-icons',
                            css.messageTypeIcon
                        )}
                    >
                        {isAcceptedMessageType ? 'mail' : 'note'}
                    </i>
                </div>
                <div
                    className={classnames(
                        css.messageContainer,
                        message.type === MessageType.ERROR &&
                            css.messageErrorContainer
                    )}
                >
                    {message.type === MessageType.ERROR && (
                        <div className={css.aiAgentErrorIconContainer}>
                            <img alt="timer" src={error} />
                        </div>
                    )}
                    {message.type === MessageType.MESSAGE ||
                    message.type === MessageType.INTERNAL_NOTE ||
                    message.type === MessageType.PROMPT ||
                    message.type === MessageType.ERROR ? (
                        typeof message.content === 'string' ? (
                            <div
                                className={css.messageContent}
                                dangerouslySetInnerHTML={{
                                    __html: sanitizeHtmlDefault(
                                        message.content
                                    ),
                                }}
                            />
                        ) : (
                            message.content
                        )
                    ) : (
                        <div
                            className={classnames(
                                css.messageContent,
                                css.aiAgentLoadingSkeletonContainer
                            )}
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
                            {isAiAgentSender && (
                                <Badge
                                    type={ColorType.Magenta}
                                    className={css.aiAgentProcessingBadge}
                                >
                                    <Loader
                                        className={css.aiAgentProcessingIcon}
                                        minHeight="12px"
                                        size="12px"
                                    />
                                    <div
                                        className={css.aiAgentProcessingStatus}
                                    >
                                        {processingStatus}
                                    </div>
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export const PlaygroundGenericErrorMessage = ({
    onClick,
}: {
    onClick: () => void
}) => (
    <div className={css.errorMessageText}>
        AI Agent encountered an error and didn’t send a response.
        <span className={css.errorMessageLink} onClick={onClick}>
            Try again
        </span>
    </div>
)

export default PlaygroundMessage
