import { useCallback, useMemo, useRef } from 'react'

import classNames from 'classnames'

import { IconButton, Tooltip } from '@gorgias/axiom'
import { FindFeedbackObjectType } from '@gorgias/knowledge-service-types'

import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'

import { useFeedbackTracking } from '../AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { AiAgentBinaryFeedbackEnum } from '../AIAgentFeedbackBar/types'

import css from './AiAgentReasoning.less'

export type AiAgentReasoningFeedbackProps = {
    ticketId: number
    accountId: number
    userId: number
    executionId: string
    messageId: number
}

export const AiAgentReasoningFeedback = ({
    ticketId,
    accountId,
    userId,
    executionId,
    messageId,
}: AiAgentReasoningFeedbackProps) => {
    const thumbUpButtonRef = useRef<HTMLButtonElement>(null)
    const thumbDownButtonRef = useRef<HTMLButtonElement>(null)

    const { onFeedbackGiven } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

    const { data, isLoading } = useGetFeedback({
        objectType: FindFeedbackObjectType.Ticket,
        objectId: ticketId.toString(),
    })

    const reasoningFeedback = useMemo(() => {
        return data?.executions
            ?.find((execution) => execution.executionId === executionId)
            ?.feedback?.find(
                (feedback) =>
                    feedback.targetType === 'REASONING' &&
                    feedback.targetId === messageId.toString(),
            )
    }, [data, messageId, executionId])

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectId: ticketId.toString(),
        objectType: 'TICKET',
    })

    const handleReasoningFeedback = useCallback(
        async (feedback: AiAgentBinaryFeedbackEnum) => {
            if (
                isLoading ||
                reasoningFeedback?.feedbackValue === feedback ||
                !feedback
            )
                return

            try {
                await upsertFeedback({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: reasoningFeedback?.id,
                                objectId: ticketId.toString(),
                                objectType: 'TICKET',
                                executionId,
                                targetType: 'REASONING',
                                targetId: messageId.toString(),
                                feedbackValue: feedback,
                                feedbackType: 'REASONING_BINARY',
                            },
                        ],
                    },
                })
                onFeedbackGiven(feedback)
            } catch {
                // Let React Query handle the error internally
            }
        },
        [
            onFeedbackGiven,
            upsertFeedback,
            reasoningFeedback,
            isLoading,
            executionId,
            ticketId,
            messageId,
        ],
    )

    return (
        <div className={css.feedbackSection}>
            <span className={css.feedbackText}>
                Rate the quality of this reasoning
            </span>
            <div className={css.feedbackButtons}>
                <IconButton
                    ref={thumbUpButtonRef}
                    icon="thumb_up"
                    fillStyle="fill"
                    intent="secondary"
                    size="small"
                    iconClassName={
                        reasoningFeedback?.feedbackValue ===
                        AiAgentBinaryFeedbackEnum.UP
                            ? 'material-icons'
                            : 'material-icons-outlined'
                    }
                    className={classNames(css.feedbackIcon, {
                        [css.positiveFeedback]:
                            reasoningFeedback?.feedbackValue ===
                            AiAgentBinaryFeedbackEnum.UP,
                    })}
                    onClick={() =>
                        handleReasoningFeedback(AiAgentBinaryFeedbackEnum.UP)
                    }
                />
                <Tooltip target={thumbUpButtonRef} placement="top">
                    Quality is good
                </Tooltip>
                <IconButton
                    ref={thumbDownButtonRef}
                    icon="thumb_down"
                    fillStyle="fill"
                    intent="secondary"
                    size="small"
                    iconClassName={
                        reasoningFeedback?.feedbackValue ===
                        AiAgentBinaryFeedbackEnum.DOWN
                            ? 'material-icons'
                            : 'material-icons-outlined'
                    }
                    className={classNames(css.feedbackIcon, {
                        [css.negativeFeedback]:
                            reasoningFeedback?.feedbackValue ===
                            AiAgentBinaryFeedbackEnum.DOWN,
                    })}
                    onClick={() =>
                        handleReasoningFeedback(AiAgentBinaryFeedbackEnum.DOWN)
                    }
                />
                <Tooltip target={thumbDownButtonRef} placement="top">
                    Quality is bad
                </Tooltip>
            </div>
        </div>
    )
}
