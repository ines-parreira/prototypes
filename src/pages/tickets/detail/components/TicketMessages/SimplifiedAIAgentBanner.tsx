import { useMemo } from 'react'

import classNames from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import { TicketMessage } from 'models/ticket/types'
import { isTrialMessageFromAIAgent } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import FailedWorkflowMessage from 'pages/tickets/detail/components/TicketMessages/AiAgentFailedWorkflowMessage'
import { getFailedWorkflowData } from 'pages/tickets/detail/components/TicketMessages/AiAgentFailedWorkflowMessage.util'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'
import css from 'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner.less'
import { isSessionImpersonated } from 'services/activityTracker/utils'
import { changeActiveTab, getActiveTab } from 'state/ui/ticketAIAgentFeedback'
import { TicketAIAgentFeedbackTab } from 'state/ui/ticketAIAgentFeedback/constants'

export type SimplifiedAIAgentBannerProps = {
    message: TicketMessage
    messages: TicketMessage[]
}

const SimplifiedAIAgentBanner = ({
    message,
    messages,
}: SimplifiedAIAgentBannerProps) => {
    const { data } = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const ticketFeedback = data?.data
    const dispatch = useAppDispatch()
    const activeTab = useAppSelector(getActiveTab)
    const isImpersonated = useMemo(() => isSessionImpersonated(), [])
    const lastMessageWithFeedback = useMemo(() => {
        if (!ticketFeedback?.messages) return null

        // Create a shallow copy before reversing to avoid mutating props
        const reversedMessages = [...messages].reverse()

        for (const message of reversedMessages) {
            const feedback = ticketFeedback.messages.find(
                (feedback) => feedback.messageId === message.id,
            )
            if (feedback) {
                return { message, feedback }
            }
        }

        return null
    }, [messages, ticketFeedback])

    // If message is not public, it is an internal note created by AI Agent
    const isMessagePublic = message.public

    const isTrialMessage = isTrialMessageFromAIAgent(message)
    const { messageSummaryContainer, messageSummaryHasError } = useMemo(() => {
        const messageSummaryHasError =
            !!lastMessageWithFeedback?.feedback.summary?.includes(
                'data-error-summary="true"',
            )

        const messageSummaryContainer = lastMessageWithFeedback?.feedback
            .summary ? (
            <div
                dangerouslySetInnerHTML={{
                    __html: lastMessageWithFeedback?.feedback.summary,
                }}
            />
        ) : null

        return {
            messageSummaryContainer,
            messageSummaryHasError,
        }
    }, [lastMessageWithFeedback?.feedback.summary])

    const messageToDisplay = isMessagePublic
        ? messageSummaryContainer
        : messageSummaryContainer || <Body message={message} />

    // What if isTrialMessage is true? in simplified version would render only button and icon?
    if (!messageToDisplay || isTrialMessage) {
        return null
    }

    const failedWorkflowData = getFailedWorkflowData(message)

    const handleClick = () => {
        dispatch(
            changeActiveTab({ activeTab: TicketAIAgentFeedbackTab.AIAgent }),
        )
    }

    return (
        <div
            className={classNames(css.container, {
                [css.hasError]: messageSummaryHasError,
            })}
        >
            <i className={classNames('material-icons', css.icon)}>
                {messageSummaryHasError ? 'error' : 'auto_awesome'}
            </i>
            <div className={css.content}>
                {!isTrialMessage && (
                    <div
                        className={classNames({
                            [css.boldMessage]: isMessagePublic,
                        })}
                    >
                        {failedWorkflowData ? (
                            <FailedWorkflowMessage
                                workflowData={failedWorkflowData}
                                originalMessage={messageToDisplay}
                            />
                        ) : (
                            <>
                                {messageToDisplay}
                                {isImpersonated &&
                                    lastMessageWithFeedback?.feedback
                                        .executionId && (
                                        <div className={css.executionId}>
                                            {`executionId: ${lastMessageWithFeedback.feedback.executionId}`}
                                        </div>
                                    )}
                            </>
                        )}
                    </div>
                )}
                <Button
                    intent="secondary"
                    size="small"
                    fillStyle="fill"
                    onClick={handleClick}
                    className={classNames({
                        [css.activeButton]:
                            activeTab === TicketAIAgentFeedbackTab.AIAgent,
                    })}
                >
                    Give Feedback
                </Button>
            </div>
        </div>
    )
}

export default SimplifiedAIAgentBanner
