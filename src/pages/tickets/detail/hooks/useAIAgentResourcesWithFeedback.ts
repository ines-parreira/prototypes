import {
    Feedback,
    MessageFeedback,
    TicketFeedback,
} from 'models/aiAgentFeedback/types'

import {useGetAiAgentFeedback} from '../../../../models/aiAgentFeedback/queries'
import {ActionStatus} from '../components/AIAgentFeedbackBar/types'

export type ActionWithFeedback = {
    feedback: Feedback
    type: 'soft_action' | 'hard_action'
    id: number
    name: string
    status?: ActionStatus | undefined
}[]

export type PreviousMessageWithHardAction = {
    id: number
    hardAction: {id: number; name: string}
} | null

export const useAIAgentResourcesWithFeedbackUtil = {
    getPreviousMessageWithHardAction: (
        ticketFeedback: TicketFeedback | undefined,
        messageFeedback: MessageFeedback | undefined
    ) => {
        let hardActionCount = 0
        let previousMessageWithHardAction: {
            id: number
            hardAction: {id: number; name: string}
        } | null = null
        if (
            ticketFeedback &&
            messageFeedback &&
            ticketFeedback.messages.length > 0
        ) {
            for (const message of ticketFeedback.messages) {
                if (message.messageId >= messageFeedback.messageId) {
                    break
                }
                for (const action of message.actions) {
                    if (action.type === 'hard_action') {
                        hardActionCount += 1
                        previousMessageWithHardAction = {
                            id: message.messageId,
                            hardAction: action,
                        }
                    }
                }
            }
        }
        return {hardActionCount, previousMessageWithHardAction}
    },
    checkIfMessageFeedbackHasHardAction: (
        actionsWithFeedback: ActionWithFeedback,
        previousMessageWithHardAction: PreviousMessageWithHardAction,
        messageFeedback: MessageFeedback | undefined | null
    ) => {
        if (messageFeedback) {
            return !!actionsWithFeedback.find(
                (action) =>
                    action.id === previousMessageWithHardAction?.hardAction.id
            )
        }
        return false
    },
}

export const useAIAgentResourcesWithFeedback = (
    messageFeedback?: MessageFeedback | null
) => {
    const {data} = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })
    const ticketFeedback = data?.data

    if (!messageFeedback) {
        return {
            actions: [],
            guidance: [],
            knowledge: [],
        }
    }

    const {actions, guidance, knowledge, feedbackOnResource} = messageFeedback

    const actionsWithFeedback = actions.map((action) => {
        const feedback = feedbackOnResource.find(
            (feedback) =>
                (feedback.resourceType === 'soft_action' ||
                    feedback.resourceType === 'hard_action') &&
                feedback.resourceId === action.id
        )

        return {
            ...action,
            feedback: feedback?.feedback || null,
        }
    })

    const guidanceWithFeedback = guidance.map((guide) => {
        const feedback = feedbackOnResource.find(
            (feedback) =>
                feedback.resourceType === 'guidance' &&
                feedback.resourceId === guide.id
        )

        return {
            ...guide,
            feedback: feedback?.feedback || null,
        }
    })

    const knowledgeWithFeedback = knowledge.map((knowledge) => {
        const feedback = feedbackOnResource.find(
            (feedback) =>
                feedback.resourceType === knowledge.type &&
                feedback.resourceId === knowledge.id
        )

        return {
            ...knowledge,
            feedback: feedback?.feedback || null,
        }
    })

    const {hardActionCount, previousMessageWithHardAction} =
        useAIAgentResourcesWithFeedbackUtil.getPreviousMessageWithHardAction(
            ticketFeedback,
            messageFeedback
        )

    if (messageFeedback.summary && hardActionCount > 0) {
        const actionRegex = /AI Agent performed the /
        const actionMatch = actionRegex.exec(messageFeedback.summary)
        if (
            actionMatch &&
            previousMessageWithHardAction &&
            previousMessageWithHardAction?.id !== messageFeedback.messageId &&
            previousMessageWithHardAction?.hardAction.id
        ) {
            const actionName = previousMessageWithHardAction.hardAction.name
            const action = {
                name: actionName,
                type: 'hard_action' as const,
                feedback: null,
                id: previousMessageWithHardAction.hardAction.id,
                status: ActionStatus.CONFIRMED,
            }

            actionsWithFeedback.push(action)
        } else {
            const actionPendingRegex =
                /is waiting for confirmation from the customer/
            const actionPendingMatch = actionPendingRegex.exec(
                messageFeedback.summary
            )
            if (
                !actionPendingMatch &&
                previousMessageWithHardAction?.id !==
                    messageFeedback.messageId &&
                previousMessageWithHardAction?.hardAction.name &&
                !useAIAgentResourcesWithFeedbackUtil.checkIfMessageFeedbackHasHardAction(
                    actionsWithFeedback,
                    previousMessageWithHardAction,
                    messageFeedback
                )
            ) {
                const action = {
                    name: previousMessageWithHardAction?.hardAction.name,
                    type: 'hard_action' as const,
                    feedback: null,
                    id: previousMessageWithHardAction?.hardAction.id,
                    status: ActionStatus.NOT_CONFIRMED,
                }

                actionsWithFeedback.push(action)
            }
        }
    }

    return {
        actions: actionsWithFeedback,
        guidance: guidanceWithFeedback,
        knowledge: knowledgeWithFeedback,
    }
}
