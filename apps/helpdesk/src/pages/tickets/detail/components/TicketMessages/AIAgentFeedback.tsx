import React, { FC } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import classNames from 'classnames'

import { Button } from '@gorgias/axiom'

import { SegmentEvent } from 'common/segment'
import { logEventWithSampling } from 'common/segment/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {
    BinaryFeedbackOnMessage,
    Feedback,
    FeedbackOnResource,
    MessageFeedback,
    SubmitMessageFeedback,
} from 'models/aiAgentFeedback/types'
import { TicketMessage } from 'models/ticket/types'
import IconButton from 'pages/common/components/button/IconButton'
import { useAIAgentSendFeedback } from 'pages/tickets/detail/hooks/useAIAgentSendFeedback'
import { getCurrentAccountId } from 'state/currentAccount/selectors'
import {
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'

import { useAIAgentResourcesWithFeedback } from '../../hooks/useAIAgentResourcesWithFeedback'
import { BANNER_TYPE } from '../AIAgentFeedbackBar/constants'

import css from './AIAgentFeedback.less'

export const CORRECT_RESPONSE = 'Is this correct?'
export const ACCURATE_RESPONSE = 'Is the response accurate?'
export const REVIEW_RESPONSE = 'Review Response'

type FeedbackIconButtonProps = {
    iconType: 'thumb_up' | 'thumb_down'
    hasFeedback: boolean
    isMessagePublic?: boolean
    onClick?: () => void
}

const FeedbackIconButton: FC<FeedbackIconButtonProps> = ({
    iconType,
    hasFeedback,
    isMessagePublic = false,
    onClick,
    ...props
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
        isDisabled={hasFeedback && isMessagePublic}
        {...props}
    >
        {iconType}
    </IconButton>
)

type Props = {
    message: TicketMessage
    messageFeedback?: MessageFeedback
    isTrialMessage?: boolean
    isTwoStepMessage?: boolean
}

const AIAgentFeedback: React.FC<Props> = ({
    message,
    messageFeedback,
    isTrialMessage,
    isTwoStepMessage,
}) => {
    const dispatch = useAppDispatch()
    const selectedAIMessage = useAppSelector(getSelectedAIMessage)
    const accountId = useAppSelector(getCurrentAccountId)
    const { onChangeTab } = useTicketInfobarNavigation()

    const { actions, guidance, knowledge } =
        useAIAgentResourcesWithFeedback(messageFeedback)

    const { aiAgentSendFeedback: submitFeedback } = useAIAgentSendFeedback()

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const feedbackOnMessage = messageFeedback?.feedbackOnMessage.find(
        ({ type }) => type === 'binary',
    ) as BinaryFeedbackOnMessage | undefined

    const feedbackOnResource = messageFeedback?.feedbackOnResource || []

    const hasPositiveFeedback =
        feedbackOnMessage?.feedback === 'thumbs_up' ||
        (feedbackOnResource.length > 0 &&
            feedbackOnResource.length ===
                (messageFeedback?.actions.length || 0) +
                    (messageFeedback?.guidance.length || 0) +
                    (messageFeedback?.knowledge.length || 0) &&
            feedbackOnResource.every(
                (feedback) => feedback.feedback === 'thumbs_up',
            ))
    const hasNegativeFeedback = feedbackOnMessage?.feedback === 'thumbs_down'

    const handleImproveResponse = () => {
        onChangeTab(TicketInfobarTab.AIFeedback)
        dispatch(
            changeTicketMessage({
                message,
            }),
        )

        logEventWithSampling(SegmentEvent.AiAgentFeedbackBannerClicked, {
            accountId,
            banner: BANNER_TYPE.SEND_FEEDBACK,
            outcome: 'improve_response',
        })

        logEventWithSampling(SegmentEvent.AiAgentFeedbackSidePanelViewed, {
            type: 'detail',
            accountId,
        })
    }

    const getFeedbackPayloadForMessage = (feedback: Feedback) => {
        return {
            feedbackOnResource: [],
            feedbackOnMessage: [
                {
                    type: 'binary',
                    feedback,
                },
            ],
        } as SubmitMessageFeedback
    }

    const handleSubmitFeedback = (feedback: Feedback) => {
        let feedbackPayload: SubmitMessageFeedback
        let bannerType = BANNER_TYPE.THUMBS_UP_IMPROVE_RESPONSE

        if (isMessagePublic) {
            const actionFeedbackOnResource = actions
                .filter((action) => action.feedback !== 'thumbs_up')
                .map(
                    (action) =>
                        ({
                            type: 'binary',
                            resourceType: action.type,
                            resourceId: action.id,
                            feedback,
                        }) as FeedbackOnResource,
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
                        }) as FeedbackOnResource,
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
                        }) as FeedbackOnResource,
                )

            if (
                actionFeedbackOnResource.length === 0 &&
                guidanceFeedbackOnResource.length === 0 &&
                knowledgeFeedbackOnResource.length === 0
            ) {
                // If no feedback on resources, then feedback is on message
                feedbackPayload = getFeedbackPayloadForMessage(feedback)
            } else {
                feedbackPayload = {
                    feedbackOnResource: [
                        ...actionFeedbackOnResource,
                        ...guidanceFeedbackOnResource,
                        ...knowledgeFeedbackOnResource,
                    ],
                    feedbackOnMessage: [],
                }
            }
        } else {
            bannerType = BANNER_TYPE.THUMBS_UP_AND_DOWN
            feedbackPayload = getFeedbackPayloadForMessage(feedback)
        }

        logEventWithSampling(SegmentEvent.AiAgentFeedbackBannerClicked, {
            accountId,
            banner: bannerType,
            outcome: feedback,
        })

        void submitFeedback(message, feedbackPayload)
    }

    const shouldShowTitleAndReviewButton = isMessagePublic || isTwoStepMessage
    return (
        <div className={css.feedbackContainer}>
            <div className={css.feedbackQuestion}>
                {shouldShowTitleAndReviewButton
                    ? CORRECT_RESPONSE
                    : ACCURATE_RESPONSE}
            </div>
            <div className={css.feedbackButtons}>
                {(messageFeedback?.allowsFeedback || isTrialMessage) && (
                    <>
                        <FeedbackIconButton
                            hasFeedback={hasPositiveFeedback}
                            iconType="thumb_up"
                            onClick={() => {
                                if (hasPositiveFeedback) {
                                    return
                                }
                                handleSubmitFeedback('thumbs_up')
                            }}
                            aria-label="Thumbs up button"
                            isMessagePublic={isMessagePublic}
                        />

                        {!isTrialMessage && (
                            <FeedbackIconButton
                                hasFeedback={hasNegativeFeedback}
                                iconType="thumb_down"
                                onClick={() => {
                                    if (hasNegativeFeedback) {
                                        return
                                    }

                                    handleSubmitFeedback('thumbs_down')
                                }}
                                aria-label="Thumbs down button"
                            />
                        )}
                    </>
                )}

                {(shouldShowTitleAndReviewButton || isTrialMessage) && (
                    <Button
                        intent="secondary"
                        size="small"
                        fillStyle="fill"
                        onClick={handleImproveResponse}
                        isDisabled={selectedAIMessage?.id === message.id}
                        className={css.feedbackButton}
                    >
                        {REVIEW_RESPONSE}
                    </Button>
                )}
            </div>
        </div>
    )
}

export default AIAgentFeedback
