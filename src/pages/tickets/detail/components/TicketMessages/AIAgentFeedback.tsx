import React from 'react'
import classNames from 'classnames'

import IconButton from 'pages/common/components/button/IconButton'
import Button from 'pages/common/components/button/Button'

import {TicketMessage} from 'models/ticket/types'
import {
    BinaryFeedbackOnMessage,
    MessageFeedback,
} from 'models/aiAgentFeedback/types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'

import {
    changeActiveTab,
    changeTicketMessage,
    getSelectedAIMessage,
} from 'state/ui/ticketAIAgentFeedback'
import {TicketAIAgentFeedbackTab} from 'state/ui/ticketAIAgentFeedback/constants'

export const CORRECT_RESPONSE = 'Is this correct?'
export const ACCURATE_RESPONSE = 'Is the response accurate?'
export const IMPROVE_RESPONSE = 'Improve response'

import css from './AIAgentFeedback.less'

type FeedbackIconButtonProps = {
    iconType: 'thumb_up' | 'thumb_down'
    hasFeedback: boolean
}

const FeedbackIconButton: React.FC<FeedbackIconButtonProps> = ({
    iconType,
    hasFeedback,
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

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    // TO DO: Find a way to determine (negative) feedback on non-answered messages (internal notes created by AI Agent)
    const feedback = messageFeedback?.feedbackOnMessage.find(
        ({type}) => type === 'binary'
    ) as BinaryFeedbackOnMessage | undefined

    const hasPositiveFeedback = feedback?.feedback === 'thumbs_up'
    const hasNegativeFeedback = feedback?.feedback === 'thumbs_down'

    return (
        <div className={css.feedbackContainer}>
            <div className={css.feedbackQuestion}>
                {isMessagePublic ? CORRECT_RESPONSE : ACCURATE_RESPONSE}
            </div>
            <div className={css.feedbackButtons}>
                <FeedbackIconButton
                    hasFeedback={hasPositiveFeedback}
                    iconType="thumb_up"
                />

                {isMessagePublic ? (
                    <Button
                        intent="secondary"
                        size="small"
                        fillStyle="fill"
                        onClick={handleImproveResponse}
                        isDisabled={selectedAIMessage === message}
                        className={css.feedbackButton}
                    >
                        {IMPROVE_RESPONSE}
                    </Button>
                ) : (
                    <FeedbackIconButton
                        hasFeedback={hasNegativeFeedback}
                        iconType="thumb_down"
                    />
                )}
            </div>
        </div>
    )
}

export default AIAgentFeedback
