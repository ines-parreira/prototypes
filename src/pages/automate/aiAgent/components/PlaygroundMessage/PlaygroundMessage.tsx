import React from 'react'
import classnames from 'classnames'
import Skeleton from 'react-loading-skeleton'
import Avatar from 'pages/common/components/Avatar/Avatar'
import aiAgentAvatarSrc from 'assets/img/ai-agent/ai-agent-avatar.png'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Loader from 'pages/common/components/Loader/Loader'
import css from './PlaygroundMessage.less'

export const AI_AGENT_SENDER = 'AI Agent'

export enum MessageType {
    INTERNAL_NOTE = 'INTERNAL_NOTE',
    MESSAGE = 'MESSAGE',
}

type Props = {
    sender: string
    type: MessageType
    message: string
    isLoading?: boolean
    aiAgentProcessingStatus?: string
}

const PlaygroundMessage = ({
    sender,
    type,
    message,
    isLoading = false,
    aiAgentProcessingStatus = 'Processing',
}: Props) => {
    const isAiAgentSender = sender === AI_AGENT_SENDER

    return (
        <div
            className={classnames(css.messageContainer, {
                [css.internalNoteContainer]: type === MessageType.INTERNAL_NOTE,
            })}
        >
            <div>
                {isAiAgentSender ? (
                    <Avatar
                        url={aiAgentAvatarSrc}
                        className={css.messageAvatar}
                    />
                ) : (
                    <Avatar name={sender} className={css.messageAvatar} />
                )}
            </div>
            <div className={css.messageContentContainer}>
                <div>
                    {isAiAgentSender && type === MessageType.INTERNAL_NOTE && (
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
                                ? type === MessageType.MESSAGE
                                    ? css.aiAgentTypeSender
                                    : css.aiAgentInternalNoteTypeSender
                                : css.shopperTypeSender
                        )}
                    >
                        {sender}
                    </span>
                    <i
                        className={classnames(
                            'material-icons',
                            css.messageTypeIcon
                        )}
                    >
                        mail
                    </i>
                </div>
                <div>
                    {isLoading ? (
                        <div className={css.aiAgentLoadingSkeletonContainer}>
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
                                <Badge type={ColorType.Magenta}>
                                    <Loader
                                        className={css.aiAgentProcessingIcon}
                                        minHeight="12px"
                                        size="12px"
                                    />
                                    <div
                                        className={css.aiAgentProcessingStatus}
                                    >
                                        {aiAgentProcessingStatus}
                                    </div>
                                </Badge>
                            )}
                        </div>
                    ) : (
                        <div>{message}</div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PlaygroundMessage
