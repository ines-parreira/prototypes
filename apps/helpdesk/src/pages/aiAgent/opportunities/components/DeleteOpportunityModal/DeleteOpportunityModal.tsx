import { useCallback, useEffect, useState } from 'react'

import {
    Button,
    CheckBoxField,
    Modal,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
} from '@gorgias/axiom'

import type { Opportunity } from 'pages/aiAgent/opportunities/types'

import css from './DeleteOpportunityModal.less'

interface DeleteOpportunityModalProps {
    isOpen: boolean
    opportunity: Opportunity | null
    onClose: () => void
    onConfirm: () => void
}

export const DeleteOpportunityModal = ({
    isOpen,
    opportunity,
    onClose,
    onConfirm,
}: DeleteOpportunityModalProps) => {
    const [isConfirmed, setIsConfirmed] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setIsSubmitting(false)
            setIsConfirmed(false)
        }
    }, [isOpen])

    const handleConfirm = useCallback(() => {
        if (!opportunity || !isConfirmed) {
            return
        }

        setIsSubmitting(true)
        onConfirm()
    }, [opportunity, isConfirmed, onConfirm])

    const handleCancel = useCallback(() => {
        onClose()
    }, [onClose])

    return (
        <Modal isOpen={isOpen} onOpenChange={handleCancel} size="sm">
            <OverlayHeader title="Delete this content?" />
            <OverlayContent>
                <div className={css.modalContent}>
                    <Text>
                        Deleting this content will remove it from AI Agent’s
                        available knowledge and resolve the conflict. This
                        action can’t be undone.
                    </Text>

                    <div className={css.checkboxContainer}>
                        <CheckBoxField
                            value={isConfirmed}
                            onChange={() => setIsConfirmed(!isConfirmed)}
                            label="I understand this action cannot be undone"
                        />
                    </div>
                </div>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <Button
                    variant="primary"
                    intent="destructive"
                    onClick={handleConfirm}
                    isLoading={isSubmitting}
                    isDisabled={!isConfirmed}
                >
                    Delete
                </Button>
            </OverlayFooter>
        </Modal>
    )
}
