import {MessageFeedback} from 'models/aiAgentFeedback/types'

export const useAIAgentResourcesWithFeedback = (
    messageFeedback?: MessageFeedback | null
) => {
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
                feedback.resourceType === 'action' &&
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

    return {
        actions: actionsWithFeedback,
        guidance: guidanceWithFeedback,
        knowledge: knowledgeWithFeedback,
    }
}
