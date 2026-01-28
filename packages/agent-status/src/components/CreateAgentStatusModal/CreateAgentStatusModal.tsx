import { useCallback } from 'react'

import { Form } from '@repo/forms'

import { Modal, ModalSize, OverlayHeader } from '@gorgias/axiom'

import type { AgentStatusFormValues } from '../../hooks/useAgentStatusFormDefaults'
import { useAgentStatusFormDefaults } from '../../hooks/useAgentStatusFormDefaults'
import { validateAgentStatusForm } from '../../utils'
import { AgentStatusFormContent } from '../AgentStatusFormContent'
import type { CreateAgentStatusModalProps } from './types'

/**
 * Modal for creating a new agent status.
 * Business logic (mutations, notifications) should be handled by the consumer.
 */
export function CreateAgentStatusModal({
    isOpen,
    onOpenChange,
    onSubmit,
    isLoading,
}: CreateAgentStatusModalProps) {
    const handleCancel = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const defaultValues = useAgentStatusFormDefaults()

    const handleValidSubmit = useCallback(
        (formValues: AgentStatusFormValues) => {
            const isCustom = formValues.durationOption.id === 'custom'

            const durationUnit = isCustom
                ? formValues.customDurationUnit
                : formValues.durationOption.unit
            const durationValue = isCustom
                ? formValues.customDurationValue
                : formValues.durationOption.value

            const data = {
                name: formValues.statusName,
                description: formValues.description,
                duration_unit: durationUnit,
                duration_value: durationValue,
            }

            onSubmit(data)
        },
        [onSubmit],
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleCancel}
            size={ModalSize.Md}
            aria-label="Create status"
        >
            <Form<AgentStatusFormValues>
                key={isOpen ? 'open' : 'closed'}
                defaultValues={defaultValues}
                validator={validateAgentStatusForm}
                onValidSubmit={handleValidSubmit}
            >
                <OverlayHeader title="Create status" />
                <AgentStatusFormContent
                    isLoading={isLoading}
                    onCancel={handleCancel}
                    submitButtonText="Create status"
                    description="Create a new custom agent unavailable status to better track team activity and improve visibility into how time is spent."
                />
            </Form>
        </Modal>
    )
}
