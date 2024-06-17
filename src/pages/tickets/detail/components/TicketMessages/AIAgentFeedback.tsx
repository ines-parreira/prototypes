import React from 'react'
import classNames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'

import {TicketMessage} from 'models/ticket/types'
import {
    BinaryFeedbackOnMessage,
    Feedback,
    FeedbackOnResource,
    MessageFeedback,
    SubmitMessageFeedback,
} from 'models/aiAgentFeedback/types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {useAIAgentSendFeedback} from 'pages/tickets/detail/hooks/useAIAgentSendFeedback'
import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'

import {useAIAgentResourcesWithFeedback} from '../../hooks/useAIAgentResourcesWithFeedback'

export const CORRECT_RESPONSE = 'Is this correct?'
export const ACCURATE_RESPONSE = 'Is the response accurate?'
export const IMPROVE_RESPONSE = 'Improve response'

import css from './AIAgentFeedback.less'

type FeedbackIconButtonProps = {
    iconType: 'thumb_up' | 'thumb_down'
    hasFeedback: boolean
    isMessagePublic?: boolean
    onClick?: () => void
}

const FeedbackIconButton: React.FC<FeedbackIconButtonProps> = ({
    iconType,
    hasFeedback,
    isMessagePublic = false,
    onClick,
}) => (
    <IconButton
        fillStyle="fill"
        intent="secondary"
        size="small"
        iconClassName={
            hasFeedback ? 'material-icons' : 'material-icons-outlined'
        }
        className={classNames(css.feedbackButton, css[iconType], {
            [css.withFeedback]: hasFeedback,
        })}
        onClick={onClick}
        disabled={hasFeedback && isMessagePublic}
    >
        {iconType}
    </IconButton>
)

type Props = {
    message: TicketMessage
    messageFeedback?: MessageFeedback
}

const AIAgentFeedback: React.FC<Props> = ({message, messageFeedback}) => {
    const dispatch = useAppDispatch()
    const selectedAIMessage = useAppSelector(getSelectedAIMessage)

    const {actions, guidance, knowledge} =
        useAIAgentResourcesWithFeedback(messageFeedback)

    const {aiAgentSendFeedback: submitFeedback} = useAIAgentSendFeedback()

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const feedbackOnMessage = messageFeedback?.feedbackOnMessage.find(
        ({type}) => type === 'binary'
    ) as BinaryFeedbackOnMessage | undefined

    const feedbackOnResource = messageFeedback?.feedbackOnResource || []

    const hasPositiveFeedback =
        feedbackOnMessage?.feedback === 'thumbs_up' ||
        (feedbackOnResource.length > 0 &&
            feedbackOnResource.every(
                (feedback) => feedback.feedback === 'thumbs_up'
            ))
    const hasNegativeFeedback = feedbackOnMessage?.feedback === 'thumbs_down'

    const handleImproveResponse = () => {
        dispatch(
            changeActiveTab({
                activeTab: TicketAIAgentFeedbackTab.AIAgent,
            })
        )
        dispatch(
            changeTicketMessage({
                message,
            })
        )
    }

    const handleSubmitFeedback = (feedback: Feedback) => {
        let feedbackPayload: SubmitMessageFeedback

        if (isMessagePublic) {
            const actionFeedbackOnResource = actions
                .filter((action) => action.feedback !== 'thumbs_up')
                .map(
                    (action) =>
                        ({
                            type: 'binary',
                            resourceType: 'action',
                            resourceId: action.id,
                            feedback,
                        } as FeedbackOnResource)
                )

            const guidanceFeedbackOnResource = guidance
                .filter((guidance) => guidance.feedback !== 'thumbs_up')
                .map(
                    (guide) =>
                        ({
                            type: 'binary',
                            resourceType: 'guidance',
                            resourceId: guide.id,
                            feedback,
                        } as FeedbackOnResource)
                )

            const knowledgeFeedbackOnResource = knowledge
                .filter((knowledge) => knowledge.feedback !== 'thumbs_up')
                .map(
                    (knowledge) =>
                        ({
                            type: 'binary',
                            resourceType: knowledge.type,
                            resourceId: knowledge.id,
                            feedback,
                        } as FeedbackOnResource)
                )

            feedbackPayload = {
                feedbackOnResource: [
                    ...actionFeedbackOnResource,
                    ...guidanceFeedbackOnResource,
                    ...knowledgeFeedbackOnResource,
                ],
                feedbackOnMessage: [],
            }
        } else {
            feedbackPayload = {
                feedbackOnResource: [],
                feedbackOnMessage: [
                    {
                        type: 'binary',
                        feedback,
                    },
                ],
            }
        }

        void submitFeedback(message, feedbackPayload)
    }

    return (
        <div className={css.feedbackContainer}>
            <div className={css.feedbackQuestion}>
                {isMessagePublic ? CORRECT_RESPONSE : ACCURATE_RESPONSE}
            </div>
            <div className={css.feedbackButtons}>
                <FeedbackIconButton
                    hasFeedback={hasPositiveFeedback}
                    iconType="thumb_up"
                    onClick={() => {
                        if (hasPositiveFeedback) {
                            return
                        }

                        handleSubmitFeedback('thumbs_up')
                    }}
                    isMessagePublic={isMessagePublic}
                />

                {isMessagePublic ? (
                    <Button
                        intent="secondary"
                        size="small"
                        fillStyle="fill"
                        onClick={handleImproveResponse}
                        isDisabled={selectedAIMessage?.id === message.id}
                        className={css.feedbackButton}
                    >
                        {IMPROVE_RESPONSE}
                    </Button>
                ) : (
                    <FeedbackIconButton
                        hasFeedback={hasNegativeFeedback}
                        iconType="thumb_down"
                        onClick={() => {
                            if (hasNegativeFeedback) {
                                return
                            }

                            handleSubmitFeedback('thumbs_down')
                        }}
                    />
                )}
            </div>
        </div>
    )
}

export default AIAgentFeedback
