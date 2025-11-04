import { useCallback, useMemo, useRef, useState } from 'react'

import { LegacyButton as Button, LegacyLabel as Label } from '@gorgias/axiom'
import { FeedbackMutation } from '@gorgias/knowledge-service-types'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { Opportunity } from 'pages/aiAgent/opportunities/utils/mapAiArticlesToOpportunities'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
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
    onConfirm: () => void
    onOpportunityDismissed?: (context: {
        opportunityId: string
        opportunityType: string
    }) => void
}

const DISMISS_REASON_OPTIONS: Option[] = [
    {
        label: 'Topic shouldn’t be handled by AI Agent',
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
        label: 'Other (explain in additional feedback)',
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
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const targetRef = useRef<HTMLDivElement>(null)
    const floatingRef = useRef<HTMLDivElement>(null)

    const isOtherSelected = selectedReasons.some(
        (reason) => reason.value === OpportunityDismissReason.OTHER,
    )

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

    const selectedLabels = useMemo(() => {
        return selectedReasons.map((r) => r.label).join(', ')
    }, [selectedReasons])

    const { mutateAsync: upsertFeedback } = useUpsertFeedback(
        {
            objectType: FeedbackObjectType.OPPORTUNITY,
            objectId: opportunity?.id || '',
            executionId: '00000000-0000-0000-0000-000000000000', // Using a static execution ID for opportunities
        },
        {
            onSettled: () => {
                setIsSubmitting(false)
            },
        },
    )

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

    const handleConfirm = useCallback(async () => {
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

        try {
            await upsertFeedback({ data: feedbackData })

            resetForm()

            onOpportunityDismissed?.({
                opportunityId: opportunity.id,
                opportunityType: opportunity.type,
            })

            onConfirm()
            onClose()
        } catch (error) {
            console.error(
                'Failed to submit opportunity dismiss feedback:',
                error,
            )
            dispatch(
                notify({
                    message: 'Failed to submit feedback. Please try again.',
                    status: NotificationStatus.Error,
                }),
            )
            setIsSubmitting(false)
        }
    }, [
        opportunity,
        selectedReasons,
        feedbackData,
        upsertFeedback,
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
        <Modal
            isOpen={isOpen}
            onClose={handleCancel}
            size="small"
            isClosable={false}
        >
            <ModalHeader title="Dismiss opportunity?" />
            <ModalBody>
                <div className={css.modalContent}>
                    <div>
                        Dismissing this opportunity will delete the associated
                        knowledge and cannot be undone.
                    </div>

                    <div className={css.dropdownContainer}>
                        <Label>Why are you deleting this opportunity?</Label>
                        <SelectInputBox
                            floating={floatingRef}
                            label={selectedLabels}
                            onToggle={setIsDropdownOpen}
                            placeholder="Select all that apply"
                            ref={targetRef}
                            aria-expanded={isDropdownOpen}
                            aria-controls="dismiss-reasons-dropdown"
                        >
                            <SelectInputBoxContext.Consumer>
                                {(context: any) => (
                                    <Dropdown
                                        id="dismiss-reasons-dropdown"
                                        isMultiple
                                        isOpen={isDropdownOpen}
                                        onToggle={() => context?.onBlur()}
                                        ref={floatingRef}
                                        target={targetRef}
                                        value={selectedReasons.map(
                                            (reason) => reason.value,
                                        )}
                                    >
                                        <DropdownBody>
                                            {DISMISS_REASON_OPTIONS.map(
                                                (reason) => (
                                                    <DropdownItem
                                                        key={reason.value}
                                                        option={{
                                                            label: reason.label,
                                                            value: reason.value,
                                                        }}
                                                        onClick={() =>
                                                            handleReasonToggle(
                                                                reason,
                                                            )
                                                        }
                                                    />
                                                ),
                                            )}
                                        </DropdownBody>
                                    </Dropdown>
                                )}
                            </SelectInputBoxContext.Consumer>
                        </SelectInputBox>
                    </div>
                    {isOtherSelected && (
                        <div>
                            <TextArea
                                label="Additional feedback"
                                value={freeformText}
                                onChange={setFreeformText}
                                rows={3}
                                className={css.textArea}
                                isRequired={true}
                            />
                        </div>
                    )}
                </div>
            </ModalBody>
            <ModalActionsFooter>
                <Button intent="secondary" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button
                    intent="destructive"
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    isDisabled={isDismissDisabled}
                >
                    Dismiss
                </Button>
            </ModalActionsFooter>
        </Modal>
    )
}
