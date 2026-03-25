import { useMemo } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import {
    ReasoningResponseType,
    useGetMessageAiReasoning,
} from 'models/knowledgeService/queries'
import { useGetResourcesReasoningMetadata } from 'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetResourcesReasoningMetadata'

import { parseReasoningResources } from '../utils/reasoningResources'

export interface UseAiAgentReasoningParams {
    objectId: string
    objectType: 'TICKET' | 'TEST_MODE_SESSION'
    messageId: string
    enabled?: boolean
    isHandover?: boolean
    refetchInterval?: number | false
}

/**
 * Custom hook for fetching and processing AI agent reasoning data.
 *
 * This hook handles:
 * - Fetching reasoning data from the knowledge service API
 * - Parsing and formatting reasoning content (response, outcome, and task reasoning)
 * - Extracting knowledge resources from reasoning text
 * - Enriching resources with metadata
 * - Managing loading and error states
 */
export const useAiAgentReasoning = ({
    objectId,
    objectType,
    messageId,
    enabled = true,
    isHandover = false,
    refetchInterval,
}: UseAiAgentReasoningParams) => {
    const showReasoningForCanceledTasks = useFlag(
        FeatureFlagKey.ShowReasoningForCanceledTasks,
    )

    const {
        data: messageAiReasoning,
        refetch: refetchMessageAiReasoning,
        isError,
        error,
    } = useGetMessageAiReasoning(
        {
            objectId,
            objectType,
            messageId,
        },
        {
            enabled: enabled && !!messageId,
            refetchInterval,
        },
    )

    const { reasoningContent, reasoningResources, staticMessage } =
        useMemo(() => {
            if (messageAiReasoning?.reasoning) {
                const outcomeReasoning = messageAiReasoning.reasoning.find(
                    (reasoning) =>
                        reasoning.responseType ===
                        ReasoningResponseType.OUTCOME,
                )
                const responseReasoning = messageAiReasoning.reasoning.find(
                    (reasoning) =>
                        reasoning.responseType ===
                        ReasoningResponseType.RESPONSE,
                )
                const canceledTasks =
                    (showReasoningForCanceledTasks &&
                        messageAiReasoning.canceledTasks) ||
                    []

                const fullDetailsReasoning =
                    messageAiReasoning.reasoning.filter(
                        (reasoning) =>
                            reasoning.responseType ===
                                ReasoningResponseType.TASK &&
                            (!messageAiReasoning.usedTasks ||
                                messageAiReasoning.usedTasks.includes(
                                    reasoning.targetId,
                                ) ||
                                canceledTasks.includes(reasoning.targetId)),
                    )

                const hasFullDetails = fullDetailsReasoning.length > 0
                const hasOutcome = !!outcomeReasoning?.value

                let responseReasoningContent = responseReasoning?.value ?? ''
                if (
                    responseReasoningContent &&
                    (hasFullDetails || hasOutcome)
                ) {
                    responseReasoningContent = `${responseReasoningContent}\n\n&nbsp;\n\n`
                }

                let fullDetailsReasoningContent = ''
                let outcomeReasoningContent = ''
                if (hasFullDetails && hasOutcome) {
                    fullDetailsReasoningContent = `<div class="fullDetailsContainer"><div class="fullDetailsHeader">Full details:</div>\n\n${fullDetailsReasoning
                        .map(
                            (resource, index) =>
                                `<div class="taskItem">\n\n${index + 1}. ${resource.value.replace(/\\n/g, '\n\n')}\n\n</div>`,
                        )
                        .join(
                            '\n\n',
                        )}\n\n<div class="taskItem">\n\n${fullDetailsReasoning.length + 1}. **Outcome**\n\n${outcomeReasoning.value}\n\n</div></div>\n\n`
                    outcomeReasoningContent = ''
                } else if (hasFullDetails && !hasOutcome) {
                    fullDetailsReasoningContent = `<div class="fullDetailsContainer"><div class="fullDetailsHeader">Full details:</div>\n\n${fullDetailsReasoning
                        .map(
                            (resource, index) =>
                                `<div class="taskItem">\n\n${index + 1}. ${resource.value.replace(/\\n/g, '\n\n')}\n\n</div>`,
                        )
                        .join('\n\n')}</div>\n\n&nbsp;\n\n`
                } else if (!hasFullDetails && hasOutcome) {
                    outcomeReasoningContent = `**Outcome:**\n\n${outcomeReasoning.value}`
                }

                if (
                    !responseReasoningContent &&
                    !outcomeReasoningContent &&
                    !fullDetailsReasoningContent
                ) {
                    if (isHandover) {
                        return {
                            reasoningContent: '',
                            staticMessage:
                                'AI Agent was not confident in its answer and handed the ticket over to your team.',
                            reasoningResources: [],
                        }
                    }
                    if (messageAiReasoning.execution?.endDatetime) {
                        return {
                            reasoningContent: '',
                            staticMessage:
                                'Reasoning unavailable for this message.',
                            reasoningResources: [],
                        }
                    }
                }

                const content = [
                    responseReasoningContent,
                    fullDetailsReasoningContent,
                    outcomeReasoningContent,
                ]
                    .filter(Boolean)
                    .join('')

                return {
                    reasoningContent: content,
                    reasoningResources: [
                        ...parseReasoningResources(
                            responseReasoningContent,
                            messageAiReasoning.resources,
                        ),
                        ...fullDetailsReasoning.flatMap((taskReasoning) =>
                            parseReasoningResources(
                                taskReasoning.value,
                                messageAiReasoning.resources.filter(
                                    (resource) =>
                                        resource.taskIds?.includes(
                                            taskReasoning.targetId,
                                        ),
                                ),
                            ),
                        ),
                        ...parseReasoningResources(
                            outcomeReasoningContent,
                            messageAiReasoning.resources,
                        ),
                    ],
                }
            }
            return {
                reasoningContent: null,
                staticMessage: "Couldn't load reasoning. Please try again.",
                reasoningResources: [],
            }
        }, [
            messageAiReasoning?.reasoning,
            messageAiReasoning?.resources,
            messageAiReasoning?.execution?.endDatetime,
            messageAiReasoning?.usedTasks,
            messageAiReasoning?.canceledTasks,
            showReasoningForCanceledTasks,
            isHandover,
        ])

    const reasoningMetadata = useGetResourcesReasoningMetadata({
        queriesEnabled: enabled,
        resources: reasoningResources.filter(
            (resource): resource is NonNullable<typeof resource> =>
                resource !== null,
        ),
        storeConfiguration: messageAiReasoning?.storeConfiguration,
    })

    return {
        reasoningContent,
        reasoningResources,
        reasoningMetadata,
        staticMessage,
        storeConfiguration: messageAiReasoning?.storeConfiguration,
        isLoading:
            (!messageAiReasoning && enabled) ||
            (reasoningMetadata?.isLoading ?? false),
        isError,
        error,
        refetch: refetchMessageAiReasoning,
    }
}
