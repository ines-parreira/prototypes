import { useCallback, useMemo, useState } from 'react'

import {
    Button,
    CheckBoxField,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'
import type { FeedbackMutation } from '@gorgias/knowledge-service-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import TextArea from 'pages/common/forms/TextArea'
import { getCurrentUserId } from 'state/currentUser/selectors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import {
    FeedbackObjectType,
    FeedbackTargetType,
    OpportunityDismissReason,
    OpportunityFeedbackType,
} from '../../../../tickets/detail/components/AIAgentFeedbackBar/types'

import css from './DismissOpportunityModal.less'

interface DismissOpportunityModalProps {
    isOpen: boolean
    opportunity: Opportunity | null
    onClose: () => void
    onConfirm: (feedbackData: { feedbackToUpsert: FeedbackMutation[] }) => void
    onOpportunityDismissed?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
}

const DISMISS_REASON_OPTIONS: Option[] = [
    {
        label: 'Topic shouldn’t be handled by AI',
        value: OpportunityDismissReason.NOT_FOR_AI_AGENT,
    },
    {
        label: 'Knowledge for this topic already exists',
        value: OpportunityDismissReason.TOPIC_ALREADY_EXISTS,
    },
    {
        label: 'Content is inaccurate',
        value: OpportunityDismissReason.INCORRECT_SUGGESTION,
    },
    {
        label: 'Opportunity is irrelevant',
        value: OpportunityDismissReason.IRRELEVANT_OPPORTUNITY,
    },
    {
        label: 'Other',
        value: OpportunityDismissReason.OTHER,
    },
]

export const DismissOpportunityModal = ({
    isOpen,
    opportunity,
    onClose,
    onConfirm,
    onOpportunityDismissed,
}: DismissOpportunityModalProps) => {
    const dispatch = useAppDispatch()
    const userId = useAppSelector(getCurrentUserId)
    const [selectedReasons, setSelectedReasons] = useState<Option[]>([])
    const [freeformText, setFreeformText] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isOtherSelected = selectedReasons.some(
        (reason) => reason.value === OpportunityDismissReason.OTHER,
    )

    const isReasonSelected = (reason: Option) =>
        selectedReasons.some((r) => reason.value === r.value)

    const handleReasonToggle = useCallback(
        (reason: Option) => {
            setSelectedReasons((prevSelected) => {
                const isSelected = prevSelected.some(
                    (r) => r.value === reason.value,
                )
                if (isSelected) {
                    const otherSelected = prevSelected.some(
                        (reason) =>
                            reason.value === OpportunityDismissReason.OTHER,
                    )
                    if (otherSelected) {
                        setFreeformText('')
                    }

                    return prevSelected.filter((r) => r.value !== reason.value)
                }

                return [...prevSelected, reason]
            })
        },
        [setSelectedReasons],
    )
    const resetForm = useCallback(() => {
        setSelectedReasons([])
        setFreeformText('')
    }, [])

    const feedbackData = useMemo(() => {
        if (!opportunity || !userId) return { feedbackToUpsert: [] }

        const feedback: FeedbackMutation[] = []

        selectedReasons.forEach((reason) => {
            feedback.push({
                objectType: FeedbackObjectType.OPPORTUNITY,
                objectId: opportunity.id,
                executionId: '00000000-0000-0000-0000-000000000000',
                targetType: FeedbackTargetType.OPPORTUNITY,
                targetId: opportunity.id,
                feedbackType:
                    OpportunityFeedbackType.OPPORTUNITY_DISMISS_REASON,
                feedbackValue: reason.value,
            })
        })

        if (isOtherSelected && freeformText.trim()) {
            feedback.push({
                objectType: FeedbackObjectType.OPPORTUNITY,
                objectId: opportunity.id,
                executionId: '00000000-0000-0000-0000-000000000000',
                targetType: FeedbackTargetType.OPPORTUNITY,
                targetId: opportunity.id,
                feedbackType: OpportunityFeedbackType.OPPORTUNITY_FREEFORM,
                feedbackValue: freeformText.trim(),
            })
        }

        return { feedbackToUpsert: feedback }
    }, [opportunity, selectedReasons, freeformText, userId, isOtherSelected])

    const handleConfirm = useCallback(() => {
        if (
            !opportunity ||
            selectedReasons.length === 0 ||
            !feedbackData ||
            !feedbackData.feedbackToUpsert ||
            feedbackData.feedbackToUpsert.length === 0
        ) {
            dispatch(
                notify({
                    message:
                        'Please select at least one reason for dismissing this opportunity.',
                    status: NotificationStatus.Error,
                }),
            )
            return
        }

        if (isOtherSelected && !freeformText.trim()) {
            dispatch(
                notify({
                    message:
                        'Please provide additional feedback when selecting "Other" as a reason.',
                    status: NotificationStatus.Error,
                }),
            )
            return
        }

        setIsSubmitting(true)

        resetForm()

        onOpportunityDismissed?.({
            opportunityId: opportunity.id,
            opportunityType: opportunity.type,
        })

        onConfirm(feedbackData)
        onClose()
    }, [
        opportunity,
        selectedReasons,
        feedbackData,
        onOpportunityDismissed,
        onConfirm,
        onClose,
        dispatch,
        resetForm,
        isOtherSelected,
        freeformText,
    ])

    const handleCancel = useCallback(() => {
        resetForm()
        onClose()
    }, [onClose, resetForm])

    const isDismissDisabled =
        selectedReasons.length === 0 ||
        (isOtherSelected && freeformText.trim() === '')

    return (
        <Modal isOpen={isOpen} onOpenChange={handleCancel} size="sm">
            <OverlayHeader title="Dismiss opportunity?" />
            <OverlayContent>
                <div className={css.modalContent}>
                    <Text>
                        Dismissing this knowledge gap opportunity will delete
                        the generated Guidance and cannot be undone.
                    </Text>

                    <div className={css.checkboxContainer}>
                        <Text variant="medium">
                            Why are you dismissing this opportunity?
                        </Text>

                        {DISMISS_REASON_OPTIONS.map((reason) => (
                            <CheckBoxField
                                key={reason.value}
                                value={isReasonSelected(reason)}
                                onChange={() => handleReasonToggle(reason)}
                                label={reason.label}
                            />
                        ))}
                        {isOtherSelected && (
                            <TextArea
                                placeholder="Provide additional details"
                                value={freeformText}
                                onChange={setFreeformText}
                                rows={2}
                                isRequired={true}
                            />
                        )}
                    </div>
                </div>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button
                    variant="primary"
                    intent="destructive"
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    isDisabled={isDismissDisabled}
                >
                    Dismiss
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
