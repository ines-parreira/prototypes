import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useFeedbackTracking } from '@repo/ai-agent'
import { useDebouncedCallback, useDebouncedEffect } from '@repo/hooks'
import classNames from 'classnames'

import {
    LegacyCheckBoxField as CheckBoxField,
    LegacyIconButton as IconButton,
    LegacyLabel as Label,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'
import { FindFeedbackObjectType } from '@gorgias/knowledge-service-types'

import TextArea from 'gorgias-design-system/Input/TextArea'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'

import AutoSaveBadge from '../AIAgentFeedbackBar/AutoSaveBadge'
import {
    AiAgentBinaryFeedbackEnum,
    AutoSaveState,
} from '../AIAgentFeedbackBar/types'

import css from './AiAgentReasoning.less'

const feedbackOptions = [
    { value: 'TOO_LONG', label: 'Too long to read' },
    { value: 'REPETITIVE', label: 'Contains repetitive information' },
    {
        value: 'MISSING_REFERENCES',
        label: 'Missing knowledge source references',
    },
    {
        value: 'MENTIONS_EXCLUDED_ACTIONS',
        label: 'Mentions actions not included in reply',
    },
    {
        value: 'UNCLEAR_DECISION',
        label: 'Unclear decision-making explanation',
    },
    { value: 'OTHER', label: 'Other' },
]

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
    const [selectedReasons, setSelectedReasons] = useState<string[]>([])
    const [otherFeedbackText, setOtherFeedbackText] = useState('')
    const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>(
        AutoSaveState.INITIAL,
    )
    const [lastUpdated, setLastUpdated] = useState<Date | undefined>()
    const [isMutating, setIsMutating] = useState(false)
    const isMutatingRef = useRef(false)
    const pendingChangesRef = useRef<
        | {
              reason: string
              checked: boolean
          }[]
        | null
    >(null)

    const { onFeedbackGiven } = useFeedbackTracking({
        ticketId,
        accountId,
        userId,
    })

    const { data, isLoading } = useGetFeedback(
        {
            objectType: FindFeedbackObjectType.Ticket,
            objectId: ticketId?.toString() ?? '',
        },
        {
            enabled: !!ticketId,
        },
    )

    const reasoningFeedback = useMemo(() => {
        return data?.executions
            ?.flatMap((execution) => execution.feedback)
            ?.find(
                (feedback) =>
                    feedback.targetType === 'REASONING' &&
                    feedback.targetId === messageId.toString() &&
                    feedback.feedbackType === 'REASONING_BINARY',
            )
    }, [data, messageId])

    const existingReasonFeedback = useMemo(() => {
        return (
            data?.executions
                ?.flatMap((execution) => execution.feedback)
                ?.filter(
                    (feedback) =>
                        feedback.targetType === 'REASONING' &&
                        feedback.targetId === messageId.toString() &&
                        feedback.feedbackType ===
                            'REASONING_BAD_EXPLANATION_REASON',
                ) || []
        )
    }, [data, messageId])

    const existingFreeformFeedback = useMemo(() => {
        return data?.executions
            ?.flatMap((execution) => execution.feedback)
            ?.find(
                (feedback) =>
                    feedback.targetType === 'REASONING' &&
                    feedback.targetId === messageId.toString() &&
                    feedback.feedbackType === 'REASONING_FREEFORM',
            )
    }, [data, messageId])

    const showFeedbackForm =
        reasoningFeedback?.feedbackValue === AiAgentBinaryFeedbackEnum.DOWN
    const isOtherSelected = selectedReasons.includes('OTHER')

    const { mutateAsync: upsertFeedback } = useUpsertFeedback({
        objectId: ticketId?.toString() ?? '',
        objectType: 'TICKET',
    })

    const processFeedbackChanges = useCallback(
        async (changes: { reason: string; checked: boolean }[]) => {
            if (changes.length === 0) return
            setIsMutating(true)
            setAutoSaveState(AutoSaveState.SAVING)

            try {
                const feedbackToUpsert = changes.map(({ reason, checked }) => {
                    const existingFeedback = existingReasonFeedback.find(
                        (f) => f.feedbackValue === reason,
                    )
                    return {
                        ...(existingFeedback?.id
                            ? { id: existingFeedback.id }
                            : {}),
                        objectId: ticketId.toString(),
                        objectType: 'TICKET' as const,
                        executionId,
                        targetType: 'REASONING' as const,
                        targetId: messageId.toString(),
                        feedbackValue: checked ? reason : null,
                        feedbackType:
                            'REASONING_BAD_EXPLANATION_REASON' as const,
                    }
                })
                await upsertFeedback({
                    data: {
                        feedbackToUpsert,
                    },
                })

                setAutoSaveState(AutoSaveState.SAVED)
                setLastUpdated(new Date())
            } catch {
                setAutoSaveState(AutoSaveState.INITIAL)
            } finally {
                setIsMutating(false)
            }
        },
        [
            upsertFeedback,
            ticketId,
            executionId,
            messageId,
            existingReasonFeedback,
        ],
    )

    const debouncedProcessFeedbackChanges = useDebouncedCallback(
        async (changes: { reason: string; checked: boolean }[]) => {
            if (!changes || changes.length === 0 || isMutatingRef.current) {
                return
            }
            pendingChangesRef.current = null
            await processFeedbackChanges(changes)
        },
        700,
    )

    const handleReasoningFeedback = useCallback(
        async (feedback: AiAgentBinaryFeedbackEnum) => {
            if (
                isLoading ||
                reasoningFeedback?.feedbackValue === feedback ||
                !feedback
            )
                return

            try {
                const feedbackToUpsert: any[] = [
                    {
                        id: reasoningFeedback?.id,
                        objectId: ticketId.toString(),
                        objectType: 'TICKET' as const,
                        executionId,
                        targetType: 'REASONING' as const,
                        targetId: messageId.toString(),
                        feedbackValue: feedback,
                        feedbackType: 'REASONING_BINARY' as const,
                    },
                ]

                if (feedback === AiAgentBinaryFeedbackEnum.UP) {
                    existingReasonFeedback.forEach((reasonFeedback) => {
                        feedbackToUpsert.push({
                            id: reasonFeedback.id,
                            objectId: ticketId.toString(),
                            objectType: 'TICKET' as const,
                            executionId,
                            targetType: 'REASONING' as const,
                            targetId: messageId.toString(),
                            feedbackValue: null,
                            feedbackType:
                                'REASONING_BAD_EXPLANATION_REASON' as const,
                        })
                    })

                    if (existingFreeformFeedback) {
                        feedbackToUpsert.push({
                            id: existingFreeformFeedback.id,
                            objectId: ticketId.toString(),
                            objectType: 'TICKET' as const,
                            executionId,
                            targetType: 'REASONING' as const,
                            targetId: messageId.toString(),
                            feedbackValue: null,
                            feedbackType: 'REASONING_FREEFORM' as const,
                        })
                    }

                    setSelectedReasons([])
                    setOtherFeedbackText('')
                }

                await upsertFeedback({
                    data: {
                        feedbackToUpsert,
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
            existingReasonFeedback,
            existingFreeformFeedback,
        ],
    )

    const handleCheckboxChange = useCallback(
        (reason: string, checked: boolean) => {
            const newReasons = checked
                ? [...selectedReasons, reason]
                : selectedReasons.filter((r) => r !== reason)
            setSelectedReasons(newReasons)

            const change = { reason, checked }

            const currentPending = pendingChangesRef.current || []
            const filteredPending = currentPending.filter(
                (c) => c.reason !== reason,
            )
            pendingChangesRef.current = [...filteredPending, change]

            if (reason === 'OTHER' && !checked && existingFreeformFeedback) {
                setOtherFeedbackText('') // Clear the textarea
                setAutoSaveState(AutoSaveState.SAVING)
                upsertFeedback({
                    data: {
                        feedbackToUpsert: [
                            {
                                id: existingFreeformFeedback.id,
                                objectId: ticketId.toString(),
                                objectType: 'TICKET',
                                executionId,
                                targetType: 'REASONING',
                                targetId: messageId.toString(),
                                feedbackValue: null,
                                feedbackType: 'REASONING_FREEFORM',
                            },
                        ],
                    },
                })
                    .then(() => {
                        setAutoSaveState(AutoSaveState.SAVED)
                        setLastUpdated(new Date())
                    })
                    .catch(() => {
                        setAutoSaveState(AutoSaveState.INITIAL)
                    })
            }

            debouncedProcessFeedbackChanges(pendingChangesRef.current)
        },
        [
            selectedReasons,
            debouncedProcessFeedbackChanges,
            existingFreeformFeedback,
            upsertFeedback,
            ticketId,
            executionId,
            messageId,
        ],
    )

    useDebouncedEffect(
        () => {
            if (isOtherSelected && otherFeedbackText) {
                setAutoSaveState(AutoSaveState.SAVING)
                upsertFeedback({
                    data: {
                        feedbackToUpsert: [
                            {
                                ...(existingFreeformFeedback?.id
                                    ? { id: existingFreeformFeedback.id }
                                    : {}),
                                objectId: ticketId.toString(),
                                objectType: 'TICKET',
                                executionId,
                                targetType: 'REASONING',
                                targetId: messageId.toString(),
                                feedbackValue: otherFeedbackText,
                                feedbackType: 'REASONING_FREEFORM',
                            },
                        ],
                    },
                })
                    .then(() => {
                        setAutoSaveState(AutoSaveState.SAVED)
                        setLastUpdated(new Date())
                    })
                    .catch(() => {
                        setAutoSaveState(AutoSaveState.INITIAL)
                    })
            }
        },
        [otherFeedbackText, isOtherSelected, existingFreeformFeedback],
        1500,
    )

    const handleOtherTextChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement> | string) => {
            const newValue = typeof e === 'string' ? e : e.target.value
            setOtherFeedbackText(newValue)
            if (newValue !== otherFeedbackText) {
                setAutoSaveState(AutoSaveState.INITIAL)
            }
        },
        [otherFeedbackText],
    )

    useEffect(() => {
        if (existingReasonFeedback.length > 0) {
            const existingReasons = existingReasonFeedback
                .map((feedback) => feedback.feedbackValue)
                .filter((value): value is string => typeof value === 'string')
            setSelectedReasons(existingReasons)
        } else {
            setSelectedReasons([])
        }
    }, [existingReasonFeedback])

    useEffect(() => {
        if (
            existingFreeformFeedback?.feedbackValue &&
            typeof existingFreeformFeedback.feedbackValue === 'string'
        ) {
            setOtherFeedbackText(existingFreeformFeedback.feedbackValue)
        } else {
            setOtherFeedbackText('')
        }
    }, [existingFreeformFeedback])

    useEffect(() => {
        isMutatingRef.current = isMutating
    }, [isMutating])

    useEffect(() => {
        if (
            !isMutating &&
            pendingChangesRef.current !== null &&
            pendingChangesRef.current.length > 0
        ) {
            const changesToProcess = pendingChangesRef.current
            pendingChangesRef.current = null
            processFeedbackChanges(changesToProcess)
        }
    }, [isMutating, processFeedbackChanges])

    return (
        <>
            <div className={css.feedbackSection}>
                <span className={css.feedbackText}>
                    Rate how well this explains AI Agent&apos;s response
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
                            handleReasoningFeedback(
                                AiAgentBinaryFeedbackEnum.UP,
                            )
                        }
                    />
                    <Tooltip target={thumbUpButtonRef} placement="top">
                        Well explained
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
                            handleReasoningFeedback(
                                AiAgentBinaryFeedbackEnum.DOWN,
                            )
                        }
                    />
                    <Tooltip target={thumbDownButtonRef} placement="top">
                        Not well explained
                    </Tooltip>
                </div>
            </div>
            {showFeedbackForm && (
                <div className={css.feedbackForm}>
                    <div className={css.feedbackFormHeaderContainer}>
                        <Label className={css.feedbackFormHeader}>
                            What&apos;s wrong with this explanation?
                        </Label>
                        <AutoSaveBadge
                            state={autoSaveState}
                            updatedAt={lastUpdated}
                        />
                    </div>
                    <div className={css.feedbackOptions}>
                        {feedbackOptions.map((option) => (
                            <CheckBoxField
                                key={option.value}
                                label={option.label}
                                value={selectedReasons.includes(option.value)}
                                isDisabled={
                                    option.value === 'OTHER' &&
                                    otherFeedbackText.trim() !== ''
                                }
                                onChange={() =>
                                    handleCheckboxChange(
                                        option.value,
                                        !selectedReasons.includes(option.value),
                                    )
                                }
                                className={css.feedbackCheckbox}
                            />
                        ))}
                    </div>
                    {isOtherSelected && (
                        <div className={css.feedbackTextArea}>
                            <TextArea
                                id="reasoning-feedback-other-text"
                                name="otherFeedbackText"
                                isValid
                                rows={3}
                                onChange={handleOtherTextChange}
                                value={otherFeedbackText}
                                placeholder="Please provide more details..."
                            />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
