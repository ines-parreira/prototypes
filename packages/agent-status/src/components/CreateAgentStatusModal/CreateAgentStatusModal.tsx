import { useCallback } from 'react'

import { Form } from '@repo/forms'
import type { FormErrors } from '@repo/forms'

import { Modal, ModalSize, OverlayHeader } from '@gorgias/axiom'
import type { DurationUnit } from '@gorgias/helpdesk-queries'

import { DURATION_LIMITS, DURATION_OPTIONS } from '../../constants'
import type { DurationOption } from '../../types'
import { AgentStatusFormContent } from '../AgentStatusFormContent'
import type { CreateAgentStatusModalProps } from './types'

type AgentStatusFormValues = {
    name: string
    description: string
    durationOption: DurationOption
    customDurationValue?: number
    customDurationUnit?: DurationUnit
}

function validateAgentStatusForm(
    data: AgentStatusFormValues,
): FormErrors<AgentStatusFormValues> | undefined {
    const errors: FormErrors<AgentStatusFormValues> = {}

    if (!data.name || data.name.trim().length === 0) {
        errors.name = 'Status name is required'
    }

    if (data.durationOption.id === 'custom') {
        if (!data.customDurationValue) {
            errors.customDurationValue = 'Duration value is required'
        }
        if (!data.customDurationUnit) {
            errors.customDurationUnit = 'Duration unit is required'
        }

        if (data.customDurationValue && data.customDurationUnit) {
            const limits = DURATION_LIMITS[data.customDurationUnit]
            if (
                data.customDurationValue < limits.min ||
                data.customDurationValue > limits.max
            ) {
                errors.customDurationValue = `Must be between ${limits.min} and ${limits.max} ${data.customDurationUnit}`
            }
        }
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
            const isCustom = formValues.durationOption.id === 'custom'

            onCreate?.({
                name: formValues.name,
                description: formValues.description,
                duration_unit: isCustom
                    ? formValues.customDurationUnit
                    : formValues.durationOption.unit,
                duration_value: isCustom
                    ? formValues.customDurationValue
                    : formValues.durationOption.value,
            })
        },
        [onCreate],
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleCancel}
            size={ModalSize.Md}
            aria-label="Create agent status"
        >
            <Form<AgentStatusFormValues>
                key={isOpen ? 'open' : 'closed'}
                defaultValues={{
                    name: '',
                    description: '',
                    durationOption: DURATION_OPTIONS[0],
                    customDurationValue: 1,
                    customDurationUnit: 'hours',
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
