import { useMemo } from 'react'

import { isValidPhoneNumber } from 'libphonenumber-js'
import { useWatch } from 'react-hook-form'

import { ForwardToExternalNumberStep } from '@gorgias/helpdesk-types'

import { FormField } from 'core/forms'
import { NodeProps, NodeWrapper } from 'core/ui/flows'
import { StepCardIcon } from 'core/ui/flows/components/StepCardIcon'
import PhoneSelectField from 'pages/integrations/integration/components/phone/PhoneSelectField'

import { type ForwardToExternalNode } from '../types'
import { VoiceStepNode } from './VoiceStepNode'

type ForwardToNodeProps = NodeProps<ForwardToExternalNode>

export function ForwardToNode(props: ForwardToNodeProps) {
    const { id } = props.data
    const step: ForwardToExternalNumberStep | null = useWatch({
        name: `steps.${id}`,
    })
    const external_number = step?.external_number

    const errors = useMemo(() => {
        const errors: string[] = []
        if (!external_number) {
            errors.push('Phone number is required')
        } else if (!isValidPhoneNumber(external_number)) {
            errors.push('Invalid phone number')
        }

        return errors
    }, [external_number])

    if (!step) {
        return null
    }

    return (
        <NodeWrapper {...props}>
            <VoiceStepNode
                title="Forward to"
                description={external_number || 'Select phone number'}
                icon={
                    <StepCardIcon
                        backgroundColor="coral"
                        name="arrow-chevron-right-duo"
                    />
                }
                errors={errors}
                {...props}
            >
                <FormField
                    name={`steps.${id}.external_number`}
                    field={PhoneSelectField}
                    label={'Phone number'}
                />
            </VoiceStepNode>
        </NodeWrapper>
    )
}
