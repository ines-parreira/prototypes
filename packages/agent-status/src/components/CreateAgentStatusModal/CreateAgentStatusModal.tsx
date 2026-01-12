import { useCallback } from 'react'

import type { FormErrors } from '@repo/forms'
import { Form } from '@repo/forms'

import { Modal, ModalSize, OverlayHeader } from '@gorgias/axiom'

import { DURATION_OPTIONS } from '../../constants'
import type { DurationOption } from '../../types'
import { AgentStatusFormContent } from '../AgentStatusFormContent'
import type { CreateAgentStatusModalProps } from './types'

type AgentStatusFormValues = {
    name: string
    description: string
    durationOption: DurationOption
}

function validateAgentStatusForm(
    data: AgentStatusFormValues,
): FormErrors<AgentStatusFormValues> | undefined {
    const errors: FormErrors<AgentStatusFormValues> = {}

    if (!data.name || data.name.trim().length === 0) {
        errors.name = 'Status name is required'
    }

    return Object.keys(errors).length > 0 ? errors : undefined
}

/**
 * Modal for creating a new agent status.
 */
export function CreateAgentStatusModal({
    isOpen,
    onOpenChange,
    onCreate,
    isLoading,
}: CreateAgentStatusModalProps) {
    const handleCancel = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const handleValidSubmit = useCallback(
        (formValues: AgentStatusFormValues) => {
            onCreate?.({
                name: formValues.name,
                description: formValues.description,
                duration_unit: formValues.durationOption.unit,
                duration_value: formValues.durationOption.value,
            })
        },
        [onCreate],
    )

    return (
        <Modal isOpen={isOpen} onOpenChange={handleCancel} size={ModalSize.Md}>
            <Form<AgentStatusFormValues>
                key={isOpen ? 'open' : 'closed'}
                defaultValues={{
                    name: '',
                    description: '',
                    durationOption: DURATION_OPTIONS[0],
                }}
                validator={validateAgentStatusForm}
                onValidSubmit={handleValidSubmit}
            >
                <OverlayHeader title="Create status" />
                <AgentStatusFormContent
                    isLoading={isLoading}
                    onCancel={handleCancel}
                />
            </Form>
        </Modal>
    )
}
