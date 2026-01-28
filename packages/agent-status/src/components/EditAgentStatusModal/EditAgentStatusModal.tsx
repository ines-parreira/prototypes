import { useCallback } from 'react'

import { Form } from '@repo/forms'

import { Modal, ModalSize, OverlayHeader } from '@gorgias/axiom'

import type { AgentStatusFormValues } from '../../hooks/useAgentStatusFormDefaults'
import { useAgentStatusFormDefaults } from '../../hooks/useAgentStatusFormDefaults'
import { validateAgentStatusForm } from '../../utils'
import { AgentStatusFormContent } from '../AgentStatusFormContent'
import type { EditAgentStatusModalProps } from './types'

/**
 * Modal for editing an existing agent status.
 * Business logic (mutations, notifications) should be handled by the consumer.
 */
export function EditAgentStatusModal({
    isOpen,
    onOpenChange,
    status,
    onSubmit,
    isLoading,
}: EditAgentStatusModalProps) {
    const handleCancel = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const defaultValues = useAgentStatusFormDefaults(status)

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

            onSubmit(data, status)
        },
        [onSubmit, status],
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleCancel}
            size={ModalSize.Md}
            aria-label="Edit status"
        >
            <Form<AgentStatusFormValues>
                key={isOpen ? 'open' : 'closed'}
                defaultValues={defaultValues}
                validator={validateAgentStatusForm}
                onValidSubmit={handleValidSubmit}
            >
                <OverlayHeader title="Edit status" />
                <AgentStatusFormContent
                    isLoading={isLoading}
                    onCancel={handleCancel}
                    submitButtonText="Save changes"
                />
            </Form>
        </Modal>
    )
}
