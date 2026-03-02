import { useCallback, useMemo, useState } from 'react'

import { v4 as uuidv4 } from 'uuid'

import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import useAppSelector from 'hooks/useAppSelector'
import type { useUpsertFeedback } from 'models/knowledgeService/mutations'
import type { useGetFeedback } from 'models/knowledgeService/queries'
import { getTicketState } from 'state/ticket/selectors'

import { useGetAiAgentFeedback } from '../../../../../../models/aiAgentFeedback/queries'
import FeedbackInternalNote from '../FeedbackInternalNote'
import { FeedbackRating } from '../types'
import { AIAgentFeedbackRatingSection } from './AIAgentFeedbackRatingSection'
import { AIAgentFeedbackReasonSection } from './AIAgentFeedbackReasonSection'

import css from './AIAgentTicketLevelFeedback.less'

export type AIAgentTicketLevelFeedbackProps = {
    feedback: ReturnType<typeof useGetFeedback>['data']
    upsertFeedback: ReturnType<typeof useUpsertFeedback>['mutateAsync']
}

export const AIAgentTicketLevelFeedback = ({
    feedback,
    upsertFeedback,
}: AIAgentTicketLevelFeedbackProps) => {
    const [loadingMutations, setLoadingMutations] = useState<string[]>()
    const ticket = useAppSelector(getTicketState)
    const ticketId: number = ticket.get('id')

    const {
        freeFormFeedback,
        ticketRating,
        badInteractionReasons,
        lastUpdated,
    } = useMemo(() => {
        if (!feedback) return {}
        const feedbackItems = feedback.executions.flatMap((execution) =>
            execution.feedback.map((item) => ({
                ...item,
                executionId: execution.executionId,
            })),
        )
        const freeFormFeedback = feedbackItems.find(
            (feedback) => feedback.feedbackType === 'TICKET_FREEFORM',
        )
        const ticketRating = feedbackItems.find(
            (feedback) => feedback.feedbackType === 'TICKET_RATING',
        )
        const badInteractionReasons = feedbackItems.filter(
            (feedback) =>
                feedback.feedbackType === 'TICKET_BAD_INTERACTION_REASON',
        )

        const itemsToCheck = [
            ...badInteractionReasons,
            freeFormFeedback,
            ticketRating,
        ].filter(
            (
                item,
            ): item is
                | (typeof badInteractionReasons)[number]
                | NonNullable<typeof freeFormFeedback>
                | NonNullable<typeof ticketRating> => !!item,
        )

        const maxDate = itemsToCheck.reduce((acc, feedback) => {
            return Math.max(
                acc,
                feedback?.updatedDatetime
                    ? new Date(feedback.updatedDatetime).getTime()
                    : 0,
            )
        }, 0)

        return {
            freeFormFeedback,
            ticketRating,
            badInteractionReasons,
            lastUpdated: maxDate ? new Date(maxDate) : undefined,
        }
    }, [feedback])

    const { data: lastExecutionId } = useGetAiAgentFeedback<string | undefined>(
        {
            refetchOnWindowFocus: false,
            select: (data) =>
                data.data.messages
                    .reverse()
                    .find(({ executionId }) => !!executionId)?.executionId,
        },
    )

    const handleFeedbackChange = useCallback(
        async (
            data: {
                resourceType:
                    | 'TICKET_FREEFORM'
                    | 'TICKET_RATING'
                    | 'TICKET_BAD_INTERACTION_REASON'
                id?: number
                feedbackValue: string | null
            }[],
        ) => {
            if (data.length === 0) return

            const upsertId = data[0].id?.toString() ?? uuidv4()

            try {
                setLoadingMutations([...(loadingMutations ?? []), upsertId])

                const feedbackToUpsert = data
                    .map((item) => {
                        const executionId =
                            (item.resourceType === 'TICKET_FREEFORM'
                                ? freeFormFeedback?.executionId
                                : item.resourceType === 'TICKET_RATING'
                                  ? ticketRating?.executionId
                                  : item.resourceType ===
                                      'TICKET_BAD_INTERACTION_REASON'
                                    ? badInteractionReasons?.[0]?.executionId
                                    : null) ??
                            feedback?.executions?.[0]?.executionId ??
                            lastExecutionId

                        if (!executionId) return

                        return {
                            id: item.id,
                            objectId: ticketId.toString(),
                            executionId,
                            objectType: 'TICKET',
                            targetType: 'TICKET',
                            targetId: ticketId.toString(),
                            feedbackValue: item.feedbackValue,
                            feedbackType: item.resourceType,
                        }
                    })
                    .filter(Boolean) as FeedbackMutation[]

                if (feedbackToUpsert.length === 0) return

                await upsertFeedback({
                    data: {
                        feedbackToUpsert,
                    },
                })
            } catch (error) {
                console.error(error)
            } finally {
                setLoadingMutations((oldValue) =>
                    oldValue?.filter((id) => id !== upsertId),
                )
            }
        },
        [
            ticketId,
            upsertFeedback,
            freeFormFeedback,
            ticketRating,
            badInteractionReasons,
            loadingMutations,
            feedback?.executions,
            lastExecutionId,
        ],
    )

    const handleTicketFreeFormFeedbackChange = useCallback(
        async (value: string) => {
            await handleFeedbackChange([
                {
                    resourceType: 'TICKET_FREEFORM',
                    feedbackValue: value,
                    id: freeFormFeedback?.id,
                },
            ])
        },
        [handleFeedbackChange, freeFormFeedback?.id],
    )

    return (
        <div className={css.container}>
            <AIAgentFeedbackRatingSection
                loadingMutations={loadingMutations}
                lastUpdated={lastUpdated}
                ticketRating={ticketRating}
                badInteractionReasons={badInteractionReasons}
                handleFeedbackChange={handleFeedbackChange}
            />
            {[FeedbackRating.BAD, FeedbackRating.OK].includes(
                ticketRating?.feedbackValue as FeedbackRating,
            ) && (
                <AIAgentFeedbackReasonSection
                    handleFeedbackChange={handleFeedbackChange}
                    badInteractionReasons={badInteractionReasons}
                    loadingMutations={loadingMutations}
                />
            )}

            {!!ticketRating?.feedbackValue && (
                <FeedbackInternalNote
                    onDebouncedChange={handleTicketFreeFormFeedbackChange}
                    initialValue={freeFormFeedback?.feedbackValue ?? ''}
                />
            )}
        </div>
    )
}
