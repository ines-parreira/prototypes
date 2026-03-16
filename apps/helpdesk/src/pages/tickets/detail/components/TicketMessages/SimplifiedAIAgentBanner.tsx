import { useMemo } from 'react'

import { TicketInfobarTab, useTicketInfobarNavigation } from '@repo/navigation'
import classNames from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppSelector from 'hooks/useAppSelector'
import { useGetAiAgentFeedback } from 'models/aiAgentFeedback/queries'
import type { TicketMessage } from 'models/ticket/types'
import { isTrialMessageFromAIAgent } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import FailedWorkflowMessage from 'pages/tickets/detail/components/TicketMessages/AiAgentFailedWorkflowMessage'
import { getFailedWorkflowData } from 'pages/tickets/detail/components/TicketMessages/AiAgentFailedWorkflowMessage.util'
import Body from 'pages/tickets/detail/components/TicketMessages/Body'
import css from 'pages/tickets/detail/components/TicketMessages/SimplifiedAIAgentBanner.less'
import { isSessionImpersonated } from 'services/activityTracker/utils'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { useFeedbackTracking } from '../AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useCanAccessAIFeedback } from '../TicketFeedback/hooks/useCanAccessAIFeedback'

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
    const { activeTab, onChangeTab } = useTicketInfobarNavigation()
    const canAccessAIFeedback = useCanAccessAIFeedback()

    const account = useAppSelector(getCurrentAccountState)
    const currentUser = useAppSelector((state) => state.currentUser)

    const accountId: number = account.get('id')
    const userId: number = currentUser.get('id')

    const { onFeedbackTabOpened } = useFeedbackTracking({
        ticketId: message.ticket_id ?? 0,
        accountId: accountId,
        userId: userId,
    })

    const ticketFeedback = data?.data
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
        onFeedbackTabOpened('give-feedback-button-from-banner')
        onChangeTab(TicketInfobarTab.AIFeedback)
    }

    return (
        <>
            <div
                className={classNames(css.container, {
                    [css.hasError]: messageSummaryHasError,
                })}
            >
                <div className={css.content}>
                    {!isTrialMessage && (
                        <div>
                            {failedWorkflowData ? (
                                <FailedWorkflowMessage
                                    workflowData={failedWorkflowData}
                                    originalMessage={messageToDisplay}
                                />
                            ) : (
                                <>
                                    <div className={css.boldMessage}>
                                        {messageToDisplay}
                                    </div>
                                    {isImpersonated &&
                                        lastMessageWithFeedback?.feedback
                                            .executionId && (
                                            <div className={css.executionId}>
                                                {`Execution ID: ${lastMessageWithFeedback.feedback.executionId}`}
                                            </div>
                                        )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {canAccessAIFeedback && (
                <Button
                    intent="secondary"
                    size="small"
                    fillStyle="fill"
                    isDisabled={activeTab === TicketInfobarTab.AIFeedback}
                    onClick={handleClick}
                    className={classNames(css.reviewButton, {
                        [css.activeButton]:
                            activeTab === TicketInfobarTab.AIFeedback,
                    })}
                >
                    Give Feedback
                </Button>
            )}
        </>
    )
}

export default SimplifiedAIAgentBanner
